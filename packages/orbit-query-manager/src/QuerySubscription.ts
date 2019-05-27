import { Status, Data } from './types'
import { Subscription } from './Subscription'

export class QuerySubscription {
  _status: Status
  _afterQueryQueue: Function[] = []
  _subscription: Subscription<Data>

  notify (data: Data) {
    this._subscription.notify(data)
    this._runQueueTasks()
  }

  _runQueueTasks () {
    this._afterQueryQueue.forEach(fn => fn())
    this._afterQueryQueue = []
  }
}