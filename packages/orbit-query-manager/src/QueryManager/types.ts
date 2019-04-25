import { Record, QueryBuilder, QueryTerm, QueryExpression } from '@orbit/data'

export type BeforeCallback<Extensions extends {}> = (expression: QueryExpression, extensions: Extensions) => void

export type OnCallback<Extensions extends {}> = (record: RecordObject, extensions: Extensions) => void

export type OnErrorCallback<Extensions extends {}> = (error: Error, record: QueryExpression, extensions: Extensions) => void

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
  listeners: number,
  queryRef: string
}

export interface OngoingQueries {
  [key: string]: OngoingQuery
}