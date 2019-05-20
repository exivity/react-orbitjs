import Store from '@orbit/store'
import { Transform, RecordOperation, Record } from '@orbit/data'

import { Observable } from './Observable'
import { getUpdatedRecords, hasChanged } from './helpers'
import { Term, Queries, Expression, RecordData, Status, QueryRefs, Query, RecordObject } from './types'

export class QueryManager extends Observable {
  _store: Store
  _queryRefs: QueryRefs = {}
  _afterQueryQueue: { [key: string]: Function[] } = {}


  constructor (store: Store) {
    super()
    this._store = store
  }

  _extractTerms (queries: Queries): Term[] {
    return Object.keys(queries).sort().map((key) =>
      ({ key, expression: queries[key](this._store.queryBuilder).expression as Expression })
    )
  }

  _extractExpression (query: Query): Expression {
    return query(this._store.queryBuilder).expression as Expression
  }

  _getTermsOrExpression (queryOrQueries: Query | Queries) {
    return typeof queryOrQueries === 'function'
      ? this._extractExpression(queryOrQueries)
      : this._extractTerms(queryOrQueries)
  }

  // @ts-ignore
  subscribe (queryOrQueries: Query | Queries, listener: Function) {

    const termsOrExpression = this._getTermsOrExpression(queryOrQueries)
    const id = JSON.stringify(termsOrExpression)

    if (Object.keys(this._subscriptions).length === 0) {
      this._store.on('transform', this._compare)
    }

    const unsubscribe = super.subscribe(id, listener)

    return () => {
      unsubscribe()

      if (Object.keys(this._subscriptions).length === 0) {
        this._store.off('transform', this._compare)
      }

      if (this._queryRefs[id] && !this._subscriptions[id]) {
        this._afterQueryQueue[id].push(() => delete this._queryRefs[id])
      }
    }
  }

  query (queryOrQueries: Query | Queries): [RecordData, Status] {

    const termsOrExpression = this._getTermsOrExpression(queryOrQueries)
    const id = JSON.stringify(termsOrExpression)

    if (!this._queryRefs[id]) {
      this._queryRefs[id] = { loading: false, error: null }
    }

    if (!this._queryRefs[id].loading) {
      this._queryRefs[id].loading = true
      this._afterQueryQueue[id] = []

      this._query(id, termsOrExpression)
    }

    return [null, this._queryRefs[id]]
  }

  async _query (id: string, termsOrExpression: Term[] | Expression) {

    let data: RecordData

    try {
      data = !Array.isArray(termsOrExpression)
        ? await this._makeSingleQuery(termsOrExpression)
        : await this._makeMultipleQueries(termsOrExpression)

    } catch (error) {
      this._queryRefs[id].error = error
    } finally {
      this._queryRefs[id].loading = false
      super.notify(id, [data || null, this._queryRefs[id]])

      this._afterQueryQueue[id].forEach(fn => fn())
      delete this._afterQueryQueue[id]
    }
  }

  async _makeSingleQuery (expression: Expression) {
    return new Promise<Record>((resolve, reject) => {
      this._store.query(expression)
        .then(record => resolve(record))
        .catch(reject)
    })
  }

  async _makeMultipleQueries (terms: Term[]) {
    const results = await Promise.all(terms.map(({ key, expression }) =>
      new Promise<RecordObject>((resolve, reject) => {
        this._makeSingleQuery(expression)
          .then(result => resolve({ [key]: result }))
          .catch(reject)
      })
    ))

    return results.reduce((acc, record) => ({ ...acc, ...record }))
  }

  queryCache (queryOrQueries: Query | Queries): [RecordData, Status] {
    const termsOrExpression = this._getTermsOrExpression(queryOrQueries)

    return this._queryCache(termsOrExpression)
  }

  _queryCache (termsOrExpression: Term[] | Expression): [RecordData, Status] {
    let data: RecordData = null
    let error = null

    try {
      data = !Array.isArray(termsOrExpression)
        ? this._store.cache.query(termsOrExpression) as Record
        : termsOrExpression
          .map(({ key, expression }) => ({ [key]: this._store.cache.query(expression) }))
          .reduce((acc, record) => ({ ...acc, ...record }))

    } catch (reason) {
      error = reason
    }

    return [data, { error, loading: false }]
  }

  _compare = (transform: Transform) => {
    const { records, relatedRecords } = getUpdatedRecords(transform.operations as RecordOperation[])

    Object.keys(this._subscriptions).forEach(id => {
      const termsOrExpression = JSON.parse(id)

      const shouldUpdate = !Array.isArray(termsOrExpression)
        ? hasChanged(termsOrExpression as Expression, records, relatedRecords)
        : termsOrExpression.some(({ expression }) => hasChanged(expression, records, relatedRecords))

      if (shouldUpdate) {
        const data = this._queryCache(termsOrExpression)
        super.notify(id, data)
      }
    })
  }
}