import { QueryBuilder, Schema, ModelDefinition } from '@orbit/data'
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

test('QueryManager.query(...) should return a queryRef', () => {
  const query = { Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' }) }

  const { queryRef } = manager.query(query)

  expect(typeof queryRef).toBe('string')
})

test('QueryManager.subscribe(...) subscribes you to the request being made', async done => {
  const account = { type: 'account', id: '1' }

  const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
  const initialFetch = true

  await manager._store.update(t => t.addRecord(account))

  const { queryRef } = manager.query(query, initialFetch)

  const result = await new Promise(resolve => {
    const listener = () => { resolve(' q(0_0)p ') }

    manager.subscribe(queryRef, listener)
  })

  expect(result).toBe(' q(0_0)p ')
  done()
})

test('QueryManager.subscribe(...) will return a ref to the same subscription object if the queries are identical', async done => {
  const account = { type: 'account', id: '1' }

  const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
  const initialFetch = true

  await manager._store.update(t => t.addRecord(account))

  const refs1 = manager.query(query, initialFetch)
  const refs2 = manager.query(query, initialFetch)

  manager.subscribe(refs1.queryRef, () => { })
  manager.subscribe(refs2.queryRef, () => { })

  expect(refs1.queryRef).toBe(refs2.queryRef)
  done()
})

test('QueryManager.subscribe(...) will subscribe to an ongoing identical query\'s status', async done => {
  const account = { type: 'account', id: '1' }

  const query = { Account: (q: QueryBuilder) => q.findRecord(account) }
  const initialFetch = true

  await manager._store.update(t => t.addRecord(account))

  const refs1 = manager.query(query, initialFetch)
  const refs2 = manager.query(query, initialFetch)

  manager.subscribe(refs1.queryRef, () => { })
  manager.subscribe(refs2.queryRef, () => { })

  expect(refs1.statusRef).toBe(refs2.statusRef)
  done()
})

test('QueryManager.unsubscribe(...) delete subscription object when there are no listeners left', async done => {
  const account = { type: 'account', id: '1' }

  const query = { Account: (q: QueryBuilder) => q.findRecord(account) }

  await manager._store.update(t => t.addRecord(account))

  const refs1 = manager.query(query)
  const refs2 = manager.query(query)

  manager.subscribe(refs1.queryRef, () => { })
  manager.subscribe(refs2.queryRef, () => { })

  expect(manager.subscriptions[refs2.queryRef].listeners).toBe(2)

  manager.unsubscribe(refs1)
  manager.unsubscribe(refs2)

  expect(manager.subscriptions[refs1.queryRef]).toBeUndefined()
  done()
})

test('QueryManager.unsubscribe(...) delete statuses object when there are no listeners left', async done => {
  const account = { type: 'account', id: '1' }

  const query = { Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' }) }
  const initialFetch = true

  await manager._store.update(t => t.addRecord(account))

  const refs1 = manager.query(query, initialFetch)
  const refs2 = manager.query(query, initialFetch)

  expect(manager.statuses[refs2.statusRef!].listeners).toBe(2)

  manager.subscribe(refs1.queryRef, () => { })
  manager.subscribe(refs2.queryRef, () => { })

  manager.unsubscribe(refs1)
  manager.unsubscribe(refs2)

  expect(manager.statuses[refs1.statusRef!]).toBeUndefined()
  done()
})

test('QueryManager.queryCache(...) returns null if no match is found', () => {
  const account = { type: 'account', id: '1' }

  const query = { Account: (q: QueryBuilder) => q.findRecord(account) }

  const refs = manager.query(query)
  const result = manager.queryCache(manager.subscriptions[refs.queryRef].terms)

  expect(result).toBe(null)
})

test('QueryManager.queryCache(...) returns an object when a match is found', async done => {
  const query = manager.query({
    Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
  })

  const subscription = new Promise((resolve) => {
    // @ts-ignore
    manager.subscribe(query.queryRef, () => { resolve(manager.queryCache(manager.subscriptions[query.queryRef].terms)) })
  })

  manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

  expect(await subscription).toMatchObject({ Account: { type: 'account', id: '1' } })
  done()
})

test('QueryManager.queryCache(...) gets cancelled when beforeQuery returns true', async done => {

  const query = manager.query({
    Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
  })

  const subscription = new Promise((resolve) => {
    manager.subscribe(query.queryRef, () => {
      // @ts-ignore
      resolve(manager.queryCache(manager.subscriptions[query.queryRef].terms,
        {
          beforeQuery: (expression: any, extensions: any) => {
            // extensions.skip: ['account'] as defined at the top of the file
            if (extensions.skip.includes(expression.record.type)) {
              return true
            }
          }
        }
      ))
    })
  })

  manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

  expect(await subscription).toBe(null)
  done()
})

test('QueryManager.queryCache(...) calls onQuery with the results', async done => {

  const query = manager.query({
    Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
  })

  const subscription = new Promise((resolve) => {
    manager.subscribe(query.queryRef, () => {
      // @ts-ignore
      manager.queryCache(manager.subscriptions[query.queryRef].terms,
        {
          onQuery: (results, extensions) => {
            resolve(results)
          }
        }
      )
    })
  })

  manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

  expect(await subscription).toMatchObject({ Account: { type: 'account', id: '1' } })
  done()
})

test('QueryManager.queryCache(...) calls onError when no matches are found', async done => {

  await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

  const query = manager.query({
    Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
  })

  const subscription = new Promise((resolve) => {
    manager.subscribe(query.queryRef, () => {
      // @ts-ignore
      manager.queryCache(manager.subscriptions[query.queryRef].terms,
        {
          onError: (err, extensions) => {
            resolve(err.message)
          }
        }
      )
    })
  })

  manager._store.update(t => t.removeRecord({ type: 'account', id: '1' }))

  expect(await subscription).toBeDefined()
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
    const { queryRef } = manager.query({ Account: (q: QueryBuilder) => q.findRecords('account') })

    const subscription = new Promise(resolve => {
      const listener = () => { resolve(' q(0_0)p ') }
      manager.subscribe(queryRef, listener)
    })

    manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    const result = await subscription

    expect(result).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRecordOperation while listening to a type of record', async done => {
    await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.replaceRecord({ type: 'account', id: '1' }))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('RemoveRecordOperation while listening to a type of record', async done => {
    await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.removeRecord({ type: 'account', id: '1' }))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceKeyOperation while listening to a type of record', async done => {
    await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.replaceKey({ type: 'account', id: '1' }, 'testKey', 'testValue'))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceAttributeOperation while listening to a type of record', async done => {
    await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.replaceAttribute({ type: 'account', id: '1' }, 'test', 'hello'))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('AddToRelatedRecordsOperation while listening to a type of record (record perspective)', async done => {
    await manager._store.update(t => [t.addRecord({ type: 'account', id: '1' }), t.addRecord({ type: 'service', id: '1' })])

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.addToRelatedRecords({ type: 'account', id: '1' }, 'services', { type: 'service', id: '1' }))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('AddToRelatedRecordsOperation while listening to a type of record (relation perspective)', async done => {
    await manager._store.update(t => [t.addRecord({ type: 'account', id: '1' }), t.addRecord({ type: 'service', id: '1' })])

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.addToRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' }))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('RemoveFromRelatedRecordsOperation while listening to a type of record (record perspective)', async done => {
    await manager._store.update(t => [
      t.addRecord({ type: 'account', id: '1' }),
      t.addRecord({ type: 'service', id: '1' }),
      t.addToRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' })
    ])

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.removeFromRelatedRecords({ type: 'account', id: '1' }, 'services', { type: 'service', id: '1' }))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('RemoveFromRelatedRecordsOperation while listening to a type of record (relation perspective)', async done => {
    await manager._store.update(t => [
      t.addRecord({ type: 'account', id: '1' }),
      t.addRecord({ type: 'service', id: '1' }),
      t.addToRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' })
    ])

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.removeFromRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' }))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRelatedRecordsOperation while listening to a type of record (record perspective)', async done => {
    await manager._store.update(t => [
      t.addRecord({ type: 'account', id: '1' }),
      t.addRecord({ type: 'account', id: '2' }),
      t.addRecord({ type: 'service', id: '1' }),
      t.addRecord({ type: 'service', id: '2' }),
      t.addToRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' })
    ])

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.replaceRelatedRecords({ type: 'account', id: '1' }, 'services', [{ type: 'service', id: '2' }]))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRelatedRecordsOperation while listening to a type of record (relation perspective)', async done => {
    await manager._store.update(t => [
      t.addRecord({ type: 'account', id: '1' }),
      t.addRecord({ type: 'account', id: '2' }),
      t.addRecord({ type: 'service', id: '1' }),
      t.addRecord({ type: 'service', id: '2' }),
      t.addToRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' })
    ])

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.replaceRelatedRecords({ type: 'service', id: '1' }, 'subscribers', [{ type: 'account', id: '2' }]))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRelatedRecordOperation while listening to a type of record (record perspective)', async done => {
    await manager._store.update(t => [
      t.addRecord({ type: 'account', id: '1' }),
      t.addRecord({ type: 'account', id: '2' }),
      t.addRecord({ type: 'profile', id: '1' }),
      t.addRecord({ type: 'profile', id: '2' }),
      t.replaceRelatedRecord({ type: 'profile', id: '1' }, 'account', { type: 'account', id: '1' })
    ])

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.replaceRelatedRecord({ type: 'account', id: '1' }, 'profile', { type: 'profile', id: '2' }))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRelatedRecordOperation while listening to a type of record (relation perspective)', async done => {
    await manager._store.update(t => [
      t.addRecord({ type: 'account', id: '1' }),
      t.addRecord({ type: 'account', id: '2' }),
      t.addRecord({ type: 'profile', id: '1' }),
      t.addRecord({ type: 'profile', id: '2' }),
      t.replaceRelatedRecord({ type: 'profile', id: '1' }, 'account', { type: 'account', id: '1' })
    ])

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.replaceRelatedRecord({ type: 'profile', id: '1' }, 'account', { type: 'account', id: '2' }))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('AddRecordOperation while listening to a specific record', async done => {
    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRecordOperation while listening to a specific record', async done => {
    await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.replaceRecord({ type: 'account', id: '1' }))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('RemoveRecordOperation while listening to a specific record', async done => {
    await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.removeRecord({ type: 'account', id: '1' }))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceKeyOperation while listening to a specific record', async done => {
    await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.replaceKey({ type: 'account', id: '1' }, 'testKey', 'testValue'))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceAttributeOperation while listening to a specific record', async done => {
    await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.replaceAttribute({ type: 'account', id: '1' }, 'test', 'hello'))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('AddToRelatedRecordsOperation while listening to a specific record (record perspective)', async done => {
    await manager._store.update(t => [t.addRecord({ type: 'account', id: '1' }), t.addRecord({ type: 'service', id: '1' })])

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.addToRelatedRecords({ type: 'account', id: '1' }, 'services', { type: 'service', id: '1' }))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('AddToRelatedRecordsOperation while listening to a specific record (relation perspective)', async done => {
    await manager._store.update(t => [t.addRecord({ type: 'account', id: '1' }), t.addRecord({ type: 'service', id: '1' })])

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.addToRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' }))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('RemoveFromRelatedRecordsOperation while listening to a specific record (record perspective)', async done => {
    await manager._store.update(t => [
      t.addRecord({ type: 'account', id: '1' }),
      t.addRecord({ type: 'service', id: '1' }),
      t.addToRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' })
    ])

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.removeFromRelatedRecords({ type: 'account', id: '1' }, 'services', { type: 'service', id: '1' }))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('RemoveFromRelatedRecordsOperation while listening to a specific record (relation perspective)', async done => {
    await manager._store.update(t => [
      t.addRecord({ type: 'account', id: '1' }),
      t.addRecord({ type: 'service', id: '1' }),
      t.addToRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' })
    ])

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.removeFromRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' }))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRelatedRecordsOperation while listening to a specific record (record perspective)', async done => {
    await manager._store.update(t => [
      t.addRecord({ type: 'account', id: '1' }),
      t.addRecord({ type: 'account', id: '2' }),
      t.addRecord({ type: 'service', id: '1' }),
      t.addRecord({ type: 'service', id: '2' }),
      t.addToRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' })
    ])

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.replaceRelatedRecords({ type: 'account', id: '1' }, 'services', [{ type: 'service', id: '2' }]))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRelatedRecordsOperation while listening to a specific record (relation perspective)', async done => {
    await manager._store.update(t => [
      t.addRecord({ type: 'account', id: '1' }),
      t.addRecord({ type: 'account', id: '2' }),
      t.addRecord({ type: 'service', id: '1' }),
      t.addRecord({ type: 'service', id: '2' }),
      t.addToRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' })
    ])

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.replaceRelatedRecords({ type: 'service', id: '1' }, 'subscribers', [{ type: 'account', id: '2' }]))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRelatedRecordOperation while listening to a specific record (record perspective)', async done => {
    await manager._store.update(t => [
      t.addRecord({ type: 'account', id: '1' }),
      t.addRecord({ type: 'account', id: '2' }),
      t.addRecord({ type: 'profile', id: '1' }),
      t.addRecord({ type: 'profile', id: '2' }),
      t.replaceRelatedRecord({ type: 'profile', id: '1' }, 'account', { type: 'account', id: '1' })
    ])

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.replaceRelatedRecord({ type: 'account', id: '1' }, 'profile', { type: 'profile', id: '2' }))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })

  test('ReplaceRelatedRecordOperation while listening to a specific ecord (relation perspective)', async done => {
    await manager._store.update(t => [
      t.addRecord({ type: 'account', id: '1' }),
      t.addRecord({ type: 'account', id: '2' }),
      t.addRecord({ type: 'profile', id: '1' }),
      t.addRecord({ type: 'profile', id: '2' }),
      t.replaceRelatedRecord({ type: 'profile', id: '1' }, 'account', { type: 'account', id: '1' })
    ])

    const { queryRef } = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve(' q(0_0)p ') })
    })

    manager._store.update(t => t.replaceRelatedRecord({ type: 'profile', id: '1' }, 'account', { type: 'account', id: '2' }))

    expect(await subscription).toBe(' q(0_0)p ')
    done()
  })
})

