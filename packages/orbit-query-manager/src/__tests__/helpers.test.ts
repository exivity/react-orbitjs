import { Term } from '../types'
import { shouldUpdate, getUpdatedRecords } from '../helpers'
import { RecordOperation } from '@orbit/data';

describe('shouldUpdate(...)', () => {
  test('findRecords: It should return true when a record of the listened to type present in records', () => {
    const term: Term = { key: 'Test', expression: { op: 'findRecords', type: 'account' } }
    const changedRecord = { type: 'account', id: '1' }

    const shouldUpdateVal = shouldUpdate([term], [changedRecord], [])

    expect(shouldUpdateVal).toBe(true)
  })

  test('findRecords: It should return true  when a record of the listened to type present in relatedRecords', () => {
    const term: Term = { key: 'Test', expression: { op: 'findRecords', type: 'account' } }
    const changedRelatedRecord = { type: 'account', id: '1' }

    const shouldUpdateVal = shouldUpdate([term], [], [changedRelatedRecord])

    expect(shouldUpdateVal).toBe(true)
  })

  test('It should return true with any other operation if a record matches an expression', () => {
    const term: Term = { key: 'Test', expression: { op: 'findRecord', record: { type: 'account', id: '1' } } }
    const changedRecord = { type: 'account', id: '1' }

    const shouldUpdateVal = shouldUpdate([term], [changedRecord], [])

    expect(shouldUpdateVal).toBe(true)
  })

  test('It should return true with any other operation if the type of a relatedRecord matches the expression (hasOne)', () => {
    const term: Term = { key: 'Test', expression: { op: 'findRecord', record: { type: 'account', id: '1' } } }
    const changedRelatedRecord = { type: 'account', id: '1' }

    const shouldUpdateVal = shouldUpdate([term], [], [changedRelatedRecord])

    expect(shouldUpdateVal).toBe(true)
  })

  test('It should return true with any other operation if the type of a relatedRecord matches the expression (hasMany)', () => {
    const term: Term = { key: 'Test', expression: { op: 'findRecord', record: { type: 'account', id: '1' } } }
    const changedRelatedRecord = { type: 'account', id: '1' }

    const shouldUpdateVal = shouldUpdate([term], [], [changedRelatedRecord])

    expect(shouldUpdateVal).toBe(true)
  })
})

describe('getUpdatedRecords(...)', () => {
  test('It should put expression.record into the records array', () => {
    const account = { type: 'account', id: '1' }

    const operation: RecordOperation = { op: 'addRecord', record: account }

    const { records } = getUpdatedRecords([operation])

    expect(records).toMatchObject([account])
  })

  test('It should put expression.relatedRecord into the relatedRecords array', () => {
    const account = { type: 'account', id: '1' }
    const profile = { type: 'profile', id: '1' }

    const operation: RecordOperation = {
      op: 'replaceRelatedRecord',
      record: account,
      relationship: 'profile',
      relatedRecord: profile
    }

    const { relatedRecords } = getUpdatedRecords([operation])

    expect(relatedRecords).toMatchObject([profile])
  })

  test('It should put expression.relatedRecords into the relatedRecords array', () => {
    const account = { type: 'account', id: '1' }
    const service1 = { type: 'service', id: '1' }
    const service2 = { type: 'service', id: '2' }

    const operation: RecordOperation = {
      op: 'replaceRelatedRecords',
      record: account,
      relationship: 'services',
      relatedRecords: [service1, service2]
    }

    const { relatedRecords } = getUpdatedRecords([operation])

    expect(relatedRecords).toMatchObject([service1, service2])
  })
})