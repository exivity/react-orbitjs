import { QueryBuilder, Schema, ModelDefinition, FindRecord } from '@orbit/data'
import { QueryManager } from '../QueryManager'
import Store from '@orbit/store'
import { Dict } from '@orbit/utils'
import { Term } from '../types';

const modelDefenition: Dict<ModelDefinition> = {

  account: {
    attributes: {
      test: { type: 'string' }
    },
    relationships: {
      profile: { type: 'hasOne', inverse: 'account', model: 'profile' },
      services: { type: 'hasMany', inverse: 'subscribers', model: 'service' }
    }
  },
  profile: {
    attributes: {
      test: { type: 'string' }
    },
    relationships: {
      account: { type: 'hasOne', inverse: 'profile', model: 'account' }
    }
  },
  service: {
    attributes: {
      test: { type: 'string' }
    },
    relationships: {
      subscribers: { type: 'hasMany', inverse: 'services', model: 'account' }
    }
  }
}

const store = new Store({
  schema: new Schema({ models: modelDefenition })
})

let manager: QueryManager
beforeEach(() => {
  manager = new QueryManager(store.fork(), { skip: ['account'] })
})

test('QueryManager._extractTerms(...) returns an ordered array of terms', () => {
  const account = { type: 'account', id: '1' }

  const query = (q: QueryBuilder) => q.findRecord(account)
  const queries = { Cccount: query, Account: query, Bccount: query, }

  const terms = manager._extractTerms(queries)

  expect(terms).toMatchObject([
    { key: 'Account', expression: { op: 'findRecord', record: account } },
    { key: 'Bccount', expression: { op: 'findRecord', record: account } },
    { key: 'Cccount', expression: { op: 'findRecord', record: account } }
  ])
})

test('QueryManager.subscribeToFetch(...) subscribes you to the request being made', async done => {
  const account = { type: 'account', id: '1' }

  const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
  const queryRef = manager.generateQueryRef(query)

  await manager._store.update(t => t.addRecord(account))

  manager.query(queryRef)

  const result = new Promise(resolve => manager.subscribeToFetch(queryRef, () => { resolve(' q(0_0)p ') }))

  expect(await result).toBe(' q(0_0)p ')
  done()
})

test('QueryManager.subscribeToFetch(...) throws an error when an invalid queryRef is given', async done => {
  let message: string
  try {
    await manager.subscribeToFetch('hellloo', () => { })
  } catch (err) {
    message = err.message
  }

  expect(message).toBe('There is no fetch going on with this queryRef. You possibly forgot to make a query before subscribing')
  done()
})

test('QueryManager.subscribeToCache(...) throws an error when an invalid queryRef is given', async done => {
  let message: string
  try {
    await manager.subscribeToCache('hellloo', () => { })
  } catch (err) {
    message = err.message
  }

  expect(message).toBe('There is no subscription with this queryRef. Generate one with manager.generateQueryRef(...)')
  done()
})

test('QueryManager.subscribeToStatus(...) throws an error when an invalid queryRef is given', async done => {
  let message: string
  try {
    await manager.subscribeToStatus('hellloo')
  } catch (err) {
    message = err.message
  }

  expect(message).toBe('There is no status with this statusRef.')
  done()
})

test('QueryManager.query(...) will return the same statusRef if an identical request is already going on', async done => {
  const account = { type: 'account', id: '1' }

  const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
  const queryRef = manager.generateQueryRef(query)

  await manager._store.update(t => t.addRecord(account))

  const statusRef1 = manager.query(queryRef)
  const statusRef2 = manager.query(queryRef)

  expect(statusRef1).toBe(statusRef2)
  done()
})

test('QueryManager.query(...) will return a different statusRef for an identical query if a new request needs to be made', async done => {
  const account = { type: 'account', id: '1' }

  const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
  const queryRef = manager.generateQueryRef(query)

  await manager._store.update(t => t.addRecord(account))

  const statusRef1 = manager.query(queryRef)

  await new Promise(resolve => manager.subscribeToFetch(queryRef, resolve))

  const statusRef2 = manager.query(queryRef)

  expect(statusRef1).not.toBe(statusRef2)
  done()
})

test('QueryManager.unsubscribeFromCache(...) delete result object when there are no listeners left', async done => {
  const account = { type: 'account', id: '1' }

  const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
  const queryRef = manager.generateQueryRef(query)

  await manager._store.update(t => t.addRecord(account))

  manager.subscribeToCache(queryRef, () => { })
  manager.subscribeToCache(queryRef, () => { })

  expect(manager.subscriptions[queryRef].listeners).toBe(2)

  manager.unsubscribeFromCache(queryRef)
  manager.unsubscribeFromCache(queryRef)

  expect(manager.subscriptions[queryRef]).toBeUndefined()
  done()
})

