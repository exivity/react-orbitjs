import { Record } from '@orbit/data';

export function onFulfilled<R extends Record, Extensions extends {}> (
  extensions: Extensions,
  callback?: (record: R, extensions: Extensions) => void
) {
  return function fulfilled (record: R) {
    callback && callback(record, extensions)
  }
}

export function onThrow<R extends Record, Extensions extends {}> (
  extensions: Extensions,
  record: R,
  callback?: (error: Error, record: R, extensions: Extensions) => void
) {
  return function thrown (error: Error) {
    callback && callback(error, record, extensions)
  }
}