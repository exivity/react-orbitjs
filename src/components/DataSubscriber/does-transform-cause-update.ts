import Store from '@orbit/store';
import { Transform, RecordOperation } from '@orbit/data';

import { IQuerySubscriptions } from './determine-subscriptions';
import { modelForRelationOf, relationshipsForType } from './helpers';

export function doesTransformCauseUpdate(dataStore: Store, transform: Transform, subscriptions: IQuerySubscriptions) { 
   // Iterate all transforms, to see if any of those matches a model in the list of queries
   const operationModels: any[] = []

   transform.operations.forEach((operation: RecordOperation) => {
     switch (operation.op) {
       case "addRecord":
       case "replaceRecord":
         // operation.record may contains some relationships, in this case
         // its inverse relationships are modified too, we add them to operationModels.
         operationModels.push(operation.record.type)
         if (operation.record.relationships === undefined) break;

         const { record: { type }} = operation;
         Object.keys(operation.record.relationships).forEach((relationship) => {
           // is this operation one on one of our watched relationships?
           const model = modelForRelationOf(this.dataStore, type, relationship);

           operationModels.push(model)
         })
         break

       case "removeRecord":
         // If the removed record had some relationships, inverse relationships
         // are modified too. As operation.record does not contain any relationships
         // we have to assume that all its inverse relationships defined
         // in the schema could be impacted and must be added to operationModels.
         operationModels.push(operation.record.type);
         
         const relationships = relationshipsForType(this.dataStore, operation.record.type);

         Object.keys(relationships).map(k => relationships[k]).forEach((relationship) => {
           operationModels.push(relationship.model)
         })
         break

       case "replaceKey":
       case "replaceAttribute":
         operationModels.push(operation.record.type)
         break

       case "addToRelatedRecords":
       case "removeFromRelatedRecords":
       case "replaceRelatedRecord":
         // Add both record and relatedRecord to operationModels, because
         // it can modify both its relationships and inverse relationships.
         operationModels.push(operation.record.type)

         const related = modelForRelationOf(this.dataStore, operation.record.type, operation.relationship);
         operationModels.push(related)
         break

       case "replaceRelatedRecords":
         operationModels.push(operation.record.type)
         operation.relatedRecords.forEach((relatedRecord) => {
           operationModels.push(relatedRecord.type)
         })
         break

       default:
         console.warn("This transform operation is not supported in react-orbitjs.")
     }
   })

   const uniqueOperationModels = new Set(operationModels)

   uniqueOperationModels.forEach((model) => {
     Object.keys(this.subscribedModels).forEach((prop) => {
       if (this.subscribedModels[prop].includes(model)) {
         this.hasDataStoreChanged = true
         this.dataStoreChangedProps.push(prop)
       }
     })
   })
  return false;
}