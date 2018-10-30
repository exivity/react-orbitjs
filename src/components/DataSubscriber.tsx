import React, { PureComponent, ComponentType } from 'react';

import { getDisplayName } from '~/utils/getDisplayName';

import { IProps as IProviderProps } from './DataProvider';
import { MapRecordsToPropsFn, RecordsToProps } from './shared';

export function withDataSubscription<T>(mapRecordsToProps: MapRecordsToPropsFn<T>) {
  return function wrapSubscription(WrappedComponent: ComponentType<T>) {
    const componentDisplayName = `WithDataSubscription(${getDisplayName(WrappedComponent)})`;

    return class DataSubscriber extends PureComponent<T & IProviderProps, RecordsToProps> {
      static displayName = componentDisplayName;

      constructor(props: T & IProviderProps) {
        super(props);

        if (!this.props.dataStore) {
          throw new Error(
            `Could not find "dataStore" in props of "${componentDisplayName}". ` +
            `Either wrap the root component in a <DataProvider>, ` +
            `or explicitly pass "dataStore" as a prop to "${componentDisplayName}".`,
          )
        }
      }

      /**
       * State contains the key-value pairing of desired propNames to their
       * eventual record / record array values
       * @param props 
       */
      static getDerivedStateFromProps(props: T & IProviderProps /*, state */) {
        return mapRecordsToProps(props);
      };

      render() {
        const recordProps = {

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
