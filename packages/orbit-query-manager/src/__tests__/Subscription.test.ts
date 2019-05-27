import { Subscription } from '../Subscription'
import { RecordData, Status } from '../types'

let subscription: Subscription<any>
beforeEach(() => {
  subscription = new Subscription()
})

describe('addListener(...)', () => {
  test('should add a listener to the listeners array', () => {
    const listener = jest.fn()

    expect(subscription._listeners).toMatchObject([])

    subscription.addListener(listener)

    expect(subscription._listeners).toMatchObject([listener])
  })

  test('should add a new listener to the map entry on every consecutive call', () => {
    const listeners = [jest.fn(), jest.fn(), jest.fn()]

    listeners.forEach(listener => subscription.addListener(listener))

    expect(subscription._listeners).toMatchObject(listeners)
  })
})

describe('removeListener(...)', () => {
  test('should remove the listener if its in the listener array', () => {
    const listener = jest.fn()
    const otherListener = jest.fn()

    subscription._listeners = [otherListener, listener, otherListener]

    subscription.removeListener(listener)

    expect(subscription._listeners).toMatchObject([otherListener, otherListener])
  })
})

describe('hasListeners(...)', () => {
  test('should return false when no listeners are in the array', () => {
    const listener = jest.fn()

    const result = subscription.hasListeners()

    expect(result).toBe(false)
  })

  test('should return true when one or more listeners are in the array', () => {
    const listener = jest.fn()

    subscription._listeners = [listener, listener]

    const result = subscription.hasListeners()

    expect(result).toBe(true)
  })
})

describe('notify(...)', () => {
  test('should call all listeners', () => {
    const arg = 'test'
    const listener = jest.fn()

    subscription._listeners = [listener, listener, listener]

    subscription.notify(arg)

    expect(listener).toBeCalledTimes(3)
  })

  test('should call listeners with passed in arg', () => {
    const arg = 'test'
    const listeners = [jest.fn(), jest.fn(), jest.fn()]

    subscription._listeners = listeners

    subscription.notify(arg)

    listeners.forEach(listener => {
      expect(listener).toHaveBeenCalledWith(arg)
    })
  })
})