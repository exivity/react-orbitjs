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
  record: IRecord
  listener: Listener
  
  constructor (record: IRecord, listener: Listener) {
    this.listener = listener
    this.record = record
  }

  get id () {
    return this.record.id
  }

  get type () {
    return this.record.type
  }

  get attributes () {
    return this.record.attributes
  }

  get relationships () {
    return this.record.relationships
  }

  setAttribute = curryFn((attribute: string, value: any): this => {
    this.record = produce(this.record, draft => {
        draft.attributes[attribute] = value
    })

    this.listener(this.record)
    return this
  })

  addHasOne = curryFn((relationship: string, recordIdentifier: RecordIdentifier): this => {
    this.record = produce<IRecord, void, IRecord>(this.record, draft => {
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

    this.listener(this.record)
    return this
  })

  addHasMany = curryFn((relationship: string, recordIdentifier: RecordIdentifier): this => {
    this.record = produce<IRecord, void, IRecord>(this.record, draft => {
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

    this.listener(this.record)
    return this
  })

  removeRelationship = curryFn((relationship: string, relatedId: string) => {
    this.record = produce<IRecord, void, IRecord>(this.record, draft => {
      if (hasRelationship.call(draft, relationship)) {
        draft.relationships![relationship].data = Array.isArray(getRelationship.call(draft, relationship))
          ? removeHasMany.call(draft, relationship, relatedId)
          : {}
      }
    })

    this.listener(this.record)
    return this
  })
}
