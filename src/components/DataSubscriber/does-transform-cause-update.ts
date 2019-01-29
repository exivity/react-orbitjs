import Store from '@orbit/store';
import { Transform, RecordOperation, Operation } from '@orbit/data';

import { IQuerySubscriptions } from './determine-subscriptions';
import { modelForRelationOf, relationshipsForType } from './helpers';

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

  // Iterate all transforms, to see if any of those matches a model in the list of queries
  const updatedRecords: any[] = [];

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

function isOperationRelevantToAnySubscription(dataStore: Store, operation: Operation, subscriptions: IQuerySubscriptions) {
  const isRelevant = false;
  const props = Object.keys(subscriptions);

  for (let i = 0; i < props.length; i++) {
    let prop = props[i];
    let qExp = subscriptions[prop];

    switch (qExp.op) {
      case 'findRecord':
        isRelevant = (qExp.record.id === record.id && qExp.record.type === record.type);

        break;
      case 'findRelatedRecord':
        console.log('findRelatedRecord not implemented', qExp, record);

        break;
      case 'findRelatedRecords':
        console.log('findRelatedRecords not implemented', qExp, record);
        break;
      case 'findRecords':
        console.log('findRecords not implemented', qExp, record);

        break;
      default:
        throw new Error(`query expression's op was not recognized for tracking data updates`);
    }
  }
  return isRelevant;
}

function isOperationRelevantToSubscriptions(dataStore: Store, operation: Operation, subscriptions: IQuerySubscriptions) {
  let result = false;

  switch (operation.op) {
    case 'addRecord':
    case 'replaceRecord':
      // operation.record may contains some relationships, in this case
      // its inverse relationships are modified too, we add them to updatedRecords.
      updatedRecords.push(operation.record.type);
      if (operation.record.relationships === undefined) break;

      const {
        record: { type },
      } = operation;
      Object.keys(operation.record.relationships).forEach(relationship => {
        // is this operation one on one of our watched relationships?
        const model = modelForRelationOf(dataStore, type, relationship);

        updatedRecords.push(model);
      });
      break;

    case 'removeRecord':
      // If the removed record had some relationships, inverse relationships
      // are modified too. As operation.record does not contain any relationships
      // we have to assume that all its inverse relationships defined
      // in the schema could be impacted and must be added to updatedRecords.
      updatedRecords.push(operation.record.type);

      const relationships = relationshipsForType(dataStore, operation.record.type);

      Object.keys(relationships)
        .map(k => relationships[k])
        .forEach(relationship => {
          updatedRecords.push(relationship.model);
        });
      break;

    case 'replaceKey':
    case 'replaceAttribute':
      updatedRecords.push(operation.record.type);
      break;

    case 'addToRelatedRecords':
    case 'removeFromRelatedRecords':
    case 'replaceRelatedRecord':
      // Add both record and relatedRecord to updatedRecords, because
      // it can modify both its relationships and inverse relationships.
      updatedRecords.push(operation.record.type);

      const related = modelForRelationOf(
        dataStore,
        operation.record.type,
        operation.relationship
      );
      updatedRecords.push(related);
      break;

    case 'replaceRelatedRecords':
      updatedRecords.push(operation.record.type);

      operation.relatedRecords.forEach(relatedRecord => {
        updatedRecords.push(relatedRecord.type);
      });
      break;

    default:
      console.warn('This transform operation is not supported in react-orbitjs.');
  }

  return SpeechRecognitionResult;
}