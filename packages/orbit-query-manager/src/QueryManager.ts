import Store from '@orbit/store'
import { Transform, RecordOperation } from '@orbit/data'

import { Observable } from './Observable'
import { getUpdatedRecords, shouldUpdate } from './helpers'
import { Term, Queries, Expressions, RecordData, Status, QueryRefs } from './types'

export class QueryManager extends Observable {
  _store: Store
  _queryRefs: QueryRefs = {}
  _afterQueryQueue: Function[] = []


  constructor (store: Store) {
    super()
    this._store = store
  }

  _extractTerms (queries: Queries): Term[] {
    return Object.keys(queries).sort().map(
      (key) => ({ key, expression: queries[key](this._store.queryBuilder).expression as Expressions })
    )
  }

  // @ts-ignore
  subscribe (queries: Queries, listener: Function) {
    const terms = this._extractTerms(queries)
    const id = JSON.stringify(terms)

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
        this._afterQueryQueue.push(() => delete this._queryRefs[id])
      }
    }
  }

  query (queries: Queries) {
    const terms = this._extractTerms(queries)
    const id = JSON.stringify(terms)

    if (!this._queryRefs[id]) {
      this._queryRefs[id] = { loading: false, error: null }
    }

    if (!this._queryRefs[id].loading) {
      this._queryRefs[id].loading = true
      this._query(id, terms)
      this._afterQueryQueue.forEach(fn => fn())
      this._afterQueryQueue = []
    }

    return [null, this._queryRefs[id]]
  }

  async _query (id: string, terms: Term[]) {

    let data: RecordData = null
    try {
      const result = await Promise.all(terms
        .map(({ key, expression }) =>
          new Promise<RecordData>((resolve, reject) => {
            this._store.query(expression)
              .then(record => resolve({ [key]: record }))
              .catch(reject)
          })
        )
      )

      data = result.reduce((acc, record) => ({ ...acc, ...record }))
    } catch (error) {
      this._queryRefs[id].error = error

    } finally {
      this._queryRefs[id].loading = false
      super.notify(id, [data, this._queryRefs[id]])
    }
  }

  queryCache (queries: Queries) {
    const terms = this._extractTerms(queries)

    return this._queryCache(terms)
  }

  _queryCache (terms: Term[]): [RecordData, Status] {
    let data = null
    let error = null
    try {
      data = terms
        .map(({ key, expression }) => ({ [key]: this._store.cache.query(expression) }))
        .reduce((acc, record) => ({ ...acc, ...record }))

    } catch (reason) {
      error = reason
    }

    return [data, { error }]
  }

  _compare = (transform: Transform) => {
    const { records, relatedRecords } = getUpdatedRecords(transform.operations as RecordOperation[])

    Object.keys(this._subscriptions).forEach(id => {
      const terms = JSON.parse(id)

      if (shouldUpdate(terms, records, relatedRecords)) {
        const data = this._queryCache(terms)
        super.notify(id, data)
      }
    })
  }
}