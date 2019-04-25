import { Record, QueryBuilder, QueryTerm, QueryExpression } from '@orbit/data'

export type BeforeCallback<E extends {}> = (expression: QueryExpression, extensions: Readonly<E>) => void

export type OnCallback<E extends {}> = (records: RecordObject, extensions: Readonly<E>) => void

export type OnErrorCallback<E extends {}> = (error: Error, terms: Term[], extensions: Readonly<E>) => void

export interface Options<E extends {} = { [key: string]: any }> {
  beforeQuery?: BeforeCallback<E>
  onQuery?: OnCallback<E>
  onError?: OnErrorCallback<E>
  [key: string]: any
}

export type Queries = { [key: string]: (q: QueryBuilder) => QueryTerm }

export type Term = { key: string, expression: QueryExpression }

export interface RecordObject {
  [key: string]: Record
}

export interface OngoingQuery {
  queries: Promise<RecordObject>[],
  terms: Term[]
  listeners: number,
  queryRef: string
}

export interface OngoingQueries {
  [key: string]: OngoingQuery
}

export interface QueryResult {
  error: null | Error,
  loading: boolean,
  listeners: number,
  result: null | RecordObject
}

export interface QueryResults {
  [key: string]: QueryResult
}