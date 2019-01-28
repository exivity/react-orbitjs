import Store from '@orbit/store';
import { Transform, RecordOperation } from '@orbit/data';

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
export function doesTransformCauseUpdate(dataStore: Store, transform: Transform, subscriptions: IQuerySubscriptions) { 
  let shouldUpdate = false;

   // Iterate all transforms, to see if any of those matches a model in the list of queries
   const updatedRecords: any[] = []

   transform.operations.forEach((operation: RecordOperation) => {
     switch (operation.op) {
       case "addRecord":
       case "replaceRecord":
         // operation.record may contains some relationships, in this case
         // its inverse relationships are modified too, we add them to updatedRecords.
         updatedRecords.push(operation.record.type)
         if (operation.record.relationships === undefined) break;

         const { record: { type }} = operation;
         Object.keys(operation.record.relationships).forEach((relationship) => {
           // is this operation one on one of our watched relationships?
           const model = modelForRelationOf(this.dataStore, type, relationship);

           updatedRecords.push(model)
         })
         break

       case "removeRecord":
         // If the removed record had some relationships, inverse relationships
         // are modified too. As operation.record does not contain any relationships
         // we have to assume that all its inverse relationships defined
         // in the schema could be impacted and must be added to updatedRecords.
         updatedRecords.push(operation.record.type);
         
         const relationships = relationshipsForType(this.dataStore, operation.record.type);

         Object.keys(relationships).map(k => relationships[k]).forEach((relationship) => {
           updatedRecords.push(relationship.model)
         })
         break

       case "replaceKey":
       case "replaceAttribute":
         updatedRecords.push(operation.record.type)
         break

       case "addToRelatedRecords":
       case "removeFromRelatedRecords":
       case "replaceRelatedRecord":
         // Add both record and relatedRecord to updatedRecords, because
         // it can modify both its relationships and inverse relationships.
         updatedRecords.push(operation.record.type)

         const related = modelForRelationOf(this.dataStore, operation.record.type, operation.relationship);
         updatedRecords.push(related)
         break

       case "replaceRelatedRecords":
         updatedRecords.push(operation.record.type)

         operation.relatedRecords.forEach((relatedRecord) => {
           updatedRecords.push(relatedRecord.type)
         })
         break

       default:
         console.warn("This transform operation is not supported in react-orbitjs.")
     }
   })


   updatedRecords.forEach((model) => {
     Object.keys(subscriptions).forEach((prop) => {
       if (subscriptions[prop].includes(model)) {
         shouldUpdate = true;
       }
     })
   })


  return shouldUpdate;
}