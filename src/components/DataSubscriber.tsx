import * as React from 'react';

import { getDisplayName } from '../utils/getDisplayName';

import { IProps as IProviderProps } from './DataProvider';
import { MapRecordsToPropsFn, RecordsToProps } from './shared';
import { Operation } from '@orbit/data';
import Store from '@orbit/store';

export function withDataSubscription<T>(mapRecordsToProps: MapRecordsToPropsFn<T>) {
  return function wrapSubscription(WrappedComponent: React.ComponentType<T>) {
    const componentDisplayName = `WithDataSubscription(${getDisplayName(WrappedComponent)})`;

    return class DataSubscriber extends React.PureComponent<T & IProviderProps, RecordsToProps> {
      static displayName = componentDisplayName;

      dataStore: Store;

      constructor(props: T & IProviderProps) {
        super(props);

        if (!this.props.dataStore) {
          throw new Error(
            `Could not find "dataStore" in props of "${componentDisplayName}". \n` +
            `Either wrap the root component in a <DataProvider>, \n` +
            `or explicitly pass "dataStore" as a prop to "${componentDisplayName}".`,
          )
        }

        this.dataStore = this.props.dataStore;
        this.state = {};
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
        // this.dataStore.on('transform', this.handleTransform);
        this.getDataFromCache();
      }

      componentWillUnmount() {
        // this.dataStore.off('transform', this.handleTransform);
      }

      handleTransform = (transform: Operation) => {
        const record = transform.record;
        switch (transform.op) {
           // TODO: if transformed record matches one of our records, 
           //       cause a refresh
        }

        console.log('handleTransform', transform, this.state);
        this.forceUpdate();
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
