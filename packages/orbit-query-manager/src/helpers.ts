import { RecordOperation, RecordIdentity } from '@orbit/data'
import { Expression } from './types';

export const getUpdatedRecords = (operations: RecordOperation[]) => {
  const records: RecordIdentity[] = []
  const relatedRecords: RecordIdentity[] = []

  operations.forEach(operation => {
    operation && operation.record && records.push(operation.record)

    switch (operation.op) {
      case 'addToRelatedRecords':
      case 'removeFromRelatedRecords':
      case 'replaceRelatedRecord':
        operation.relatedRecord && relatedRecords.push(operation.relatedRecord)
        break

      case 'replaceRelatedRecords':
        operation.relatedRecords.forEach(record => relatedRecords.push(record))
        break
    }
  })

  return { records, relatedRecords }
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

export const identityIsEqual = (a: RecordIdentity | null, b: RecordIdentity | null) =>
  (!a && !b) || (a && b && a.type === b.type && a.id === b.id)