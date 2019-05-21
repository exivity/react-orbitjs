import { Expression, Term, Options } from '../types'
import { hasChanged, getUpdatedRecords, getTerms, getExpression, hashQueryIdentifier, validateOptions, identityIsEqual } from '../helpers'
import { RecordOperation } from '@orbit/data';

describe('getTerms(...)', () => {
  test('It should return an array of terms when a query object gets passed in', () => {
    const query = {
      Accounts: q => q.findRecords('account'),
      Services: q => q.findRecords('service')
    }

    const terms = getTerms(query)

    expect(terms).toMatchObject([
      { key: 'Accounts', expression: { op: 'findRecords', type: 'account' } },
      { key: 'Services', expression: { op: 'findRecords', type: 'service' } }
    ])
  })

  test('It should return an array of terms when a query object gets passed in', () => {
    const query = {
      Cccounts: q => q.findRecords('account'),
      Accounts: q => q.findRecords('account'),
      Bccounts: q => q.findRecords('account')
    }

    const terms = getTerms(query)

    expect(terms).toMatchObject([
      { key: 'Accounts', expression: { op: 'findRecords', type: 'account' } },
      { key: 'Bccounts', expression: { op: 'findRecords', type: 'account' } },
      { key: 'Cccounts', expression: { op: 'findRecords', type: 'account' } }
    ])
  })
})

describe('getExpression(...)', () => {
  test('It should return an expression for a single query function', () => {
    const query = q => q.findRecords('account')

    const expression = getExpression(query)

    expect(expression).toMatchObject({ op: 'findRecords', type: 'account' })
  })
})

describe('hashQueryIdentifier(...)', () => {
  test('It returns a hash of the termsOrExpression', () => {
    const terms: Term[] = [
      { key: 'Accounts', expression: { op: 'findRecords', type: 'account' } },
      { key: 'Services', expression: { op: 'findRecords', type: 'service' } }
    ]
    const expression: Expression = { op: 'findRecords', type: 'account' }

    const termsHash = hashQueryIdentifier(terms)
    const expressionHash = hashQueryIdentifier(expression)

    expect(JSON.parse(termsHash)).toMatchObject(terms)
    expect(JSON.parse(expressionHash)).toMatchObject(expression)
  })

  test('It returns a hash of the termsOrExpression with options if it has properties', () => {
    const expression: Expression = { op: 'findRecords', type: 'account' }
    const options = { test: 'test' }

    const expressionHash = hashQueryIdentifier(expression, options)

    expect(JSON.parse(expressionHash)).toMatchObject({ termsOrExpression: expression, options })
  })
})

describe('validateOptions(...)', () => {
  test(`doesn't throw an error when passed a term array and an options array`, () => {
    const terms: Term[] = [
      { key: 'Accounts', expression: { op: 'findRecords', type: 'account' } },
      { key: 'Services', expression: { op: 'findRecords', type: 'service' } }
    ]

    const options: Options = [
      {
        queryKey: 'Accounts',
        options: { test: 'test' }
      },
    ]

    let error = null
    try {
      validateOptions(terms, options)
    } catch (reason) {
      error = reason
    }

    expect(error).toBe(null)
  })

  test(`doesn't throw an error when passed an expression and an options object`, () => {
    const expression: Expression = { op: 'findRecords', type: 'account' }
    const options: Options = { test: 'test' }

    let error = null
    try {
      validateOptions(expression, options)
    } catch (reason) {
      error = reason
    }

    expect(error).toBe(null)
  })

  test(`throws an error when passed a term array and an options object`, () => {
    const terms: Term[] = [
      { key: 'Accounts', expression: { op: 'findRecords', type: 'account' } },
      { key: 'Services', expression: { op: 'findRecords', type: 'service' } }
    ]

    const options: Options = { test: 'test' }


    let error = null
    try {
      validateOptions(terms, options)
    } catch (reason) {
      error = reason
    }

    expect(error).toBeDefined()
    expect(error.message).toBe('Options are invalid. When making multiple queries' +
      'the options must be an array of objects with a "queryKey" property that refers to the query to which the options apply'
    )
  })

  test(`throws an error when passed an expression and an options array`, () => {
    const expression: Expression = { op: 'findRecords', type: 'account' }

    const options: Options = [
      {
        queryKey: 'Accounts',
        options: { test: 'test' }
      },
    ]

    let error = null
    try {
      validateOptions(expression, options)
    } catch (reason) {
      error = reason
    }

    expect(error).toBeDefined()
    expect(error.message).toBe('Options are invalid.')
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

describe('shouldUpdate(...)', () => {
  test('findRecords: It should return true when a record of the listened to type present in records', () => {
    const expression: Expression = { op: 'findRecords', type: 'account' }
    const changedRecord = { type: 'account', id: '1' }

    const shouldUpdateVal = hasChanged(expression, [changedRecord], [])

    expect(shouldUpdateVal).toBe(true)
  })

  test('findRecords: It should return true  when a record of the listened to type present in relatedRecords', () => {
    const expression: Expression = { op: 'findRecords', type: 'account' }
    const changedRelatedRecord = { type: 'account', id: '1' }

    const shouldUpdateVal = hasChanged(expression, [], [changedRelatedRecord])

    expect(shouldUpdateVal).toBe(true)
  })

  test('It should return true with any other operation if a record matches an expression', () => {
    const expression: Expression = { op: 'findRecord', record: { type: 'account', id: '1' } }
    const changedRecord = { type: 'account', id: '1' }

    const shouldUpdateVal = hasChanged(expression, [changedRecord], [])

    expect(shouldUpdateVal).toBe(true)
  })

  test('It should return true with any other operation if the type of a relatedRecord matches the expression (hasOne)', () => {
    const expression: Expression = { op: 'findRecord', record: { type: 'account', id: '1' } }
    const changedRelatedRecord = { type: 'account', id: '1' }

    const shouldUpdateVal = hasChanged(expression, [], [changedRelatedRecord])

    expect(shouldUpdateVal).toBe(true)
  })

  test('It should return true with any other operation if the type of a relatedRecord matches the expression (hasMany)', () => {
    const expression: Expression = { op: 'findRecord', record: { type: 'account', id: '1' } }
    const changedRelatedRecord = { type: 'account', id: '1' }

    const shouldUpdateVal = hasChanged(expression, [], [changedRelatedRecord])

    expect(shouldUpdateVal).toBe(true)
  })
})

describe('identityIsEqual(...)', () => {
  test('should return true when identity is equal', () => {
    const accountId = { type: 'account', id: '1' }

    const result = identityIsEqual(accountId, accountId)

    expect(result).toBe(true)
  })

  test('should return false when identity is not equal', () => {
    const accountId1 = { type: 'account', id: '1' }
    const accountId2 = { type: 'account', id: '2' }


    const result = identityIsEqual(accountId1, accountId2)

    expect(result).toBe(false)
  })
})