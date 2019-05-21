import { QueryBuilder, Schema, ModelDefinition, AddRecordOperation, Transform, ReplaceRecordOperation, RemoveRecordOperation, ReplaceKeyOperation, ReplaceAttributeOperation, AddToRelatedRecordsOperation, RemoveFromRelatedRecordsOperation, ReplaceRelatedRecordsOperation, ReplaceRelatedRecordOperation } from '@orbit/data'
import { QueryManager } from '../QueryManager'
import Store from '@orbit/store'
import { Dict } from '@orbit/utils'
import { Expression, Term } from '../types';

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

describe('_makeSingleQuery', () => {
  test('returns a promise that resolves with a record', async (done) => {
    const account = { type: 'account', id: '1' }
    const expression: Expression = { op: 'findRecord', record: account }

    await manager._store.update(t => t.addRecord(account))

    const result = await manager._makeSingleQuery(expression)

    expect(result).toBe(account)
    done()
  })

  test('can take a second options parameter', async (done) => {
    const account = { type: 'account', id: '1' }
    const expression: Expression = { op: 'findRecord', record: account }
    const options = { label: 'get account' }

    await manager._store.update(t => t.addRecord(account))

    const result = await manager._makeSingleQuery(expression, options)

    expect(result).toBe(account)
    done()
  })
})