test('QueryManager.unsubscribeFromStatus(...) delete statuses object when there are no listeners left', async done => {
  const account = { type: 'account', id: '1' }

  const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
  const queryRef = manager.generateQueryRef(query)

  await manager._store.update(t => t.addRecord(account))

  const statusRef = manager.query(queryRef)

  manager.subscribeToStatus(statusRef)
  manager.subscribeToStatus(statusRef)

  expect(manager.statuses[statusRef].listeners).toBe(2)

  manager.unsubscribeFromStatus(statusRef)
  manager.unsubscribeFromStatus(statusRef)

  expect(manager.statuses[statusRef]).toBeUndefined()
  done()
})

test('QueryManager.queryCache(...) returns null if no match is found', () => {
  const account = { type: 'account', id: '1' }

  const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
  const queryRef = manager.generateQueryRef(query)

  manager.query(queryRef)

  const terms = manager.subscriptions[queryRef].terms
  const result = manager.queryCache(terms)

  expect(result).toBe(null)
})

test('QueryManager.queryCache(...) returns an object when a match is found', async done => {
  const account = { type: 'account', id: '1' }

  const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
  const queryRef = manager.generateQueryRef(query)
  const terms = manager.subscriptions[queryRef].terms

  const subscription = new Promise((resolve) => manager.subscribeToCache(queryRef, resolve))

  manager._store.update(t => t.addRecord(account))

  await subscription

  const result = manager.queryCache(terms)

  expect(result).toMatchObject({ Account: account })
  done()
})

test('QueryManager.queryCache(...) gets cancelled when beforeQuery returns true', async done => {
  const account = { type: 'account', id: '1' }

  const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
  const queryRef = manager.generateQueryRef(query)
  const terms = manager.subscriptions[queryRef].terms

  const result = new Promise((resolve) => {
    manager.subscribeToCache(queryRef, () => {

      const queryOptions = {
        beforeQuery: (expression: any, extensions: any) => {
          // extensions.skip: ['account'] as defined at the top of the file
          if (extensions.skip.includes((expression as FindRecord).record.type)) return true
        }
      }

      resolve(manager.queryCache(terms, queryOptions)
      )
    })
  })

  manager._store.update(t => t.addRecord(account))

  expect(await result).toBe(null)
  done()
})

test('QueryManager.queryCache(...) calls onQuery with the results', async done => {
  const account = { type: 'account', id: '1' }

  const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
  const queryRef = manager.generateQueryRef(query)
  const terms = manager.subscriptions[queryRef].terms

  const result = new Promise((resolve) => {
    const queryOptions = { onQuery: resolve }
    manager.subscribeToCache(queryRef, () => manager.queryCache(terms, queryOptions))
  })

  manager._store.update(t => t.addRecord(account))

  expect(await result).toMatchObject({ Account: account })
  done()
})

test('QueryManager.queryCache(...) calls onError when no matches are found', async done => {
  const account = { type: 'account', id: '1' }

  const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
  const queryRef = manager.generateQueryRef(query)
  const terms = manager.subscriptions[queryRef].terms

  await manager._store.update(t => t.addRecord(account))

  const result = new Promise((resolve) => {
    manager.subscribeToCache(queryRef, () => {
      const queryOptions = { onError: resolve }
      manager.queryCache(terms, queryOptions)
    })
  })

  manager._store.update(t => t.removeRecord(account))

  expect(await result).toBeDefined()
  done()
})

