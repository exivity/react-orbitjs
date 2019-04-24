import produce from 'immer'

import { hasRelationship, getRelationship, removeHasMany, curryFn } from './helpers'

export interface RecordIdentifier {
  id?: string
  type: string
}

export interface IRecord extends RecordIdentifier {
  attributes: {
    [key: string]: any
  }
  relationships?: {
    [key: string]: any
  }
}

export type Listener = (record: IRecord) => void

export class Record {
  _record: IRecord
  _listener: Listener
  
  constructor (record: IRecord, listener: Listener) {
    this._listener = listener
    this._record = record
  }

  get id () {
    return this._record.id
  }

  get type () {
    return this._record.type
  }

  get attributes () {
    return this._record.attributes
  }

  get relationships () {
    return this._record.relationships
  }

  setAttribute = curryFn((attribute: string, value: any): this => {
    this._record = produce(this._record, draft => {
        draft.attributes[attribute] = value
    })

    this._listener(this._record)
    return this
  })

  addHasOne = curryFn((relationship: string, recordIdentifier: RecordIdentifier): this => {
    this._record = produce<IRecord, void, IRecord>(this._record, draft => {
      if (hasRelationship.call(draft, relationship)) {
        draft.relationships![relationship].data = recordIdentifier
      } else if (draft.relationships) {
        draft.relationships[relationship] = { data: recordIdentifier }
      } else {
        draft.relationships = { 
          [relationship]: {
            data: recordIdentifier
          }
        }
      }
    })

    this._listener(this._record)
    return this
  })

  addHasMany = curryFn((relationship: string, recordIdentifier: RecordIdentifier): this => {
    this._record = produce<IRecord, void, IRecord>(this._record, draft => {
      if (hasRelationship.call(draft, relationship)) {
        draft.relationships![relationship].data.push(recordIdentifier)
      } else if (draft.relationships) {
        draft.relationships[relationship] = { data: [ recordIdentifier ] }
      } else {
        draft.relationships = { 
          [relationship]: {
            data: [ recordIdentifier ]
          }
        }
      }
    })

    this._listener(this._record)
    return this
  })

  removeRelationship = curryFn((relationship: string, relatedId: string) => {
    this._record = produce<IRecord, void, IRecord>(this._record, draft => {
      if (hasRelationship.call(draft, relationship)) {
        draft.relationships![relationship].data = Array.isArray(getRelationship.call(draft, relationship))
          ? removeHasMany.call(draft, relationship, relatedId)
          : {}
      }
    })

    this._listener(this._record)
    return this
  })
}
