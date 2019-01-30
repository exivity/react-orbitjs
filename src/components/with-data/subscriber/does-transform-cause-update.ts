import Store from '@orbit/store';
import { Transform, Operation } from '@orbit/data';

import { IQuerySubscriptions } from './determine-subscriptions';


export enum Op {
  // Queries
  FIND_RECORD = 'findRecord',
  FIND_RELATED_RECORD = 'findRelatedRecord',
  FIND_RELATED_RECORDS = 'findRelatedRecords',
  FIND_RECORDS = 'findRecords',

  // Things that can be done to change the store's contents
  ADD_RECORD = 'addRecord',
  REPLACE_RECORD = 'replaceRecord',
  REMOVE_RECORD = 'removeRecord',
  REPLACE_KEY = 'replaceKey',
  REPLACE_ATTRIBUTE = 'replaceAttribute',
  ADD_TO_RELATED_RECORDS = 'addToRelatedRecords',
  REMOVE_FROM_RELATED_RECORDS = 'removeFromRelatedRecords',
  REPLACE_RELATED_RECORD = 'replaceRelatedRecord',
  REPLACE_RELATED_RECORDS = 'replaceRelatedRecords'
}


/**
 * 1. Generate a list of changed records, and potentially changed related records
 * 2. Match against our list of subscriptions
 *
 * @param dataStore
 * @param transform
 * @param subscriptions
 */
export function doesTransformCauseUpdate(
  dataStore: Store,
  transform: Transform,
  subscriptions: IQuerySubscriptions
) {
  let shouldUpdate = false;

  for(let i = 0; i < transform.operations.length; i++) {
    let operation = transform.operations[i];

    const isRelevant = isOperationRelevantToSubscriptions(dataStore, operation, subscriptions);

    if (isRelevant) {
      shouldUpdate = true;
      break;
    }
  }

  return shouldUpdate;
}

function isRecordRelevantToAnySubscription(dataStore: Store, record: any, subscriptions: IQuerySubscriptions) {
  const props = Object.keys(subscriptions);
  let maybeRelevant;

  for (let i = 0; i < props.length; i++) {
    let prop = props[i];
    let qExp = subscriptions[prop];

    if (Op.FIND_RECORD === qExp.op) {
      maybeRelevant = qExp.record.id === record.id && qExp.record.type === record.type;

      if (maybeRelevant) return true;
    } else if (Op.FIND_RELATED_RECORD === qExp.op) {
      const relatedHasOne = dataStore.cache.query(qExp);

      maybeRelevant = relatedHasOne.id === record.id && relatedHasOne.type === record.type;

      if (maybeRelevant) return true;
    } else if (Op.FIND_RELATED_RECORDS === qExp.op) {
      const relatedHasMany = dataStore.cache.query(qExp);

      maybeRelevant = relatedHasMany.find((r: any) => r.id === record.id && r.type === record.type);

      if (maybeRelevant) return true;
    } else if (Op.FIND_RECORDS === qExp.op) {
      maybeRelevant = qExp.type === record.type;

      if (maybeRelevant) return true;
    } else {
      throw new Error(`query expression's op was not recognized for tracking data updates`);
    }
  }

  return false;
}


function isOperationRelevantToSubscriptions(dataStore: Store, operation: Operation, subscriptions: IQuerySubscriptions) {
  let result = false;

  switch (operation.op) {
    case Op.ADD_RECORD:
    case Op.REPLACE_RECORD:
    case Op.REMOVE_RECORD:
    case Op.REPLACE_KEY:
    case Op.REPLACE_ATTRIBUTE:

    case Op.ADD_TO_RELATED_RECORDS:
    case Op.REMOVE_FROM_RELATED_RECORDS:
    case Op.REPLACE_RELATED_RECORD:
    case Op.REPLACE_RELATED_RECORDS:
      // Are we watching this record in anyway?
      if (isRecordRelevantToAnySubscription(dataStore, (operation as any).record, subscriptions)) {
        result = true;
      }

      break;

    // case 'addToRelatedRecords':
    // case 'removeFromRelatedRecords':
    // case 'replaceRelatedRecord':
    //   // Add both record and relatedRecord to updatedRecords, because
    //   // it can modify both its relationships and inverse relationships.
    //   updatedRecords.push(operation.record.type);

    //   const related = modelForRelationOf(
    //     dataStore,
    //     operation.record.type,
    //     operation.relationship
    //   );
    //   updatedRecords.push(related);
    //   break;

    // case 'replaceRelatedRecords':
    //   updatedRecords.push(operation.record.type);

    //   operation.relatedRecords.forEach(relatedRecord => {
    //     updatedRecords.push(relatedRecord.type);
    //   });
    //   break;

    default:
      console.warn('This transform operation is not supported in react-orbitjs.');
  }

  return result;
}