describe('_makeMultipleQueries', () => {
  test('returns a promise that resolves with a record object', async (done) => {
    const account = { type: 'account', id: '1' }
    const terms: Term[] = [{ key: 'Account', expression: { op: 'findRecord', record: account } }]

    await manager._store.update(t => t.addRecord(account))

    const result = await manager._makeMultipleQueries(terms)

    expect(result).toMatchObject({ Account: account })
    done()
  })

  test('can take a second options parameter', async (done) => {
    const account = { type: 'account', id: '1' }
    const terms: Term[] = [{ key: 'Account', expression: { op: 'findRecord', record: account } }]

    await manager._store.update(t => t.addRecord(account))

    const result = await manager._makeMultipleQueries(terms)

    expect(result).toMatchObject({ Account: account })
    done()
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
  test('returns an unsubscribe function that stops listening for events if there are no subscriptions left', () => {
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


describe('_compare(...)', () => {
  test(`notifies when a subscriber's subscribed-to record type is included and options were provided (single query)`, () => {
    const account = { type: 'account', id: '1' }

    const expression = { op: 'findRecords', type: 'account' }
    const options = { test: 'test' }

    const id = JSON.stringify({ termsOrExpression: expression, options })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: AddRecordOperation = { op: 'addRecord', record: account }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record type is included and options were provided (multiple queries, with options)`, () => {
    const account = { type: 'account', id: '1' }

    const terms = [{ key: 'Account', expression: { op: 'findRecords', type: 'account' } }]
    const options = { test: 'test' }

    const id = JSON.stringify({ termsOrExpression: terms, options })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: AddRecordOperation = { op: 'addRecord', record: account }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record type is included in a AddRecordOperation`, () => {
    const account = { type: 'account', id: '1' }

    const id = JSON.stringify({ op: 'findRecords', type: 'account' })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: AddRecordOperation = { op: 'addRecord', record: account }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record is included in a AddRecordOperation`, () => {
    const account = { type: 'account', id: '1' }

    const id = JSON.stringify({ op: 'findRecord', record: account })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: AddRecordOperation = { op: 'addRecord', record: account }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record type is included in a ReplaceRecordOperation`, () => {
    const account = { type: 'account', id: '1' }

    const id = JSON.stringify({ op: 'findRecords', type: 'account' })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: ReplaceRecordOperation = { op: 'replaceRecord', record: account }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record is included in a ReplaceRecordOperation`, () => {
    const account = { type: 'account', id: '1' }

    const id = JSON.stringify({ op: 'findRecord', record: account })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: ReplaceRecordOperation = { op: 'replaceRecord', record: account }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record type is included in a RemoveRecordOperation`, () => {
    const account = { type: 'account', id: '1' }

    const id = JSON.stringify({ op: 'findRecords', type: 'account' })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: RemoveRecordOperation = { op: 'removeRecord', record: account }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record is included in a RemoveRecordOperation`, () => {
    const account = { type: 'account', id: '1' }

    const id = JSON.stringify({ op: 'findRecord', record: account })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: RemoveRecordOperation = { op: 'removeRecord', record: account }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record type is included in a ReplaceKeyOperation`, () => {
    const account = { type: 'account', id: '1' }

    const id = JSON.stringify({ op: 'findRecords', type: 'account' })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: ReplaceKeyOperation = { op: 'replaceKey', record: account, key: 'testKey', value: 'test' }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record is included in a ReplaceKeyOperation`, () => {
    const account = { type: 'account', id: '1' }

    const id = JSON.stringify({ op: 'findRecord', record: account })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: ReplaceKeyOperation = { op: 'replaceKey', record: account, key: 'testKey', value: 'test' }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record type is included in a ReplaceAttributeOperation`, () => {
    const account = { type: 'account', id: '1' }

    const id = JSON.stringify({ op: 'findRecords', type: 'account' })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: ReplaceAttributeOperation = { op: 'replaceAttribute', record: account, attribute: 'test', value: 'test' }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record is included in a ReplaceAttributeOperation`, () => {
    const account = { type: 'account', id: '1' }

    const id = JSON.stringify({ op: 'findRecord', record: account })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: ReplaceAttributeOperation = { op: 'replaceAttribute', record: account, attribute: 'test', value: 'test' }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record type is included in a AddToRelatedRecordsOperation (record perspective)`, () => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const id = JSON.stringify({ op: 'findRecords', type: 'account' })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: AddToRelatedRecordsOperation = { op: 'addToRelatedRecords', record: account, relationship: 'services', relatedRecord: service }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record is included in a AddToRelatedRecordsOperation (record perspective)`, () => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const id = JSON.stringify({ op: 'findRecord', record: account })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: AddToRelatedRecordsOperation = { op: 'addToRelatedRecords', record: account, relationship: 'services', relatedRecord: service }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record type is included in a AddToRelatedRecordsOperation (relation perspective)`, () => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const id = JSON.stringify({ op: 'findRecords', type: 'account' })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: AddToRelatedRecordsOperation = { op: 'addToRelatedRecords', record: service, relationship: 'subscribers', relatedRecord: account }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record is included in a AddToRelatedRecordsOperation (relation perspective)`, () => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const id = JSON.stringify({ op: 'findRecord', record: account })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: AddToRelatedRecordsOperation = { op: 'addToRelatedRecords', record: service, relationship: 'subscribers', relatedRecord: account }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record type is included in a RemoveFromRelatedRecordsOperation (record perspective)`, () => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const id = JSON.stringify({ op: 'findRecords', type: 'account' })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: RemoveFromRelatedRecordsOperation = { op: 'removeFromRelatedRecords', record: account, relationship: 'services', relatedRecord: service }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record is included in a RemoveFromRelatedRecordsOperation (record perspective)`, () => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const id = JSON.stringify({ op: 'findRecord', record: account })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: RemoveFromRelatedRecordsOperation = { op: 'removeFromRelatedRecords', record: account, relationship: 'services', relatedRecord: service }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record type is included in a RemoveFromRelatedRecordsOperation (relation perspective)`, () => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const id = JSON.stringify({ op: 'findRecords', type: 'account' })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: RemoveFromRelatedRecordsOperation = { op: 'removeFromRelatedRecords', record: service, relationship: 'subscriptions', relatedRecord: account }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record is included in a RemoveFromRelatedRecordsOperation (relation perspective)`, () => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '1' }

    const id = JSON.stringify({ op: 'findRecord', record: account })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: RemoveFromRelatedRecordsOperation = { op: 'removeFromRelatedRecords', record: service, relationship: 'subscriptions', relatedRecord: account }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record type is included in a ReplaceRelatedRecordsOperation (record perspective)`, () => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '2' }

    const id = JSON.stringify({ op: 'findRecords', type: 'account' })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: ReplaceRelatedRecordsOperation = { op: 'replaceRelatedRecords', record: account, relationship: 'services', relatedRecords: [service] }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record is included in a ReplaceRelatedRecordsOperation (record perspective)`, () => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '2' }

    const id = JSON.stringify({ op: 'findRecord', record: account })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: ReplaceRelatedRecordsOperation = { op: 'replaceRelatedRecords', record: account, relationship: 'services', relatedRecords: [service] }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record type is included in a ReplaceRelatedRecordsOperation (relation perspective)`, () => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '2' }

    const id = JSON.stringify({ op: 'findRecords', type: 'account' })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: ReplaceRelatedRecordsOperation = { op: 'replaceRelatedRecords', record: service, relationship: 'subscriptions', relatedRecords: [account] }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record is included in a ReplaceRelatedRecordsOperation (relation perspective)`, () => {
    const account = { type: 'account', id: '1' }
    const service = { type: 'service', id: '2' }

    const id = JSON.stringify({ op: 'findRecord', record: account })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: ReplaceRelatedRecordsOperation = { op: 'replaceRelatedRecords', record: service, relationship: 'subscriptions', relatedRecords: [account] }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record type is included in a ReplaceRelatedRecordOperation (record perspective)`, () => {
    const account = { type: 'account', id: '1' }
    const profile = { type: 'profile', id: '1' }

    const id = JSON.stringify({ op: 'findRecords', type: 'account' })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: ReplaceRelatedRecordOperation = { op: 'replaceRelatedRecord', record: account, relationship: 'profile', relatedRecord: profile }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record is included in a ReplaceRelatedRecordOperation (record perspective)`, () => {
    const account = { type: 'account', id: '1' }
    const profile = { type: 'profile', id: '1' }

    const id = JSON.stringify({ op: 'findRecord', record: account })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: ReplaceRelatedRecordOperation = { op: 'replaceRelatedRecord', record: account, relationship: 'profile', relatedRecord: profile }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record type is included in a ReplaceRelatedRecordOperation (relation perspective)`, () => {
    const account = { type: 'account', id: '1' }
    const profile = { type: 'profile', id: '1' }

    const id = JSON.stringify({ op: 'findRecords', type: 'account' })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: ReplaceRelatedRecordOperation = { op: 'replaceRelatedRecord', record: profile, relationship: 'account', relatedRecord: account }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  test(`notifies when a subscriber's subscribed-to record is included in a ReplaceRelatedRecordOperation (relation perspective)`, () => {
    const account = { type: 'account', id: '1' }
    const profile = { type: 'profile', id: '1' }

    const id = JSON.stringify({ op: 'findRecord', record: account })

    const listener = jest.fn()
    manager._subscriptions[id] = [listener]

    const operation: ReplaceRelatedRecordOperation = { op: 'replaceRelatedRecord', record: profile, relationship: 'account', relatedRecord: account }
    const transform: Transform = { operations: [operation], id: 'test' }

    manager._compare(transform)

    expect(listener).toHaveBeenCalledTimes(1)
  })
})


