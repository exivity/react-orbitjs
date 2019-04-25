import Store from '@orbit/store'
import { Schema, QueryBuilder, Record, TransformBuilder } from '@orbit/data';

import { onFulfilled, onThrow } from './helpers'
import {
  Options,
  Queries,
  Term,
  OngoingQueries,
  RecordObject,
  QueryResults
} from './types'

export class QueryManager<E extends { [ongoingQueryKey: string]: any } = any>  {
  _extensions: E
  _store: Store
  _queryResults: QueryResults
  _ongoingQueries: OngoingQueries

  constructor (orbitStore: Store, extensions?: E) {

    this._extensions = extensions || {} as E
    this._store = orbitStore
    this._queryResults = {}
    this._ongoingQueries = {}
  }

  query (queries: Queries, options: Options<E> = {}) {
    const terms = Object.keys(queries).sort().map(
      (key) => ({ key, expression: queries[key](this._store.queryBuilder).expression })
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
    this._queryResults[queryRef].listeners++

    const ongoingQueryKey = this._getOngoingQueryKey(queryRef)
    if (ongoingQueryKey) {
      this._subscribeToRequest(ongoingQueryKey, listener, options)
    }
  }

  unsubscribe (queryRef: string) {
    this._queryResults[queryRef].listeners--

    if (this._queryResults[queryRef].listeners === 0) {
      delete this._queryResults[queryRef]
    }
  }

  _query (ongoingQueryKey: string, terms: Term[]) {
    const queryRef = this._generateQueryRef(ongoingQueryKey)

    this._queryResults[queryRef] = { error: null, loading: true, listeners: 0, result: null }

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
        self._queryResults[queryRef].loading = false
        self._queryResults[queryRef].result = results.reduce((acc, result) => ({ ...acc, ...result }), {})
      })
      .catch(error => {
        self._queryResults[queryRef].loading = false
        self._queryResults[queryRef].error = error
      })

    this._ongoingQueries[ongoingQueryKey] = { queries, terms, listeners: 0, queryRef }
  }

  _generateQueryRef (ongoingQueryKey: string) {
    let i = 1
    while (true) {
      const queryRef = ongoingQueryKey + `_${i}`
      if (!this._queryResults[queryRef]) return queryRef
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

  _subscribeToCache (queryRef: string) {
    /* implementation needed */
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
    if (options.onError) options.onError(error, this._ongoingQueries[ongoingQueryKey].terms, this._extensions)

    this._ongoingQueries[ongoingQueryKey].listeners--
    if (this._ongoingQueries[ongoingQueryKey].listeners === 0) {
      delete this._ongoingQueries[ongoingQueryKey]
    }

    listener()
  }
}