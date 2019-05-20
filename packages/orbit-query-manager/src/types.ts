import {
  QueryBuilder,
  QueryTerm,
  FindRecord,
  FindRelatedRecord,
  FindRecords,
  FindRelatedRecords,
  Record
} from '@orbit/data'

export type Query = (q: QueryBuilder) => QueryTerm

export type Queries = { [key: string]: Query }

export type Expression = FindRecord | FindRelatedRecord | FindRecords | FindRelatedRecords

export type Term = { key: string, expression: Expression }

export type Listener = Function

export type SingleOptions = { [optionKey: string]: any }

export type MultipleOptions = {
  queryKey: string
  options: SingleOptions
}[]

export type Options = SingleOptions | MultipleOptions

export type Subscriptions = {
  [key: string]: Listener[]
}

export interface RecordObject { [key: string]: Record | Record[] }

export type RecordData = RecordObject | Record | Record[] | null

export interface Status {
  loading: boolean
  error: null | Error
}

export interface QueryRefs {
  [id: string]: Status
}

