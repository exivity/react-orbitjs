import Store from '@orbit/store'

import {
  Options,
  Queries,
  Term,
  OngoingQueries,
  RecordObject,
  QueryResults,
  Interests,
  Expressions
} from './types'
import { Transform, RecordOperation, FindRecord, RecordIdentity, QueryBuilder } from '@orbit/data';
import { identityIsEqual } from './helpers';


export class QueryManager<E extends { [ongoingQueryKey: string]: any } = any>  {
  _extensions: E
  _store: Store
  _storeSnapshot: Store
  _queryCache: QueryResults
  _ongoingQueries: OngoingQueries

  constructor (orbitStore: Store, extensions?: E) {

    this._extensions = extensions || {} as E
    this._store = orbitStore
    this._storeSnapshot = orbitStore.fork()
    this._queryCache = {}
    this._ongoingQueries = {}
  }

  query (queries: Queries, options: Options<E> = {}) {
    const terms = Object.keys(queries).sort().map(
      (key) => ({ key, expression: queries[key](this._store.queryBuilder).expression as Expressions })
    )

    let ongoingQueryKey = JSON.stringify(terms)

    terms.forEach(({ expression }) => {
      options.beforeQuery && options.beforeQuery(expression, this._extensions)
    })

    if (!this._ongoingQueries[ongoingQueryKey]) {
      this._query(ongoingQueryKey, terms)
    }

    this._ongoingQueries[ongoingQueryKey].listeners++

    return this._ongoingQueries[ongoingQueryKey].queryRef
  }

  subscribe (queryRef: string, listener: () => void, options: Options<E>) {
    this._queryCache[queryRef].listeners++

    const ongoingQueryKey = this._getOngoingQueryKey(queryRef)
    if (ongoingQueryKey) {
      this._subscribeToRequest(ongoingQueryKey, listener, options)
    } else {
      this._subscribeToCache(queryRef, listener, options)
    }
  }

  unsubscribe (queryRef: string) {
    this._queryCache[queryRef].listeners--

    if (this._queryCache[queryRef].listeners === 0) {
      delete this._queryCache[queryRef]
    }
  }

  _query (ongoingQueryKey: string, terms: Term[]) {
    const queryRef = this._generateQueryRef(ongoingQueryKey)

    this._queryCache[queryRef] = { error: null, loading: true, listeners: 0, result: null, terms }

    const queries: Promise<RecordObject>[] = terms
      .map(({ key, expression }) =>
        new Promise((resolve, reject) => {
          this._store.query(expression)
            .then(record => resolve({ [key]: record }))
            .catch(reject)
        })
      )

    const self = this
    Promise.all(queries)
      .then((results) => {
        self._queryCache[queryRef].loading = false
        self._queryCache[queryRef].result = results.reduce((acc, result) => ({ ...acc, ...result }), {})
      })
      .catch(error => {
        self._queryCache[queryRef].loading = false
        self._queryCache[queryRef].error = error
      })

    this._ongoingQueries[ongoingQueryKey] = { queries, listeners: 0, queryRef }
  }

  _generateQueryRef (ongoingQueryKey: string) {
    let i = 1
    while (true) {
      const queryRef = ongoingQueryKey + `_${i}`
      if (!this._queryCache[queryRef]) return queryRef
      else i++
    }
  }

  _subscribeToRequest (ongoingQueryKey: string, listener: () => void, options: Options<E>) {
    this._ongoingQueries[ongoingQueryKey].listeners++

    const self = this
    Promise.all(this._ongoingQueries[ongoingQueryKey].queries)
      .then((results) => self._onQueryResolve(results, ongoingQueryKey, listener, options))
      .catch(error => self._onQueryError(error, ongoingQueryKey, listener, options))
  }

  _subscribeToCache (queryRef: string, listener: () => void, options: Options<E>) {
    this._store.on("transform", this._handleTransform.bind(this, queryRef, listener))

  }

