import Store from '@orbit/store'

import {
  Options,
  Term,
  OngoingQueries,
  RecordObject,
  Expressions,
  Queries,
  Subscriptions,
} from './types'
import { Transform, RecordOperation, RecordIdentity } from '@orbit/data';
import { identityIsEqual } from './helpers';

export class QueryManager<E extends { [key: string]: any } = any>  {
  _extensions: E
  _store: Store
  subscriptions: Subscriptions

  _ongoingQueries: OngoingQueries


  constructor (orbitStore: Store, extensions?: E) {
    this._extensions = extensions || {} as E
    this._store = orbitStore
    this.subscriptions = {}


    this._ongoingQueries = {}
  }

  query (queries: Queries, options: Options<E> = { initialFetch: false }) {
    const terms = Object.keys(queries).sort().map(
      (key) => ({ key, expression: queries[key](this._store.queryBuilder).expression as Expressions })
    )

    let queryKey = JSON.stringify(terms)

    terms.forEach(({ expression }) => {
      options.beforeQuery && options.beforeQuery(expression, this._extensions)
    })

    const queryRef = this._generateQueryRef(queryKey)
    this.subscriptions[queryRef] = { error: null, loading: false, listeners: 0, terms }

    if (options.initialFetch && !this._ongoingQueries[queryKey]) {
      this._query(queryKey, queryRef, terms)
      this._ongoingQueries[queryKey].listeners++

      return this._ongoingQueries[queryKey].queryRef
    }

    return queryRef
  }

  _query (queryKey: string, queryRef: string, terms: Term[]) {
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
        self.subscriptions[queryRef].loading = false
      })
      .catch(error => {
        self.subscriptions[queryRef].loading = false
        self.subscriptions[queryRef].error = error
      })

    this._ongoingQueries[queryKey] = { queries, listeners: 0, queryRef }
  }

  _generateQueryRef (ongoingQueryKey: string) {
    let i = 1
    while (true) {
      const queryRef = ongoingQueryKey + `_${i}`
      if (!this.subscriptions[queryRef]) return queryRef
      else i++
    }
  }

  subscribe (queryRef: string, listener: () => void, options: Options<E> = { initialFetch: false }) {
    this.subscriptions[queryRef].listeners++

    const ongoingQueryKey = this._getOngoingQueryKey(queryRef)
    if (ongoingQueryKey) {
      this._subscribe(ongoingQueryKey, listener, options)
    }
    this.subscribeToCache(queryRef, listener, options)
  }

  _getOngoingQueryKey (queryRef: string) {
    const self = this
    return Object.keys(this._ongoingQueries)
      .find(ongoingQueryKey => self._ongoingQueries[ongoingQueryKey].queryRef === queryRef)
  }

  _subscribe (ongoingQueryKey: string, listener: () => void, options: Options<E>) {
    this._ongoingQueries[ongoingQueryKey].listeners++

    const self = this
    Promise.all(this._ongoingQueries[ongoingQueryKey].queries)
      .then((results) => self._onQueryResolve(results, ongoingQueryKey, listener, options))
      .catch(error => self._onQueryError(error, ongoingQueryKey, listener, options))
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

  _onQueryError (error: Error, ongoingQueryKey: string, listener: () => void, options: Options<E>) {
    if (options.onError) options.onError(error, this._extensions)

    this._ongoingQueries[ongoingQueryKey].listeners--
    if (this._ongoingQueries[ongoingQueryKey].listeners === 0) {
      delete this._ongoingQueries[ongoingQueryKey]
    }

    listener()
  }

  unsubscribe (queryRef: string) {
    this.unsubscribeToCache(queryRef)
  }

  subscribeToCache (queryRef: string, listener: () => void, options: Options<E>) {
    this._store.on('transform', this._compare.bind(this, queryRef, listener))
  }

  _compare (queryRef: string, listener: () => void, transform: Transform) {
    // Iterate all transforms, to see if any of those matches a model in the list of queries
    const operations = transform.operations as RecordOperation[]

    const records: RecordIdentity[] = []
    const relatedRecords: RecordIdentity[] = []

    operations.forEach(operation => {
      operation && operation.record && records.push(operation.record)

      switch (operation.op) {
        case 'addToRelatedRecords':
        case 'removeFromRelatedRecords':
        case 'replaceRelatedRecord':
          operation.relatedRecord && relatedRecords.push(operation.relatedRecord)
          break

        case 'replaceRelatedRecords':
          operation.relatedRecords.forEach((record) => relatedRecords.push(record))
          break
      }
    })

    const terms = this.subscriptions[queryRef].terms

    if (this._shouldUpdate(terms, records, relatedRecords)) listener()
  }

  _shouldUpdate = (
    terms: Term[],
    records: RecordIdentity[],
    relatedRecords: RecordIdentity[]
  ) => {
    return terms.some(({ expression }) => {
      if (expression.op === 'findRecords') {
        return records.some(({ type }) => type === expression.type) ||
          relatedRecords.some(({ type }) => type === expression.type)
      }

      // subscribed to record is changed directly by changing attributes, keys or relationships
      return records.some(record => !!identityIsEqual(expression.record, record))
        || relatedRecords.some(record => record.type === expression.record.type)
    })
  }

  unsubscribeToCache (queryRef: string) {
    this.subscriptions[queryRef].listeners--

    if (this.subscriptions[queryRef].listeners === 0) {
      delete this.subscriptions[queryRef]
    }
  }
}