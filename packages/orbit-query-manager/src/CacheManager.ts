import Store from '@orbit/store'
import { Transform, RecordOperation, RecordIdentity } from '@orbit/data'
import { RelatedRecords, Options, Subscriptions } from './types';
import { identityIsEqual } from './helpers';


export class CacheManager<E extends { [key: string]: any } = any> {
  _store: Store
  _storeSnapshot: Store
  subscriptions: Subscriptions

  constructor (store: Store) {
    this._store = store
    this._storeSnapshot = store.fork()
    this.subscriptions = {}
  }

  subscribeToCache (queryRef: string, listener: () => void, options: Options<E>) {
    this._store.on('transform', this._compare.bind(this, queryRef, listener))
  }

  _compare (queryRef: string, listener: () => void, transform: Transform) {
    // Iterate all transforms, to see if any of those matches a model in the list of queries
    const models = this._store.schema.models
    const operations = transform.operations as RecordOperation[]

    const records: RecordIdentity[] = []
    const relatedRecords: RelatedRecords[] = []

    operations.forEach(operation => {
      operation && operation.record && records.push(operation.record)

      switch (operation.op) {
        case 'addToRelatedRecords':
        case 'removeFromRelatedRecords':
        case 'replaceRelatedRecord':
          // Add both record and relatedRecord to records, because
          // it can modify both its relationships and inverse relationships.
          relatedRecords.push({
            owner: operation.record,
            relationship: operation.relationship,
            inverse: models[operation.record.type].relationships![operation.relationship].type,
            identity: operation.relatedRecord,
            type: models[operation.record.type].relationships![operation.relationship].type
          })
          break

        case 'replaceRelatedRecords':
          operation.relatedRecords
            .forEach((relatedRecord) => {
              relatedRecords.push({
                owner: operation.record,
                relationship: operation.relationship,
                inverse: models[operation.record.type].relationships![operation.relationship].type,
                identity: relatedRecord,
                type: models[operation.record.type].relationships![operation.relationship].type
              })
            })
          break

        default:
          console.warn('This transform operation is not supported in react-orbitjs.')
      }
    })

    const terms = this.subscriptions[queryRef].terms

    const uniqueRecords = new Set(records)
    const uniqueRelatedRecords = new Set(relatedRecords)

    let shouldUpdate = false
    terms.forEach(({ expression }) => {
      // if it isn't determined if it should update, keep checking
      if (!shouldUpdate) {
        if (expression.op === 'findRecords') {
          /* To be implemented*/
        } else {

          // if record is updated in any way it should update
          uniqueRecords
            .forEach(record => {
              if (identityIsEqual(expression.record, record)) {
                shouldUpdate = true
              }
            })

          const relationships = models[expression.record.type].relationships

          // if record is replaced, deleted from or added to another models relationships it should update
          if (relationships) {
            uniqueRelatedRecords
              .forEach(({ owner, identity, relationship, type, inverse }) => {
                if (relationships[inverse]) {

                  let oldRelatedRecord
                  if (type === 'hasMany') {
                    oldRelatedRecord = this._storeSnapshot.cache.query(q => q.findRelatedRecords(owner, relationship)
                      .filter({ record: identity })
                    )[0]
                  } else oldRelatedRecord = this._storeSnapshot.cache.query(q => q.findRelatedRecord(owner, relationship))

                  // if oldRelatedRecord is the record being listened to trigger an update
                  if (identityIsEqual(oldRelatedRecord, expression.record)) {
                    shouldUpdate = true
                  }
                }
              })
          }
        }
      }
    })
  }

  unsubscribeToCache (queryRef: string) {
    this.subscriptions[queryRef].listeners--

    if (this.subscriptions[queryRef].listeners === 0) {
      delete this.subscriptions[queryRef]
    }
  }
}