  _handleTransform (queryRef: string, listener: () => void, transform: Transform, ) {
    // Iterate all transforms, to see if any of those matches a model in the list of queries
    interface RelatedRecords {
      owner: RecordIdentity
      relationship: string
      inverse: string
      identity: RecordIdentity | null
      type: 'hasOne' | 'hasMany'
    }
    const records: RecordIdentity[] = []
    const relatedRecords: RelatedRecords[] = []



    const models = this._store.schema.models
    const operations = transform.operations as RecordOperation[]

    operations.forEach(operation => {
      operation && operation.record && records.push(operation.record)

      switch (operation.op) {
        case "addToRelatedRecords":
        case "removeFromRelatedRecords":
        case "replaceRelatedRecord":
          // Add both record and relatedRecord to records, because
          // it can modify both its relationships and inverse relationships.
          relatedRecords.push({
            owner: operation.record,
            relationship: operation.relationship,
            inverse: models[operation.record.type].relationships![operation.relationship].type,
            identity: operation.relatedRecord,
            type: models[operation.record.type].relationships![operation.relationship].type
          })
          break

        case "replaceRelatedRecords":
          operation.relatedRecords
            .forEach((relatedRecord) => {
              relatedRecords.push({
                owner: operation.record,
                relationship: operation.relationship,
                inverse: models[operation.record.type].relationships![operation.relationship].type,
                identity: relatedRecord,
                type: models[operation.record.type].relationships![operation.relationship].type
              })
            })
          break

        default:
          console.warn("This transform operation is not supported in react-orbitjs.")
      }
    })

    const terms = this._queryCache[queryRef].terms

    const uniqueRecords = new Set(records)
    const uniqueRelatedRecords = new Set(relatedRecords)

    let shouldUpdate = false
    terms.forEach(({ expression }) => {
      // if it isn't determined if it should update keep checking
      if (!shouldUpdate) {
        if (expression.op === 'findRecords') {
          /* To be implemented*/
        } else {
          const relationships = models[expression.record.type].relationships

          // if record is updated in any way it should update
          uniqueRecords
            .forEach(record => {
              if (identityIsEqual(expression.record, record)) {
                shouldUpdate = true
              }
            })

          // if record is replaced, deleted from or added to another models relationships it should update
          if (relationships) {
            uniqueRelatedRecords
              .forEach(({ owner, identity, relationship, type, inverse }) => {
                if (relationships[inverse]) {

                  let oldRelatedRecord
                  if (type === 'hasMany') {
                    oldRelatedRecord = this._storeSnapshot.cache.query(q => q.findRelatedRecords(owner, relationship)
                      .filter({ record: identity })
                    )[0]
                  } else oldRelatedRecord = this._storeSnapshot.cache.query(q => q.findRelatedRecord(owner, relationship))

                  // if oldRelatedRecord is the record being listened to trigger an update
                  if (identityIsEqual(oldRelatedRecord, expression.record)) {
                    shouldUpdate = true
                  }
                }
              })
          }
        }
      }
    })
  }

  _onQueryResolve (results: RecordObject[], ongoingQueryKey: string, listener: () => void, options: Options<E>) {
    const resultObject = results.reduce((acc, result) => ({ ...acc, ...result }), {})
    if (options.onQuery) options.onQuery(resultObject, this._extensions)

    this._ongoingQueries[ongoingQueryKey].listeners--
    if (this._ongoingQueries[ongoingQueryKey].listeners === 0) {
      delete this._ongoingQueries[ongoingQueryKey]
    }

    listener()
  }

  _getOngoingQueryKey (queryRef: string) {
    const self = this
    return Object.keys(this._ongoingQueries)
      .find(ongoingQueryKey => self._ongoingQueries[ongoingQueryKey].queryRef === queryRef)
  }

  _onQueryError (error: Error, ongoingQueryKey: string, listener: () => void, options: Options<E>) {
    if (options.onError) options.onError(error, this._extensions)

    this._ongoingQueries[ongoingQueryKey].listeners--
    if (this._ongoingQueries[ongoingQueryKey].listeners === 0) {
      delete this._ongoingQueries[ongoingQueryKey]
    }

    listener()
  }
}