describe('QueryManager._shouldUpdate(...)', () => {
  test('findRecords: It should return true when a record of the listened to type present in records', () => {
    const term: Term = { key: 'Test', expression: { op: 'findRecords', type: 'account' } }
    const changedRecord = { type: 'account', id: '1' }

    const shouldUpdate = manager._shouldUpdate([term], [changedRecord], [])

    expect(shouldUpdate).toBe(true)
  })

  test('findRecords: It should return true  when a record of the listened to type present in relatedRecords', () => {
    const term: Term = { key: 'Test', expression: { op: 'findRecords', type: 'account' } }
    const changedRelatedRecord = { type: 'account', id: '1' }

    const shouldUpdate = manager._shouldUpdate([term], [], [changedRelatedRecord])

    expect(shouldUpdate).toBe(true)
  })

  test('It should return true with any other operation if a record matches an expression', () => {
    const term: Term = { key: 'Test', expression: { op: 'findRecord', record: { type: 'account', id: '1' } } }
    const changedRecord = { type: 'account', id: '1' }

    const shouldUpdate = manager._shouldUpdate([term], [changedRecord], [])

    expect(shouldUpdate).toBe(true)
  })

  test('It should return true with any other operation if the type of a relatedRecord matches the expression (hasOne)', () => {
    const term: Term = { key: 'Test', expression: { op: 'findRecord', record: { type: 'account', id: '1' } } }
    const changedRelatedRecord = { type: 'account', id: '1' }

    const shouldUpdate = manager._shouldUpdate([term], [], [changedRelatedRecord])

    expect(shouldUpdate).toBe(true)
  })

  test('It should return true with any other operation if the type of a relatedRecord matches the expression (hasMany)', () => {
    const term: Term = { key: 'Test', expression: { op: 'findRecord', record: { type: 'account', id: '1' } } }
    const changedRelatedRecord = { type: 'account', id: '1' }

    const shouldUpdate = manager._shouldUpdate([term], [], [changedRelatedRecord])

    expect(shouldUpdate).toBe(true)
  })
})

