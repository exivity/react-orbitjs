import { Record, QueryBuilder, QueryTerm, QueryExpression } from '@orbit/data'

export type BeforeCallback<R extends Record, E extends {}> = (record: R, extensions: E) => R | Promise<boolean> | boolean

export type OnCallback<R extends Record, E extends {}> = (record: R, extensions: E) => void

export type OnErrorCallback<R extends Record, E extends {}> = (error: Error, record: R, extensions: E) => void

export interface Options<R extends Record, E extends {} = { [key: string]: any }> {
  beforeQuery?: BeforeCallback<R, E>
  onQuery?: OnCallback<R, E>
  onError?: OnErrorCallback<R, E>
  [key: string]: any
}

export type Queries = { [key: string]: (q: QueryBuilder) => QueryTerm }

export type Expression = { key: string, expression: QueryExpression }