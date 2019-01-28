import * as React from 'react';

import { getDisplayName } from '../-utils/getDisplayName';

import { IProps as IProviderProps } from '../DataProvider';
import { MapRecordsToPropsFn, RecordsToProps } from '../shared';
import { Operation, Transform, AddRecordOperation, ReplaceRecordOperation, RemoveRecordOperation, ReplaceKeyOperation, ReplaceAttributeOperation, AddToRelatedRecordsOperation, RemoveFromRelatedRecordsOperation, ReplaceRelatedRecordOperation, ReplaceRelatedRecordsOperation, RecordOperation } from '@orbit/data';
import Store from '@orbit/store';
import { modelForRelationOf } from './helpers';
import { assert } from '@orbit/utils';

interface IState {}


export function withDataSubscription<T>(mapRecordsToProps: MapRecordsToPropsFn<T>) {
  // TODO: calculate shouldSubscribe based on the result of the function
  const shouldSubscribe = Boolean(mapRecordsToProps)

  return function wrapSubscription(WrappedComponent: React.ComponentType<T>) {
    const componentDisplayName = `WithDataSubscription(${getDisplayName(WrappedComponent)})`;

    return class DataSubscriber extends React.PureComponent<T & IProviderProps, RecordsToProps, IState> {
      static displayName = componentDisplayName;

      dataStore!: Store;
      isListening = false;
      subscribedModels = {};

      // the list of queries to pass in as mapRecordsToProps
      passedQueries: RecordsToProps = {};
      
      get hasSubscriptions() {
        return this.state.subscribedModels.length > 0;
      }

      constructor(props: T & IProviderProps) {
        super(props);

        assert(
          `Could not find "dataStore" in props of "${componentDisplayName}". \n` +
          `Either wrap the root component in a <DataProvider>, \n` +
          `or explicitly pass "dataStore" as a prop to "${componentDisplayName}".`,
          !!props.dataStore
        );


        this.dataStore = props.dataStore;
        this.state = {};
        this.passedQueries = mapRecordsToProps(props);
      }

      /**
       * State contains the key-value pairing of desired propNames to their
       * eventual record / record array values
       * @param props 
       */
      // static getDerivedStateFromProps(props: T & IProviderProps /*, state */) {
      //   return mapRecordsToProps(props);
      // };

      componentDidMount() {
        this.trySubscribe()
      }

      trySubscribe = () => {
        if (shouldSubscribe && !this.isListening) {
          this.isListening = true
          this.dataStore.on("transform", this.handleTransform)
        }
      }

      tryUnsubscribe = () => {
        if (this.isListening) {
          this.isListening = false;
          this.dataStore.off("transform", this.handleTransform)
        }
      }

      componentWillUnmount() {
        this.tryUnsubscribe()
      }

      handleTransform = (transform: Transform) => {
        if (!this.isListening || !this.hasSubscriptions) {
          return;
        }

        // Iterate all transforms, to see if any of those matches a model in the list of queries
        const operationModels = []

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
              operationModels.push(operation.record.type)
              const relationships = this.dataStore.schema.models[operation.record.type].relationships;
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
              operationModels.push(this.dataStore.schema.models[operation.record.type].relationships[operation.relationship].model)
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

        this.forceUpdate()
      }

      getDataFromCache = async () => {
        const { dataStore } = this.props;
        const recordsToGet = mapRecordsToProps(this.props) || {};

        let results = {};
        const promises = Object.keys(recordsToGet).map(async key => {
          const result = await dataStore.cache.query(recordsToGet[key]);
          results[key] = result;
        });

        await Promise.all(promises);

        this.setState({ ...results });

        return results;
      }

      render() {
        const recordProps = {
          ...this.state,
        };

        return (
          <WrappedComponent
            { ...this.props }
            { ...recordProps }
          />
        );
      }
    }
  }
}
