import Store from '@orbit/store'
import { Transform, RecordOperation, Record } from '@orbit/data'

import { Observable } from './Observable'
import { getUpdatedRecords, shouldUpdate, getTermsOrExpression, hashQueryIdentifier, validateOptions } from './helpers'
import { Term, Queries, Expression, RecordData, Status, QueryRefs, Query, RecordObject, Options, SingleOptions, MultipleOptions, Data, Listener } from './types'

export class QueryManager extends Observable<Data> {
  _store: Store
  _queryRefs: QueryRefs = {}
  _afterQueryQueue: { [key: string]: Function[] } = {}

  constructor (store: Store) {
    super()
    this._store = store
  }

  // @ts-ignore
  subscribe (queryOrQueries: Query | Queries, listener: Listener<Data>, options?: Options) {

    const termsOrExpression = getTermsOrExpression(queryOrQueries)

    validateOptions(termsOrExpression, options)

    const id = hashQueryIdentifier(termsOrExpression, options)

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

  query (queryOrQueries: Query | Queries, options?: Options): [RecordData, Status] {

    const termsOrExpression = getTermsOrExpression(queryOrQueries)

    validateOptions(termsOrExpression, options)

    const id = hashQueryIdentifier(termsOrExpression, options)

    if (!this._queryRefs[id]) {
      this._queryRefs[id] = { isLoading: false, isError: false }
    }

    if (!this._queryRefs[id].isLoading) {
      this._queryRefs[id].isLoading = true
      this._afterQueryQueue[id] = []

      this._query(id, termsOrExpression, options)
    }

    return [null, this._queryRefs[id]]
  }

  async _query (id: string, termsOrExpression: Term[] | Expression, options?: Options) {

    let data: RecordData = null
    let isError: boolean = false
    try {
      data = !Array.isArray(termsOrExpression)
        ? await this._makeSingleQuery(termsOrExpression, options as SingleOptions)
        : await this._makeMultipleQueries(termsOrExpression, options as MultipleOptions)

    } catch  {
      isError = true
    } finally {
      const status = { isLoading: false, isError }
      this._queryRefs[id] = status
      super.notify(id, [data, status])

      this._afterQueryQueue[id].forEach(fn => fn())
      delete this._afterQueryQueue[id]
    }
  }

  async _makeSingleQuery (expression: Expression, options?: SingleOptions) {
    return new Promise<Record>((resolve, reject) => {
      this._store.query(expression, options)
        .then(record => resolve(record))
        .catch(reject)
    })
  }

  async _makeMultipleQueries (terms: Term[], options: MultipleOptions = []) {
    const results = await Promise.all(terms.map(({ key, expression }) =>
      new Promise<RecordObject>((resolve, reject) => {

        const currentOptions = options.find(option => option.queryKey === key) || { options: {} }

        this._makeSingleQuery(expression, currentOptions.options)
          .then(record => resolve({ [key]: record }))
          .catch(reject)
      })
    ))

    return results.reduce((acc, record) => ({ ...acc, ...record }))
  }

  queryCache (queryOrQueries: Query | Queries): [RecordData, Status] {
    const termsOrExpression = getTermsOrExpression(queryOrQueries)

    return this._queryCache(termsOrExpression)
  }

  _queryCache (termsOrExpression: Term[] | Expression): [RecordData, Status] {
    let data: RecordData = null
    let isError: boolean = false

    try {
      data = !Array.isArray(termsOrExpression)
        ? this._store.cache.query(termsOrExpression) as Record
        : termsOrExpression
          .map(({ key, expression }) => ({ [key]: this._store.cache.query(expression) }))
          .reduce((acc, record) => ({ ...acc, ...record }))

    } catch {
      isError = true
    }

    return [data, { isError, isLoading: false }]
  }

  _compare = (transform: Transform) => {
    const { records, relatedRecords } = getUpdatedRecords(transform.operations as RecordOperation[])

    Object.keys(this._subscriptions).forEach(id => {
      const termsOrExpression = JSON.parse(id)

      const isLoading = this._queryRefs[id] ? this._queryRefs[id].isLoading : false

      if (!isLoading && shouldUpdate(termsOrExpression, records, relatedRecords)) {
        const data = this._queryCache(termsOrExpression)
        super.notify(id, data)
      }
    })
  }
}