import { Subscriptions, RecordData, Status } from './types';

export class Observable {
  _subscriptions: Subscriptions = {}

  subscribe (id: string, listener: Function) {
    if (!this._subscriptions[id]) this._subscriptions[id] = []
    this._subscriptions[id].push(listener)

    return () => {
      this._subscriptions[id] = this._subscriptions[id].filter(item => item !== listener)
      if (this._subscriptions[id].length === 0) delete this._subscriptions[id]
    }
  }

  notify (id: string, data: [RecordData, Status]) {
    if (this._subscriptions[id]) {
      this._subscriptions[id].forEach(listener => listener(data))
    }
  }
}