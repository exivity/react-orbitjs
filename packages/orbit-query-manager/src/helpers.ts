import { RecordOperation, RecordIdentity, QueryBuilder } from '@orbit/data'
import { Expression, Term, Options, Query, Queries } from './types'

export const getTermsOrExpression = (queryOrQueries: Query | Queries) => {
  return typeof queryOrQueries === 'function'
    ? getExpression(queryOrQueries)
    : getTerms(queryOrQueries)
}

export const getTerms = (queries: Queries): Term[] => {
  const queryBuilder = new QueryBuilder()

  return Object.keys(queries).sort().map((key) =>
    ({ key, expression: queries[key](queryBuilder).expression as Expression })
  )
}

export const getExpression = (query: Query): Expression => {
  const queryBuilder = new QueryBuilder()

  return query(queryBuilder).expression as Expression
}

export const hashQueryIdentifier = (termsOrExpression: Term[] | Expression, options?: Options) => {
  return options
    ? JSON.stringify({ termsOrExpression, options })
    : JSON.stringify(termsOrExpression)
}

export const validateOptions = (termsOrExpression: Term[] | Expression, options?: Options) => {
  if (!options) return
  if (Array.isArray(termsOrExpression) && !Array.isArray(options)) {
    throw new Error(
      'Options are invalid. When making multiple queries' +
      'the options must be an array of objects with a "queryKey" property that refers to the query to which the options apply'
    )
  } else if (!Array.isArray(termsOrExpression) && Array.isArray(options)) {
    throw new Error('Options are invalid.')
  }
}

interface Operation {
  record: RecordIdentity
  relatedRecord?: RecordIdentity
  relatedRecords?: RecordIdentity[]
}

export const getUpdatedRecords = (operations: RecordOperation[]) => {
  const records: RecordIdentity[] = []
  const relatedRecords: RecordIdentity[] = []

  operations.forEach((operation: Operation) => {
    records.push(operation.record)
    operation.relatedRecord && relatedRecords.push(operation.relatedRecord)
    operation.relatedRecords && operation.relatedRecords.forEach(record => relatedRecords.push(record))
  })

  return { records, relatedRecords }
}

export const shouldUpdate = (
  termsOrExpression: Term[] | Expression | { termsOrExpression: Term[] | Expression, options: Options },
  records: RecordIdentity[],
  relatedRecords: RecordIdentity[]
) => {

  if (Array.isArray(termsOrExpression)) {
    return termsOrExpression.some(({ expression }) => hasChanged(expression, records, relatedRecords))
  }

  else if (termsOrExpression['op']) {
    return hasChanged(termsOrExpression as Expression, records, relatedRecords)
  }

  else {
    // @ts-ignore
    return shouldUpdate(termsOrExpression.termsOrExpression, records, relatedRecords)
  }
}

export const hasChanged = (
  expression: Expression,
  records: RecordIdentity[],
  relatedRecords: RecordIdentity[]) => {
  if (expression.op === 'findRecords') {
    return records.some(({ type }) => type === expression.type) ||
      relatedRecords.some(({ type }) => type === expression.type)
  }

  return records.some(record => !!identityIsEqual(expression.record, record))
    // @todo find a way to check for identity for relationships
    || relatedRecords.some(record => record.type === expression.record.type)
}

export const identityIsEqual = (a: RecordIdentity, b: RecordIdentity) =>
  (a.type === b.type && a.id === b.id)