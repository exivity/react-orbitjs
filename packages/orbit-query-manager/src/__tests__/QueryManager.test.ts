import { QueryBuilder, Schema, ModelDefinition } from '@orbit/data'
import { QueryManager } from '../QueryManager'
import Store from '@orbit/store'
import { Dict } from '@orbit/utils'

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
  manager = new QueryManager(store.fork())
})

describe('QueryManager.query(...)', () => {
  test('Makes a new query when no queries are going on', () => {
    const account = { type: 'account', id: '1' }

    const query = (q: QueryBuilder) => q.findRecord(account)

    manager.query(query)

    expect(Object.keys(manager._queryRefs).length).toBe(1)
  })

  test('No new query will be made when an identical query already exists', () => {
    const account = { type: 'account', id: '1' }

    const query = (q: QueryBuilder) => q.findRecord(account)

    manager.query(query)

    expect(Object.keys(manager._queryRefs).length).toBe(1)

    manager.query(query)

    expect(Object.keys(manager._queryRefs).length).toBe(1)
  })

  test('Able to pass in options to make a unique query', () => {
    const account = { type: 'account', id: '1' }

    const query = (q: QueryBuilder) => q.findRecord(account)

    const listener1 = jest.fn()
    const listener2 = jest.fn()

    const options = {
      label: 'Find all contacts',
      sources: {
        remote: {
          include: ['phone-numbers']
        }
      }
    }

    manager.query(query)

    expect(Object.keys(manager._queryRefs).length).toBe(1)

    manager.query(query, options)

    expect(Object.keys(manager._queryRefs).length).toBe(2)
  })
})


describe('queryCache(...)', () => {
  test('The record object is null if no match is found', () => {
    const account = { type: 'account', id: '1' }

    const query = (q: QueryBuilder) => q.findRecord(account)

    const data = manager.queryCache(query)

    expect(data[0]).toBe(null)
  })

  test('Returns a record when a single query function is passed in', async (done) => {
    const account = { type: 'account', id: '1' }

    const query = (q: QueryBuilder) => q.findRecord(account)

    await manager._store.update(t => t.addRecord(account))

    const data = manager.queryCache(query)

    expect(data[0]).toBe(account)
    done()
  })

  test('Returns an object with records when an object with query functions function is passed in', async (done) => {
    const account1 = { type: 'account', id: '1' }
    const account2 = { type: 'account', id: '1' }

    const query = {
      Bob: (q: QueryBuilder) => q.findRecord(account1),
      Steve: (q: QueryBuilder) => q.findRecord(account2)
    }

    await manager._store.update(t => [t.addRecord(account1), t.addRecord(account2)])

    const data = manager.queryCache(query)

    expect(data[0]).toMatchObject({ Bob: account1, Steve: account2 })
    done()
  })
})

describe('subscribe(...)', () => {
  test('The record object is null if the cache updates and no match is found', async done => {
    const account = { type: 'account', id: '1' }

    const query = (q: QueryBuilder) => q.findRecord(account)

    let data: any
    const listener = jest.fn(result => {
      data = result
    })

    manager.subscribe(query, listener)

    await manager._store.update(t => t.addRecord(account))

    expect(data[0]).toMatchObject(account)

    await manager._store.update(t => t.removeRecord(account))

    expect(data[0]).toBe(null)
    done()
  })

  test('returns a function that stops listening for events if there are no subscriptions left', () => {
    const account = { type: 'account', id: '1' }

    const query = (q: QueryBuilder) => q.findRecord(account)
    const listener = jest.fn()

    const unsubscribe = manager.subscribe(query, listener)

    expect(Object.keys(manager._subscriptions).length).toBe(1)
    expect(manager._store.listeners('transform').length).toBe(1)

    unsubscribe()

    expect(Object.keys(manager._subscriptions).length).toBe(0)
    expect(manager._store.listeners('transform').length).toBe(0)
  })
})


