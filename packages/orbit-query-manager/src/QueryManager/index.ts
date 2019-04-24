import Store from '@orbit/store'
import { Schema, QueryBuilder, Record } from '@orbit/data';

import { onFulfilled, onThrow } from './helpers'
import {
  BeforeCallback,
  OnCallback,
  OnErrorCallback,
  Options,
  Queries,
  Term,
  OngoingQueries,
  RecordObject
} from './types'

export class QueryManager<E extends {} = any>  {
  _extensions: E
  _store: Store
  _queryResults: any
  _ongoingQueries: OngoingQueries

  constructor (orbitStore: Store, extensions?: E) {
    // @ts-ignore
    this._extensions = extensions || { hello: 'hi' }
    this._store = orbitStore
    this._queryResults = {}
    this._ongoingQueries = {}
  }

  query (queries: Queries, options: Options<E> = {}) {
    const terms = Object.keys(queries).sort().map(
      (key) => ({ key, expression: queries[key](this._store.queryBuilder).expression })
    )

    let uniqueKey = JSON.stringify(terms)

    terms.forEach(({ expression }) => {
      options.beforeQuery && options.beforeQuery(expression, this._extensions)
    })

    let queryRef: string
    if (this._ongoingQueries[uniqueKey]) {
      // queryRef = this._listen(uniqueKey)
    } else {
      queryRef = this._query(uniqueKey, terms, options)
    }

    // return queryRef

  }

  _query (
    uniqueKey: string,
    expressions: Term[],
    options: Options<E>
  ) {

    const queryRef = this._generateQueryRef(uniqueKey)

    this._queryResults[queryRef] = { error: null, loading: true, listeners: 1, result: null }

    const results: Promise<RecordObject>[] = expressions.map(
      ({ key, expression }) => {
        return new Promise((resolve) => {
          this._store.query(expression).then(record => resolve({ [key]: record }))
        })
      }
    )

    this._ongoingQueries[uniqueKey] = { results, listeners: 0, queryRef }

    return this._listen(uniqueKey, options)
  }

  _listen (uniqueKey: string, options: Options<E>) {

    const ongoingQuery = this._ongoingQueries[uniqueKey]

    ongoingQuery.listeners++

    const self = this
    Promise.all(ongoingQuery.results).then((results) => self._onQueryResolve(results, options, uniqueKey))

    return ongoingQuery.queryRef
  }

  _onQueryResolve (results: RecordObject[], options: Options<E>, uniqueKey: string) {
    console.log(results)
    console.log(this._ongoingQueries[uniqueKey].results)

    // options.onQuery && options.onQuery(results, this._extensions)
    this._ongoingQueries[uniqueKey].listeners--

  }


  _generateQueryRef (uniqueKey: string) {
    let i = 1
    while (true) {
      let queryRef = uniqueKey + `_${i}`

      if (!this._queryResults[uniqueKey]) return queryRef
      else i++
    }
  }
}

const manager = new QueryManager(new Store({ schema: new Schema() }))

manager.query({
  Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' }),
  Account2: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '2' }),
  Account3: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '3' }),
  Account4: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '4' }),
})