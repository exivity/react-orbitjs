import { Subscription } from './Subscription'
import { Listener } from './types'

export class Observable<T> {
  _subscriptions: { [id: string]: Subscription<T> } = {}

  subscribe (id: string, listener: Listener<T>) {
    if (!this._subscriptions[id]) this._subscriptions[id] = new Subscription<T>()
    this._subscriptions[id].addListener(listener)

    return () => {
      this._subscriptions[id].removeListener(listener)
      if (this._subscriptions[id].hasListeners() === false) {
        delete this._subscriptions[id]
      }
    }
  }

  notify (id: string, data: T) {
    if (this._subscriptions[id]) {
      this._subscriptions[id].notify(data)
    }
  }
}