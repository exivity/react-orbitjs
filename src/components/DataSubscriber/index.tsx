import * as React from 'react';

import { getDisplayName } from '../-utils/getDisplayName';

import { IProps as IProviderProps } from '../DataProvider';
import { MapRecordsToPropsFn, RecordsToProps } from '../shared';
import { Transform } from '@orbit/data';
import Store from '@orbit/store';
import { assert } from '@orbit/utils';
import { IQuerySubscriptions, determineSubscriptions } from './determine-subscriptions';
import { doesTransformCauseUpdate } from './does-transform-cause-update';
// import { areArraysShallowlyEqual } from './helpers';
import { IWithOrbitOptions } from '../shared';

export function withDataSubscription<TWrappedProps, TResultingProps>(
  mapRecordsToProps: MapRecordsToPropsFn<TWrappedProps>,
  options: IWithOrbitOptions
) {
  return function wrapSubscription(
    WrappedComponent: React.ComponentType<TWrappedProps & TResultingProps>
  ) {
    const componentDisplayName = `WithDataSubscription:${options.label}(${getDisplayName(
      WrappedComponent
    )})`;

    // TODO:
    //  when the props change, we need to re-evaluate the subscriptions
    return class DataSubscriber extends React.Component<
      TWrappedProps & IProviderProps,
      TResultingProps
    > {
      static displayName = componentDisplayName;

      dataStore!: Store;
      isListening = false;

      // any changes to these records / record-lists will cause a re-render
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

      constructor(props: TWrappedProps & IProviderProps) {
        super(props);

        assert(
          `Could not find "dataStore" in props of "${componentDisplayName}". \n` +
            `Either wrap the root component in a <DataProvider>, \n` +
            `or explicitly pass "dataStore" as a prop to "${componentDisplayName}".`,
          !!props.dataStore
        );

        this.dataStore = props.dataStore;
        this.computeSubscriptions();
        this.state = this.getDataFromCache();
      }

      componentDidMount() {
        this.trySubscribe();
      }

      componentWillUnmount() {
        this.tryUnsubscribe();
      }

      // shouldComponentUpdate(nextProps: T & IProviderProps /*, nextState */) {
      //   if (this.isListening) {
      //     const newQueries = mapRecordsToProps(nextProps);
      //     const newKeys = Object.keys(newQueries);

      //     if (!areArraysShallowlyEqual(newKeys, this.recordProps)) {
      //       this.computeSubscriptions();
      //       this.refreshSubscriptionsData(); // causes update
      //       return false;
      //     }

      //   }

      //   // default
      //   return true;
      // }

      render() {
        return <WrappedComponent {...this.props} {...this.state} />;
      }

      /**
       *
       * helper / private functions for querying / refreshing data
       * from the data store
       *
       */

      computeSubscriptions = () => {
        this.passedQueries = mapRecordsToProps(this.props);
        this.subscriptions = determineSubscriptions(this.dataStore, this.passedQueries);
      };

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

        console.log(componentDisplayName, 'transform received: ', transform, shouldUpdate, this.subscriptions);


        if (shouldUpdate) {
          this.refreshSubscriptionsData();
        }
      };

      refreshSubscriptionsData = () => {
        const results = this.getDataFromCache();

        this.setState({ ...results });
      };

      getDataFromCache = (): TResultingProps => {
        if (!this.hasSubscriptions) {
          return {} as TResultingProps;
        }

        const { dataStore } = this.props;
        const queryForProps = mapRecordsToProps(this.props) || {};

        let results = {};

        Object.keys(queryForProps).forEach((propName: string) => {
          const query = queryForProps[propName](dataStore.queryBuilder);
          const result = dataStore.cache.query(query);

          results[propName] = result;
        });

        console.log('getDataFromCache', componentDisplayName, results);
        return results as TResultingProps;
      };
    };
  };
}
