import { TransformBuilder, QueryBuilder, Schema, ModelDefinition } from "@orbit/data";
import { QueryManager } from "../QueryManager";
import Store from "@orbit/store";
import { Dict } from "@orbit/utils";

const modelDefenition: Dict<ModelDefinition> = {

  account: {
    attributes: {
      test: { type: 'string' }
    },
    relationships: {
      profile: { type: 'hasOne', inverse: 'account', model: 'profile' },
      items: { type: 'hasMany', inverse: 'account', model: 'item' },
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
  item: {
    attributes: {
      test: { type: 'string' }
    },
    relationships: {
      account: { type: 'hasOne', inverse: 'items', model: 'account' }
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

test('QueryManager.query(...) should return a queryRef', async (done) => {
  const manager = new QueryManager(store.fork())

  await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

  const queryRef = manager.query({
    Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
  })

  expect(typeof queryRef).toBe('string')
  done()
})

test('QueryManager.subscribe(...) subscribes you to the request being made', async done => {
  const manager = new QueryManager(store.fork())

  await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

  const queryRef = manager.query({
    Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
  }, { initialFetch: true })

  const subscription = new Promise(resolve => {
    manager.subscribe(queryRef, () => { resolve('done') }, { initialFetch: true })
  })

  expect(await subscription).toBe('done')
  done()

})

describe('QueryManager._shouldUpdate(...)', () => {
  let manager: QueryManager

  beforeEach(() => {
    manager = new QueryManager(store.fork())
  })

  test('It should return true when the operation is findRecords and a record of the listened to type present in records', async (done) => {

    const shouldUpdate = manager._shouldUpdate(
      [{ key: 'Test', expression: { op: 'findRecords', type: 'account' } }],
      [{ type: 'account', id: '1' }],
      []
    )

    expect(await shouldUpdate).toBe(true)
    done()
  })

  test('It should return true when the operation is findRecords and a record of the listened to type present in related records', async (done) => {
    const shouldUpdate = manager._shouldUpdate(
      [{ key: 'Test', expression: { op: 'findRecords', type: 'account' } }],
      [],
      [{ type: 'account', id: '1' }]
    )

    expect(await shouldUpdate).toBe(true)
    done()
  })

  test('It should return true with any other operation if a record matches an expression', async (done) => {
    const shouldUpdate = manager._shouldUpdate(
      [{ key: 'Test', expression: { op: 'findRecord', record: { type: 'account', id: '1' } } }],
      [{ type: 'account', id: '1' }],
      []
    )

    expect(await shouldUpdate).toBe(true)
    done()
  })

  test('It should return true with any other operation if a relatedRecord matches an expression (hasOne)', async (done) => {
    const manager = new QueryManager(store.fork())

    await manager._store.update(t => [
      t.addRecord({ type: 'account', id: '1' }),
      t.addRecord({ type: 'profile', id: '1' }),
      t.replaceRelatedRecord({ type: 'account', id: '1' }, 'profile', { type: 'profile', id: '1' })]
    )

    const shouldUpdate1 = manager._shouldUpdate(
      [{ key: 'Test', expression: { op: 'findRecord', record: { type: 'account', id: '1' } } }],
      [],
      [{ type: 'account', id: '1' }]
    )

    expect(await shouldUpdate1).toBe(true)
    done()
  })

  test('It should return true with any other operation if a relatedRecord matches an expression (hasMany)', async (done) => {
    const manager = new QueryManager(store.fork())

    await manager._store.update(t => [
      t.addRecord({ type: 'account', id: '1' }),
      t.addRecord({ type: 'service', id: '1' }),
      t.addToRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' })
    ])

    const shouldUpdate1 = manager._shouldUpdate(
      [{ key: 'Test', expression: { op: 'findRecord', record: { type: 'account', id: '1' } } }],
      [],
      [{ type: 'account', id: '1' }]
    )

    expect(await shouldUpdate1).toBe(true)
    done()
  })
})

describe('Listener gets called for', () => {
  let manager: QueryManager
  beforeEach(() => {
    manager = new QueryManager(store.fork())
  })
  test('AddRecordOperation while listening to a type of record', async done => {
    await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    expect(await subscription).toBe('done')
    done()
  })

  test('ReplaceRecordOperation while listening to a type of record', async done => {
    await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.replaceRecord({ type: 'account', id: '1' }))

    expect(await subscription).toBe('done')
    done()
  })

  test('RemoveRecordOperation while listening to a type of record', async done => {
    await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.removeRecord({ type: 'account', id: '1' }))

    expect(await subscription).toBe('done')
    done()
  })

  test('ReplaceKeyOperation while listening to a type of record', async done => {
    await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.replaceKey({ type: 'account', id: '1' }, 'testKey', 'testValue'))

    expect(await subscription).toBe('done')
    done()
  })

  test('ReplaceAttributeOperation while listening to a type of record', async done => {
    await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.replaceAttribute({ type: 'account', id: '1' }, 'test', 'hello'))

    expect(await subscription).toBe('done')
    done()
  })

  test('AddToRelatedRecordsOperation while listening to a type of record (record perspective)', async done => {
    await manager._store.update(t => [t.addRecord({ type: 'account', id: '1' }), t.addRecord({ type: 'service', id: '1' })])

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.addToRelatedRecords({ type: 'account', id: '1' }, 'services', { type: 'service', id: '1' }))

    expect(await subscription).toBe('done')
    done()
  })

  test('AddToRelatedRecordsOperation while listening to a type of record (relation perspective)', async done => {
    await manager._store.update(t => [t.addRecord({ type: 'account', id: '1' }), t.addRecord({ type: 'service', id: '1' })])

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.addToRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' }))

    expect(await subscription).toBe('done')
    done()
  })

  test('RemoveFromRelatedRecordsOperation while listening to a type of record (record perspective)', async done => {
    await manager._store.update(t => [
      t.addRecord({ type: 'account', id: '1' }),
      t.addRecord({ type: 'service', id: '1' }),
      t.addToRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' })
    ])

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.removeFromRelatedRecords({ type: 'account', id: '1' }, 'services', { type: 'service', id: '1' }))

    expect(await subscription).toBe('done')
    done()
  })

  test('RemoveFromRelatedRecordsOperation while listening to a type of record (relation perspective)', async done => {
    await manager._store.update(t => [
      t.addRecord({ type: 'account', id: '1' }),
      t.addRecord({ type: 'service', id: '1' }),
      t.addToRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' })
    ])

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.removeFromRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' }))

    expect(await subscription).toBe('done')
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

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.replaceRelatedRecords({ type: 'account', id: '1' }, 'services', [{ type: 'service', id: '2' }]))

    expect(await subscription).toBe('done')
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

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.replaceRelatedRecords({ type: 'service', id: '1' }, 'subscribers', [{ type: 'account', id: '2' }]))

    expect(await subscription).toBe('done')
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

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.replaceRelatedRecord({ type: 'account', id: '1' }, 'profile', { type: 'profile', id: '2' }))

    expect(await subscription).toBe('done')
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

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecords('account')
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.replaceRelatedRecord({ type: 'profile', id: '1' }, 'account', { type: 'account', id: '2' }))

    expect(await subscription).toBe('done')
    done()
  })

  test('AddRecordOperation while listening to a specific record', async done => {
    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    expect(await subscription).toBe('done')
    done()
  })

  test('ReplaceRecordOperation while listening to a specific record', async done => {
    await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.replaceRecord({ type: 'account', id: '1' }))

    expect(await subscription).toBe('done')
    done()
  })

  test('RemoveRecordOperation while listening to a specific record', async done => {
    await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.removeRecord({ type: 'account', id: '1' }))

    expect(await subscription).toBe('done')
    done()
  })

  test('ReplaceKeyOperation while listening to a specific record', async done => {
    await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.replaceKey({ type: 'account', id: '1' }, 'testKey', 'testValue'))

    expect(await subscription).toBe('done')
    done()
  })

  test('ReplaceAttributeOperation while listening to a specific record', async done => {
    await manager._store.update(t => t.addRecord({ type: 'account', id: '1' }))

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.replaceAttribute({ type: 'account', id: '1' }, 'test', 'hello'))

    expect(await subscription).toBe('done')
    done()
  })

  test('AddToRelatedRecordsOperation while listening to a specific record (record perspective)', async done => {
    await manager._store.update(t => [t.addRecord({ type: 'account', id: '1' }), t.addRecord({ type: 'service', id: '1' })])

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.addToRelatedRecords({ type: 'account', id: '1' }, 'services', { type: 'service', id: '1' }))

    expect(await subscription).toBe('done')
    done()
  })

  test('AddToRelatedRecordsOperation while listening to a specific record (relation perspective)', async done => {
    await manager._store.update(t => [t.addRecord({ type: 'account', id: '1' }), t.addRecord({ type: 'service', id: '1' })])

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.addToRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' }))

    expect(await subscription).toBe('done')
    done()
  })

  test('RemoveFromRelatedRecordsOperation while listening to a specific record (record perspective)', async done => {
    await manager._store.update(t => [
      t.addRecord({ type: 'account', id: '1' }),
      t.addRecord({ type: 'service', id: '1' }),
      t.addToRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' })
    ])

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.removeFromRelatedRecords({ type: 'account', id: '1' }, 'services', { type: 'service', id: '1' }))

    expect(await subscription).toBe('done')
    done()
  })

  test('RemoveFromRelatedRecordsOperation while listening to a specific record (relation perspective)', async done => {
    await manager._store.update(t => [
      t.addRecord({ type: 'account', id: '1' }),
      t.addRecord({ type: 'service', id: '1' }),
      t.addToRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' })
    ])

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.removeFromRelatedRecords({ type: 'service', id: '1' }, 'subscribers', { type: 'account', id: '1' }))

    expect(await subscription).toBe('done')
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

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.replaceRelatedRecords({ type: 'account', id: '1' }, 'services', [{ type: 'service', id: '2' }]))

    expect(await subscription).toBe('done')
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

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.replaceRelatedRecords({ type: 'service', id: '1' }, 'subscribers', [{ type: 'account', id: '2' }]))

    expect(await subscription).toBe('done')
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

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.replaceRelatedRecord({ type: 'account', id: '1' }, 'profile', { type: 'profile', id: '2' }))

    expect(await subscription).toBe('done')
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

    const queryRef = manager.query({
      Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' })
    })

    const subscription = new Promise(resolve => {
      manager.subscribe(queryRef, () => { resolve('done') })
    })

    manager._store.update(t => t.replaceRelatedRecord({ type: 'profile', id: '1' }, 'account', { type: 'account', id: '2' }))

    expect(await subscription).toBe('done')
    done()
  })
})
