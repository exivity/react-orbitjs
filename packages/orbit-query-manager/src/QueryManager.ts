import Store from '@orbit/store'

import {
  Options,
  Term,
  OngoingQueries,
  RecordObject,
  Expressions,
  Queries,
  Subscriptions,
  QueryRefs,
  Statuses,
} from './types'
import { Transform, RecordOperation, RecordIdentity } from '@orbit/data';
import { identityIsEqual } from './helpers';

export class QueryManager<E extends { [key: string]: any } = any>  {
  _extensions: E
  _store: Store
  _ongoingQueries: OngoingQueries

  subscriptions: Subscriptions
  statuses: Statuses

  constructor (orbitStore: Store, extensions?: E) {
    this._extensions = extensions || {} as E
    this._store = orbitStore
    this._ongoingQueries = {}

    this.subscriptions = {}
    this.statuses = {}
  }

  query (queries: Queries, options: Options<E> = { initialFetch: false }): QueryRefs {

    const terms = Object.keys(queries).sort().map(
      (key) => ({ key, expression: queries[key](this._store.queryBuilder).expression as Expressions })
    )

    terms.forEach(({ expression }) => {
      options.beforeQuery && options.beforeQuery(expression, this._extensions)
    })

    let queryRef = JSON.stringify(terms)

    this.subscriptions[queryRef] = { listeners: 0, terms }

    const ongoingIdenticalQuery = this._ongoingQueries[queryRef]

    if (options.initialFetch) {
      if (!ongoingIdenticalQuery) {
        const statusRef = this._query(queryRef, terms)

        return { queryRef, statusRef }
      } else {
        const { statusRef } = ongoingIdenticalQuery
        this.statuses[statusRef].listeners++

        return { queryRef, statusRef }
      }
    }

    return { queryRef }
  }

  _query (queryRef: string, terms: Term[]) {

    const statusRef = this._generateStatusRef(queryRef)
    this.statuses[statusRef] = { error: null, loading: false, listeners: 1 }

    const queries: Promise<RecordObject>[] = terms
      .map(({ key, expression }) =>
        new Promise((resolve, reject) => {
          this._store.query(expression)
            .then(record => resolve({ [key]: record }))
            .catch(reject)
        })
      )

    Promise.all(queries)
      .then(() => {
        if (this.statuses[statusRef]) {
          this.statuses[statusRef].loading = false
        }
      })
      .catch(error => {
        if (this.statuses[statusRef]) {
          this.statuses[statusRef].loading = false
          this.statuses[statusRef].error = error
        }
      })

    this._ongoingQueries[queryRef] = { queries, listeners: 1, statusRef }

    return statusRef
  }

  _generateStatusRef (queryRef: string) {
    let i = 1
    while (true) {
      const statusRef = queryRef + `_${i}`
      if (!this.statuses[statusRef]) return statusRef
      else i++
    }
  }

  subscribe (queryRef: string, listener: () => void, options: Options<E> = { initialFetch: false }) {
    this.subscriptions[queryRef].listeners++

    if (this._ongoingQueries[queryRef]) this._subscribeToFetch(queryRef, listener, options)

    this._subscribeToCache(queryRef, listener, options)
  }

  _subscribeToFetch (queryRef: string, listener: () => void, options: Options<E>) {
    this._ongoingQueries[queryRef].listeners++

    return Promise.all(this._ongoingQueries[queryRef].queries)
      .then((results) => this._onQueryResolve(results, queryRef, listener, options))
      .catch(error => this._onQueryError(error, queryRef, listener, options))
  }

  _onQueryResolve (results: RecordObject[], queryRef: string, listener: () => void, options: Options<E>) {
    const resultObject = results.reduce((acc, result) => ({ ...acc, ...result }), {})

    options.onQuery && options.onQuery(resultObject, this._extensions)

    listener()
    this._unsubscribeToFetch(queryRef)
  }

  _onQueryError (error: Error, queryRef: string, listener: () => void, options: Options<E>) {
    if (options.onError) options.onError(error, this._extensions)

    listener()
    this._unsubscribeToFetch(queryRef)
  }


  _subscribeToCache (queryRef: string, listener: () => void, options: Options<E>) {
    this._store.on('transform', this._compare.bind(this, queryRef, listener))
  }

  _compare (queryRef: string, listener: () => void, transform: Transform) {
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

      return records.some(record => !!identityIsEqual(expression.record, record))
        || relatedRecords.some(record => record.type === expression.record.type)
    })
  }

  unsubscribe ({ queryRef, statusRef }: QueryRefs) {
    this._unsubscribeToCache(queryRef)
    statusRef && this._unsubscribeToStatus(statusRef)
  }

  _unsubscribeToFetch (queryRef: string) {
    this._ongoingQueries[queryRef].listeners--
    if (this._ongoingQueries[queryRef].listeners === 0) {
      delete this._ongoingQueries[queryRef]
    }
  }

  _unsubscribeToCache (queryRef: string) {
    this.subscriptions[queryRef].listeners--

    if (this.subscriptions[queryRef].listeners === 0) {
      delete this.subscriptions[queryRef]
    }
  }

  _unsubscribeToStatus (statusRef: string) {
    this.statuses[statusRef].listeners--

    if (this.statuses[statusRef].listeners === 0) {
      delete this.statuses[statusRef]
    }
  }
}