import Store from '@orbit/store'

import {
  Options,
  Term,
  OngoingQueries,
  RecordObject,
  Expressions,
  Queries
} from './types'
import { CacheManager } from './CacheManager';

export class QueryManager<E extends { [key: string]: any } = any>  {
  _extensions: E
  _store: Store

  _ongoingQueries: OngoingQueries
  cacheManager: CacheManager<E>

  constructor (orbitStore: Store, extensions?: E) {
    this._extensions = extensions || {} as E
    this._store = orbitStore

    this._ongoingQueries = {}
    this.cacheManager = new CacheManager<E>(orbitStore)
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

  _query (ongoingQueryKey: string, terms: Term[]) {
    const queryRef = this._generateQueryRef(ongoingQueryKey)

    this.cacheManager.subscriptions[queryRef] = { error: null, loading: true, listeners: 0, result: null, terms }

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
        self.cacheManager.subscriptions[queryRef].loading = false
        self.cacheManager.subscriptions[queryRef].result = results.reduce((acc, result) => ({ ...acc, ...result }), {})
      })
      .catch(error => {
        self.cacheManager.subscriptions[queryRef].loading = false
        self.cacheManager.subscriptions[queryRef].error = error
      })

    this._ongoingQueries[ongoingQueryKey] = { queries, listeners: 0, queryRef }
  }

  _generateQueryRef (ongoingQueryKey: string) {
    let i = 1
    while (true) {
      const queryRef = ongoingQueryKey + `_${i}`
      if (!this.cacheManager.subscriptions[queryRef]) return queryRef
      else i++
    }
  }

  subscribe (queryRef: string, listener: () => void, options: Options<E>) {
    this.cacheManager.subscriptions[queryRef].listeners++

    const ongoingQueryKey = this._getOngoingQueryKey(queryRef)
    if (ongoingQueryKey) {
      this._subscribe(ongoingQueryKey, listener, options)
    }
    this.cacheManager.subscribeToCache(queryRef, listener, options)
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
    this.cacheManager.unsubscribeToCache(queryRef)
  }

}