import { Listener } from './types'

export class Subscription<T> {
  _listeners: Listener<T>[] = []

  id: string

  notify (data: T) {
    this._listeners.forEach(listener => listener(data))
  }

  addListener (listener: Listener<T>) {
    this._listeners.push(listener)
  }

  removeListener (listenerToRemove: Listener<T>) {
    this._listeners = this._listeners.filter(listener => listener !== listenerToRemove)
  }

  hasListeners () {
    return this._listeners.length > 0
  }
}