import Store from '@orbit/store'
import { Schema, QueryBuilder, Record } from '@orbit/data';

import { onFulfilled, onThrow } from './helpers'
import {
  BeforeCallback,
  OnCallback,
  OnErrorCallback,
  Options,
  Queries,
  Expression
} from './types'

export class QueryManager<E extends {} = any>  {
  _extensions: E
  _store: Store
  _queryResults: any
  _ongoingQueries: any

  constructor(orbitStore: Store, extensions?: E) {
    // @ts-ignore
    this._extensions = extensions || { hello: 'hi' }
    this._store = orbitStore
    this._queryResults = {}
    this._ongoingQueries = {}
  }

  query<R extends Record = any> (queries: Queries) {
    const expressions = Object.keys(queries).sort().map(
      (key) => ({ key, expression: queries[key](this._store.queryBuilder).expression })
    )

    let uniqueKey = JSON.stringify(expressions)

    let queryRef: string
    if (this._ongoingQueries[uniqueKey]) {
      // queryRef = this._listen(uniqueKey)
    } else {
      queryRef = this._query<R>(uniqueKey, expressions)
    }

    // return queryRef

  }

  _query<R extends Record> (
    uniqueKey: string,
    expressions: Expression[],
    options?: Options<R, E>
  ) {
    const queryRef = this._generateQueryRef(uniqueKey)

    this._queryResults[queryRef] = { error: null, loading: true, listeners: 1, result: null }

    const results = expressions.map(
      ({ key, expression }) =>
        new Promise((resolve) => {
          this._store.query(expression).then(record => resolve({ [key]: record }))
        })
    )

    // Promise.all(results)

    return queryRef
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