describe('Listener gets called after', () => {
  test('AddRecordOperation while listening to a type of record', async done => {
    const account = { type: 'account', id: '1' }

    const query = (q: QueryBuilder) => q.findRecords('account')

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.addRecord(account))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('ReplaceRecordOperation while listening to a type of record', async done => {
    const account = { type: 'account', id: '1' }

    const query = (q: QueryBuilder) => q.findRecords('account')

    await manager._store.update(t => t.addRecord(account))

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.replaceRecord(account))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('RemoveRecordOperation while listening to a type of record', async done => {
    const account = { type: 'account', id: '1' }

    const query = (q: QueryBuilder) => q.findRecords('account')

    await manager._store.update(t => t.addRecord(account))

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.removeRecord(account))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('ReplaceKeyOperation while listening to a type of record', async done => {
    const account = { type: 'account', id: '1' }

    const query = (q: QueryBuilder) => q.findRecords('account')

    await manager._store.update(t => t.addRecord(account))

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.replaceKey(account, 'testKey', 'testValue'))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('ReplaceAttributeOperation while listening to a type of record', async done => {
    const account = { type: 'account', id: '1' }

    const query = (q: QueryBuilder) => q.findRecords('account')

    await manager._store.update(t => t.addRecord(account))

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.replaceAttribute(account, 'test', 'hello'))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('AddToRelatedRecordsOperation while listening to a type of record (record perspective)', async done => {
    const account = { type: 'account', id: '1' }

    const query = (q: QueryBuilder) => q.findRecords('account')

    await manager._store.update(t => [t.addRecord(account), t.addRecord({ type: 'service', id: '1' })])

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.addToRelatedRecords(account, 'services', { type: 'service', id: '1' }))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('AddToRelatedRecordsOperation while listening to a type of record (relation perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const query = (q: QueryBuilder) => q.findRecords('account')

    await manager._store.update(t => [t.addRecord(account), t.addRecord(service)])

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.addToRelatedRecords(service, 'subscribers', account))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('RemoveFromRelatedRecordsOperation while listening to a type of record (record perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const query = (q: QueryBuilder) => q.findRecords('account')

    await manager._store.update(t => [
      t.addRecord(account),
      t.addRecord(service),
      t.addToRelatedRecords(account, 'services', service)
    ])

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.removeFromRelatedRecords(account, 'services', service))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('RemoveFromRelatedRecordsOperation while listening to a type of record (relation perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const query = (q: QueryBuilder) => q.findRecords('account')

    await manager._store.update(t => [
      t.addRecord(account),
      t.addRecord(service),
      t.addToRelatedRecords(service, 'subscribers', account)
    ])

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.removeFromRelatedRecords(service, 'subscribers', account))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('ReplaceRelatedRecordsOperation while listening to a type of record (record perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const service1 = { type: 'service', id: '1' }
    const service2 = { type: 'service', id: '2' }

    const query = (q: QueryBuilder) => q.findRecords('account')

    await manager._store.update(t => [
      t.addRecord(account),
      t.addRecord(service1),
      t.addRecord(service2),
      t.addToRelatedRecords(account, 'services', service1)
    ])

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.replaceRelatedRecords(account, 'services', [service2]))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('ReplaceRelatedRecordsOperation while listening to a type of record (relation perspective)', async done => {
    const account1 = { type: 'account', id: '1' }
    const account2 = { type: 'account', id: '2' }
    const service = { type: 'service', id: '1' }

    const query = (q: QueryBuilder) => q.findRecords('account')

    await manager._store.update(t => [
      t.addRecord(account1),
      t.addRecord(account2),
      t.addRecord(service),
      t.addToRelatedRecords(service, 'subscribers', account1)
    ])

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.replaceRelatedRecords(service, 'subscribers', [account2]))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('ReplaceRelatedRecordOperation while listening to a type of record (record perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const profile1 = { type: 'profile', id: '1' }
    const profile2 = { type: 'profile', id: '2' }

    const query = (q: QueryBuilder) => q.findRecords('account')

    await manager._store.update(t => [
      t.addRecord(account),
      t.addRecord(profile1),
      t.addRecord(profile2),
      t.replaceRelatedRecord(account, 'profile', profile1)
    ])

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.replaceRelatedRecord(account, 'profile', profile2))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('ReplaceRelatedRecordOperation while listening to a type of record (relation perspective)', async done => {
    const account1 = { type: 'account', id: '1' }
    const account2 = { type: 'account', id: '2' }
    const profile = { type: 'profile', id: '1' }

    const query = (q: QueryBuilder) => q.findRecords('account')

    await manager._store.update(t => [
      t.addRecord(account1),
      t.addRecord(account2),
      t.addRecord(profile),
      t.replaceRelatedRecord(profile, 'account', account2)
    ])

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.replaceRelatedRecord(profile, 'account', account2))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('AddRecordOperation while listening to a specific record', async done => {
    const account = { type: 'account', id: '1' }

    const query = (q: QueryBuilder) => q.findRecord(account)

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.addRecord(account))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('ReplaceRecordOperation while listening to a specific record', async done => {
    const account = { type: 'account', id: '1' }

    const query = (q: QueryBuilder) => q.findRecord(account)

    await manager._store.update(t => t.addRecord(account))

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.replaceRecord(account))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('RemoveRecordOperation while listening to a specific record', async done => {
    const account = { type: 'account', id: '1' }

    const query = (q: QueryBuilder) => q.findRecord(account)

    await manager._store.update(t => t.addRecord(account))

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.removeRecord(account))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('ReplaceKeyOperation while listening to a specific record', async done => {
    const account = { type: 'account', id: '1' }

    const query = (q: QueryBuilder) => q.findRecord(account)

    await manager._store.update(t => t.addRecord(account))

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.replaceKey(account, 'testKey', 'testValue'))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('ReplaceAttributeOperation while listening to a specific record', async done => {
    const account = { type: 'account', id: '1' }

    const query = (q: QueryBuilder) => q.findRecord(account)

    await manager._store.update(t => t.addRecord(account))

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.replaceAttribute(account, 'test', 'hello'))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('AddToRelatedRecordsOperation while listening to a specific record (record perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const query = (q: QueryBuilder) => q.findRecord(account)

    await manager._store.update(t => [t.addRecord(account), t.addRecord(service)])

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.addToRelatedRecords(account, 'services', service))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('AddToRelatedRecordsOperation while listening to a specific record (relation perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const query = (q: QueryBuilder) => q.findRecord(account)

    await manager._store.update(t => [t.addRecord(account), t.addRecord(service)])

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.addToRelatedRecords(service, 'subscribers', account))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('RemoveFromRelatedRecordsOperation while listening to a specific record (record perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const query = (q: QueryBuilder) => q.findRecord(account)

    await manager._store.update(t => [
      t.addRecord(account),
      t.addRecord(service),
      t.addToRelatedRecords(account, 'services', service)
    ])

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.removeFromRelatedRecords(account, 'services', service))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('RemoveFromRelatedRecordsOperation while listening to a specific record (relation perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const query = (q: QueryBuilder) => q.findRecord(account)

    await manager._store.update(t => [
      t.addRecord(account),
      t.addRecord(service),
      t.addToRelatedRecords(service, 'subscribers', account)
    ])

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.removeFromRelatedRecords(service, 'subscribers', account))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('ReplaceRelatedRecordsOperation while listening to a specific record (record perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const service1 = { type: 'service', id: '1' }
    const service2 = { type: 'service', id: '2' }

    const query = (q: QueryBuilder) => q.findRecord(account)

    await manager._store.update(t => [
      t.addRecord(account),
      t.addRecord(service1),
      t.addRecord(service2),
      t.addToRelatedRecords(account, 'services', service1)
    ])

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.replaceRelatedRecords(account, 'services', [service2]))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('ReplaceRelatedRecordsOperation while listening to a specific record (relation perspective)', async done => {
    const account1 = { type: 'account', id: '1' }
    const account2 = { type: 'account', id: '2' }
    const service = { type: 'service', id: '2' }

    const query = (q: QueryBuilder) => q.findRecord(account1)

    await manager._store.update(t => [
      t.addRecord(account1),
      t.addRecord(account2),
      t.addRecord(service),
      t.addToRelatedRecords(service, 'subscribers', account1)
    ])

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.replaceRelatedRecords(service, 'subscribers', [account2]))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('ReplaceRelatedRecordOperation while listening to a specific record (record perspective)', async done => {
    const account = { type: 'account', id: '1' }
    const profile1 = { type: 'profile', id: '1' }
    const profile2 = { type: 'profile', id: '2' }

    const query = (q: QueryBuilder) => q.findRecord(account)

    await manager._store.update(t => [
      t.addRecord(account),
      t.addRecord(profile1),
      t.addRecord(profile2),
      t.replaceRelatedRecord(account, 'profile', profile1)
    ])

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.replaceRelatedRecord(account, 'profile', profile2))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })

  test('ReplaceRelatedRecordOperation while listening to a specific record (relation perspective)', async done => {
    const account1 = { type: 'account', id: '1' }
    const account2 = { type: 'account', id: '2' }
    const profile = { type: 'profile', id: '1' }

    const query = (q: QueryBuilder) => q.findRecord(account1)


    await manager._store.update(t => [
      t.addRecord(account1),
      t.addRecord(account2),
      t.addRecord(profile),
      t.replaceRelatedRecord(profile, 'account', account1)
    ])

    const listener = jest.fn()
    manager.subscribe(query, listener)

    await manager._store.update(t => t.replaceRelatedRecord(profile, 'account', account2))

    expect(listener).toHaveBeenCalledTimes(1)
    done()
  })
})