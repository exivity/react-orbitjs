import { IRecord } from 'resma'
import { onFulfilled, onThrow } from './helpers'

import { 
  CreateUpdateOperation,
  DeleteOperation, 
  Extensions,
  BeforeCallback,
  OnCallback,
  OnErrorCallback, 
  Options
 } from './types'

export interface Crud {
    createRecord: CreateUpdateOperation
    updateRecord: CreateUpdateOperation
    deleteRecord: DeleteOperation
    extensions: Extensions
}

export class CrudManager {
  _operations: Crud

  constructor (operations: Crud) {
    this._operations = operations
  }

  _isRecord = (record: IRecord|boolean|void) => record && record.hasOwnProperty('type')

  _operation = async (
    operation: CreateUpdateOperation|DeleteOperation,
    record: IRecord,
    options?: { [key: string]: any },
    beforeCallback?: BeforeCallback,
    onCallback?: OnCallback,
    onErrorCallback?: OnErrorCallback
  ) => {
    const { extensions } = this._operations
    
    if (beforeCallback) {
      const resultBeforeCallback = await beforeCallback(record, extensions)
      const isRecord = this._isRecord(resultBeforeCallback) 
        ? resultBeforeCallback as IRecord
        : record

      if (isRecord) {
        operation(isRecord, options)
          .then(onFulfilled(extensions, onCallback))
          .catch(onThrow(extensions, isRecord, onErrorCallback))
      }
    } else {
      operation(record, options)
        .then(onFulfilled(extensions, onCallback))
        .catch(onThrow(extensions, record, onErrorCallback))
    }
  }

  save = (
    record: IRecord, 
    {
      beforeCreate,
      beforeUpdate,
      onCreate,
      onUpdate,
      onError,
      ...options
    }: Options = {}
  ) => {
    const { createRecord, updateRecord } = this._operations
    
    record.id 
      ? this._operation(updateRecord, record, options, beforeUpdate, onUpdate, onError)
      : this._operation(createRecord, record, options, beforeCreate, onCreate, onError)
  }

  delete = (
    record: IRecord, 
    { 
      beforeDelete, 
      onDelete, 
      onError, 
      ...options 
    }: Options = {}
  ) => {
    const { deleteRecord } = this._operations

    this._operation(deleteRecord, record, options, beforeDelete, onDelete, onError)
  }
}