describe('Listener gets called after', () => {
  test('AddRecordOperation while listening to a type of record', async done => {
    const account = { type: 'account', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecords('account') }
    const queryRef = manager.generateQueryRef(query)

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.addRecord(account))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRecordOperation while listening to a type of record', async done => {
    const account = { type: 'account', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecords('account') }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => t.addRecord(account))

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.replaceRecord(account))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('RemoveRecordOperation while listening to a type of record', async done => {
    const account = { type: 'account', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecords('account') }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => t.addRecord(account))

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.removeRecord(account))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceKeyOperation while listening to a type of record', async done => {
    const account = { type: 'account', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecords('account') }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => t.addRecord(account))

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.replaceKey(account, 'testKey', 'testValue'))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceAttributeOperation while listening to a type of record', async done => {
    const account = { type: 'account', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecords('account') }

    await manager._store.update(t => t.addRecord(account))

    const queryRef = manager.generateQueryRef(query)

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.replaceAttribute(account, 'test', 'hello'))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('AddToRelatedRecordsOperation while listening to a type of record (record perspective)', async done => {
    const account = { type: 'account', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecords('account') }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => [t.addRecord(account), t.addRecord({ type: 'service', id: '1' })])

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.addToRelatedRecords(account, 'services', { type: 'service', id: '1' }))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('AddToRelatedRecordsOperation while listening to a type of record (relation perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecords('account') }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => [t.addRecord(account), t.addRecord(service)])

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.addToRelatedRecords(service, 'subscribers', account))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('RemoveFromRelatedRecordsOperation while listening to a type of record (record perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecords('account') }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => [
      t.addRecord(account),
      t.addRecord(service),
      t.addToRelatedRecords(account, 'services', service)
    ])

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.removeFromRelatedRecords(account, 'services', service))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('RemoveFromRelatedRecordsOperation while listening to a type of record (relation perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecords('account') }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => [
      t.addRecord(account),
      t.addRecord(service),
      t.addToRelatedRecords(service, 'subscribers', account)
    ])

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.removeFromRelatedRecords(service, 'subscribers', account))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRelatedRecordsOperation while listening to a type of record (record perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const service1 = { type: 'service', id: '1' }
    const service2 = { type: 'service', id: '2' }

    const query = { Account: (q: QueryBuilder) => q.findRecords('account') }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => [
      t.addRecord(account),
      t.addRecord(service1),
      t.addRecord(service2),
      t.addToRelatedRecords(account, 'services', service1)
    ])

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.replaceRelatedRecords(account, 'services', [service2]))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRelatedRecordsOperation while listening to a type of record (relation perspective)', async done => {
    const account1 = { type: 'account', id: '1' }
    const account2 = { type: 'account', id: '2' }
    const service = { type: 'service', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecords('account') }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => [
      t.addRecord(account1),
      t.addRecord(account2),
      t.addRecord(service),
      t.addToRelatedRecords(service, 'subscribers', account1)
    ])

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.replaceRelatedRecords(service, 'subscribers', [account2]))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRelatedRecordOperation while listening to a type of record (record perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const profile1 = { type: 'profile', id: '1' }
    const profile2 = { type: 'profile', id: '2' }

    const query = { Account: (q: QueryBuilder) => q.findRecords('account') }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => [
      t.addRecord(account),
      t.addRecord(profile1),
      t.addRecord(profile2),
      t.replaceRelatedRecord(account, 'profile', profile1)
    ])

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.replaceRelatedRecord(account, 'profile', profile2))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRelatedRecordOperation while listening to a type of record (relation perspective)', async done => {
    const account1 = { type: 'account', id: '1' }
    const account2 = { type: 'account', id: '2' }
    const profile = { type: 'profile', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecords('account') }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => [
      t.addRecord(account1),
      t.addRecord(account2),
      t.addRecord(profile),
      t.replaceRelatedRecord(profile, 'account', account2)
    ])

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.replaceRelatedRecord(profile, 'account', account2))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('AddRecordOperation while listening to a specific record', async done => {
    const account = { type: 'account', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
    const queryRef = manager.generateQueryRef(query)

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.addRecord(account))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRecordOperation while listening to a specific record', async done => {
    const account = { type: 'account', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => t.addRecord(account))

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.replaceRecord(account))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('RemoveRecordOperation while listening to a specific record', async done => {
    const account = { type: 'account', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => t.addRecord(account))

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.removeRecord(account))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceKeyOperation while listening to a specific record', async done => {
    const account = { type: 'account', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => t.addRecord(account))

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.replaceKey(account, 'testKey', 'testValue'))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceAttributeOperation while listening to a specific record', async done => {
    const account = { type: 'account', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => t.addRecord(account))

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.replaceAttribute(account, 'test', 'hello'))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('AddToRelatedRecordsOperation while listening to a specific record (record perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => [t.addRecord(account), t.addRecord(service)])

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.addToRelatedRecords(account, 'services', service))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('AddToRelatedRecordsOperation while listening to a specific record (relation perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => [t.addRecord(account), t.addRecord(service)])

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.addToRelatedRecords(service, 'subscribers', account))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('RemoveFromRelatedRecordsOperation while listening to a specific record (record perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => [
      t.addRecord(account),
      t.addRecord(service),
      t.addToRelatedRecords(account, 'services', service)
    ])

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.removeFromRelatedRecords(account, 'services', service))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('RemoveFromRelatedRecordsOperation while listening to a specific record (relation perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => [
      t.addRecord(account),
      t.addRecord(service),
      t.addToRelatedRecords(service, 'subscribers', account)
    ])

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.removeFromRelatedRecords(service, 'subscribers', account))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRelatedRecordsOperation while listening to a specific record (record perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const service1 = { type: 'service', id: '1' }
    const service2 = { type: 'service', id: '2' }

    const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => [
      t.addRecord(account),
      t.addRecord(service1),
      t.addRecord(service2),
      t.addToRelatedRecords(account, 'services', service1)
    ])

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.replaceRelatedRecords(account, 'services', [service2]))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRelatedRecordsOperation while listening to a specific record (relation perspective)', async done => {
    const account1 = { type: 'account', id: '1' }
    const account2 = { type: 'account', id: '2' }
    const service = { type: 'service', id: '2' }

    const query = { Account: (q: QueryBuilder) => q.findRecord(account1) }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => [
      t.addRecord(account1),
      t.addRecord(account2),
      t.addRecord(service),
      t.addToRelatedRecords(service, 'subscribers', account1)
    ])

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.replaceRelatedRecords(service, 'subscribers', [account2]))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRelatedRecordOperation while listening to a specific record (record perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const profile1 = { type: 'profile', id: '1' }
    const profile2 = { type: 'profile', id: '2' }

    const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => [
      t.addRecord(account),
      t.addRecord(profile1),
      t.addRecord(profile2),
      t.replaceRelatedRecord(account, 'profile', profile1)
    ])

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.replaceRelatedRecord(account, 'profile', profile2))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRelatedRecordOperation while listening to a specific ecord (relation perspective)', async done => {
    const account1 = { type: 'account', id: '1' }
    const account2 = { type: 'account', id: '2' }
    const profile = { type: 'profile', id: '1' }

    const query = { Account: (q: QueryBuilder) => q.findRecord(account1) }
    const queryRef = manager.generateQueryRef(query)

    await manager._store.update(t => [
      t.addRecord(account1),
      t.addRecord(account2),
      t.addRecord(profile),
      t.replaceRelatedRecord(profile, 'account', account1)
    ])

    const result = new Promise(resolve => manager.subscribeToCache(queryRef, () => { resolve(' q(0_0)p ') }))

    manager._store.update(t => t.replaceRelatedRecord(profile, 'account', account2))

    expect(await result).toBe(' q(0_0)p ')
    done()
  })
})

