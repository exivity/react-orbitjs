import React, { PureComponent, ComponentType } from 'react';

import { getDisplayName } from '../utils/getDisplayName';

import { OrbitContext } from './orbit-context';
import { IProps as IProviderProps } from './DataProvider';
import { withDataSubscription } from './DataSubscriber';
import { MapRecordsToProps, MapRecordsToPropsFn } from './shared';


export function withData<T>(mapRecordsToProps?: MapRecordsToProps<T>) {
  const mapRecords = mapRecordsToProps || {};
  const isMapFunction = typeof mapRecords === 'function';
  const mapRecordsFunction = isMapFunction ? mapRecords : () => mapRecords;

  return (WrappedComponent: ComponentType<T & IProviderProps>) => {
    const ConnectedSubscription = withDataSubscription<T>(
      mapRecordsFunction as MapRecordsToPropsFn<T>
    )(WrappedComponent) as ComponentType<T & IProviderProps>; // TODO: ComponentType is probably wrong?

    return class WithOrbit extends PureComponent<T> {
      static displayName = `WithDataProvider(${getDisplayName(WrappedComponent)})`;

      render() {
        return (
          <OrbitContext.Consumer>
            {(dataProps: IProviderProps) => {
              return <ConnectedSubscription {...this.props} { ...dataProps } />;
            }}  
          </OrbitContext.Consumer>
        );
      }
    }
  }
}

export const withOrbit = withData;