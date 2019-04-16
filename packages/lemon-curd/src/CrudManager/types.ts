import { IRecord, RecordIdentifier } from 'resma'

export type Extensions = {
  [key: string]: any
}

export type BeforeCallback = (record: IRecord, extensions: Extensions) => IRecord|Promise<boolean>|boolean

export type OnCallback = (record: IRecord, extensions: Extensions) => void

export type OnErrorCallback = (error: Error, record: IRecord, extensions: Extensions) => void

export interface Options { 
  beforeCreate?: BeforeCallback
  beforeUpdate?: BeforeCallback
  beforeDelete?: BeforeCallback
  onCreate?: OnCallback
  onUpdate?: OnCallback
  onDelete?: OnCallback
  onError?: OnErrorCallback
  [key: string]: any
}

export type CreateUpdateOperation = (record: IRecord, options?: Options) => Promise<IRecord>
export type DeleteOperation = (record: IRecord, options?: Options) => Promise<RecordIdentifier>
