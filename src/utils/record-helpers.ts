import { Record } from '@orbit/data';

export function attributesFor(record: Record) {
  return record.attributes || {};
}