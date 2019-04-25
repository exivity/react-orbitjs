import Store from '@orbit/store'
import { Schema, QueryBuilder, Record, TransformBuilder } from '@orbit/data';

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

  query (queries: Queries, listener: () => void, options: Options<E> = {}) {
    const terms = Object.keys(queries).sort().map(
      (key) => ({ key, expression: queries[key](this._store.queryBuilder).expression })
    )

    let uniqueKey = JSON.stringify(terms)

    terms.forEach(({ expression }) => {
      options.beforeQuery && options.beforeQuery(expression, this._extensions)
    })

    if (this._ongoingQueries[uniqueKey]) {
      return this._listen(uniqueKey, listener, options)
    } else {
      this._query(uniqueKey, terms)
      return this._listen(uniqueKey, listener, options)
    }
  }

  _query (
    uniqueKey: string,
    expressions: Term[]
  ) {
    const queryRef = this._generateQueryRef(uniqueKey)

    this._queryResults[queryRef] = { error: null, loading: true, listeners: 1, result: null }

    const queries: Promise<RecordObject>[] = expressions.map(
      ({ key, expression }) => {
        return new Promise((resolve) => {

          this._store.query(expression).then(record => {
            resolve({ [key]: record })
          })
        })
      }
    )

    this._ongoingQueries[uniqueKey] = { queries, listeners: 0, queryRef }
  }

  _listen (uniqueKey: string, listener: () => void, options: Options<E>) {

    const ongoingQuery = this._ongoingQueries[uniqueKey]

    ongoingQuery.listeners++

    const self = this
    Promise.all(ongoingQuery.queries).then((results) => {
      self._onQueryResolve(results, uniqueKey, listener, options)
    })

    return ongoingQuery.queryRef
  }

  _onQueryResolve (results: RecordObject[], uniqueKey: string, listener: () => void, options: Options<E>) {
    const resultObject = results.reduce((acc, result) => ({ ...acc, ...result }), {})
    options.onQuery && options.onQuery(resultObject, this._extensions)

    listener()
    this._ongoingQueries[uniqueKey].listeners--

    if (this._ongoingQueries[uniqueKey].listeners === 0) {
      delete this._ongoingQueries[uniqueKey]
    }
    console.log(this._ongoingQueries[uniqueKey])
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

const store = new Store({
  schema: new Schema({
    models: {
      account: {
        attributes: {}
      }
    }
  })
})

store.update((t: TransformBuilder) => [
  t.addRecord({ type: 'account', id: '1' }),
  t.addRecord({ type: 'account', id: '2' }),
  t.addRecord({ type: 'account', id: '3' }),
  t.addRecord({ type: 'account', id: '4' })
])

const manager = new QueryManager(store)

const listener = () => console.log('hi')

manager.query({
  Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' }),
  Account2: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '2' }),
  Account3: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '3' }),
  Account4: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '4' }),
}, listener)

manager.query({
  Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' }),
  Account2: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '2' }),
  Account3: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '3' }),
  Account4: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '4' }),
}, listener)