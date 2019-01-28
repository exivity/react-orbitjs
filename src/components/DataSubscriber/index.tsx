import * as React from 'react';

import { getDisplayName } from '../-utils/getDisplayName';

import { IProps as IProviderProps } from '../DataProvider';
import { MapRecordsToPropsFn, RecordsToProps } from '../shared';
import { Transform } from '@orbit/data';
import Store from '@orbit/store';
import { assert } from '@orbit/utils';
import { IQuerySubscriptions } from './determine-subscriptions';
import { doesTransformCauseUpdate } from './does-transform-cause-update';

interface IState {}

export function withDataSubscription<T>(mapRecordsToProps: MapRecordsToPropsFn<T>) {
  return function wrapSubscription(WrappedComponent: React.ComponentType<T>) {
    const componentDisplayName = `WithDataSubscription(${getDisplayName(WrappedComponent)})`;

    return class DataSubscriber extends React.PureComponent<
      T & IProviderProps,
      RecordsToProps,
      IState
    > {
      static displayName = componentDisplayName;

      dataStore!: Store;
      isListening = false;
      subscriptions: IQuerySubscriptions = {};

      // the list of queries to pass in as mapRecordsToProps
      passedQueries: RecordsToProps = {};

      get recordProps() {
        return Object.keys(this.subscriptions);
      }

      get hasSubscriptions() {
        return this.recordProps.length > 0;
      }

      get shouldSubscribe() {
        return this.hasSubscriptions;
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

      componentDidMount() {
        this.trySubscribe();
      }

      componentWillUnmount() {
        this.tryUnsubscribe();
      }

      trySubscribe = () => {
        if (this.shouldSubscribe && !this.isListening) {
          this.isListening = true;
          this.dataStore.on('transform', this.handleTransform);
        }
      };

      tryUnsubscribe = () => {
        if (this.isListening) {
          this.isListening = false;
          this.dataStore.off('transform', this.handleTransform);
        }
      };

      handleTransform = (transform: Transform) => {
        if (!this.isListening || !this.hasSubscriptions) {
          return;
        }

        const shouldUpdate = doesTransformCauseUpdate(
          this.dataStore,
          transform,
          this.subscriptions
        );

        if (shouldUpdate) {
          this.refreshSubscriptions();
        }
      };

      refreshSubscriptions = async () => {
        const results = await this.getDataFromCache();

        this.setState({ ...results });
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
      };

      render() {
        return <WrappedComponent {...this.props} {...this.state} />;
      }
    };
  };
}
