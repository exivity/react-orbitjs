import { IRecord, RecordIdentifier } from 'resma'
import { Extensions } from './types'

export function onFulfilled (extensions: Extensions, callback?: Function) {
  return function fulfilled (record: IRecord|RecordIdentifier) {
    callback && callback(record, extensions)
  }
}

export function onThrow (extensions: Extensions, record: IRecord, callback?: Function) {
  return function thrown (error: Error) {
    callback && callback(error, record, extensions)
  }
}