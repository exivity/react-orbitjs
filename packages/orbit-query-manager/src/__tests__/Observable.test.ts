import { Observable } from '../Observable'
import { RecordData, Status } from '../types';

let observable: Observable
beforeEach(() => {
  observable = new Observable()
})

describe('subscribe(...)', () => {
  test('should add a new entry to the _subscriptions map if called for the first time with a certain id', () => {
    const id = 'test'
    const listener = jest.fn()

    expect(observable._subscriptions[id]).toBeUndefined()

    observable.subscribe(id, listener)

    expect(observable._subscriptions[id]).toBeDefined()
  })

  test('should add a new listener to the map entry on the first call', () => {
    const id = 'test'
    const listener = jest.fn()

    observable.subscribe(id, listener)

    expect(observable._subscriptions[id]).toMatchObject([listener])
  })

  test('should add a new listener to the map entry on every consecutive call', () => {
    const id = 'test'
    const listeners = [jest.fn(), jest.fn(), jest.fn()]

    listeners.forEach(listener => observable.subscribe(id, listener))

    expect(observable._subscriptions[id]).toMatchObject(listeners)
  })

  test('should return an unsubscribe function that deletes a listener from the subscriptions', () => {
    const id = 'test'
    const listener1 = jest.fn()
    const listener2 = jest.fn()

    observable.subscribe(id, listener1)
    const unsubscribe = observable.subscribe(id, listener2)

    expect(observable._subscriptions[id]).toMatchObject([listener1, listener2])

    unsubscribe()

    expect(observable._subscriptions[id]).toMatchObject([listener1])
  })

  test('should return an unsubscribe function that deletes the subscriptions entry if no listeners are left', () => {
    const id = 'test'
    const listeners = [jest.fn(), jest.fn(), jest.fn()]

    const unsubscribes = listeners.map(listener => observable.subscribe(id, listener))

    expect(observable._subscriptions[id]).toMatchObject(listeners)

    unsubscribes.forEach(unsubscribe => unsubscribe())

    expect(observable._subscriptions[id]).not.toBeDefined()
  })
})

describe('notify(...)', () => {
  test('should call all listeners added to a map entry for a certain id', () => {
    const id = 'test'
    const listeners = [jest.fn(), jest.fn(), jest.fn()]
    const data = [{ test: { id: '1', type: 'test' } }, { isError: null, isLoading: false }] as [RecordData, Status]

    listeners.forEach(listener => observable.subscribe(id, listener))
    observable.notify(id, data)

    listeners.forEach(listener => {
      expect(listener).toBeCalledTimes(1)
      expect(listener).toBeCalledWith(data)
    })
  })
})