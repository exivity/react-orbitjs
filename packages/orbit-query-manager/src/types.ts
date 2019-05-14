import {
  QueryBuilder,
  QueryTerm,
  FindRecord,
  FindRelatedRecord,
  FindRecords,
  FindRelatedRecords,
  Record
} from '@orbit/data'

export type Queries = { [key: string]: (q: QueryBuilder) => QueryTerm }

export type Expressions = FindRecord | FindRelatedRecord | FindRecords | FindRelatedRecords

export type Term = { key: string, expression: Expressions }

export type Listener = Function

export type Subscriptions = {
  [key: string]: Listener[]
}

export interface RecordObject { [key: string]: Record | Record[] }

export type RecordData = RecordObject | null

export interface Status {
  loading?: boolean
  error: null | Error
}

export interface QueryRefs {
  [id: string]: Status
}

