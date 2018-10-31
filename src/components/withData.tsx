import React, { PureComponent, ComponentType } from 'react';

import { getDisplayName } from '../utils/getDisplayName';

import { OrbitConsumer } from '../contexts/orbit';
import { IProps as IProviderProps } from './DataProvider';
import { withDataSubscription } from './DataSubscriber';
import { MapRecordsToProps, MapRecordsToPropsFn } from './shared';


export function withData<T>(mapRecordsToProps?: MapRecordsToProps<T>) {
  const mapRecords = mapRecordsToProps || {};
  const isMapFunction = typeof mapRecords === 'function';
  const mapRecordsFunction = isMapFunction ? mapRecords : () => mapRecords;

  return function WrapWithData(WrappedComponent: ComponentType<T & IProviderProps>) {
    const ConnectedSubscription = withDataSubscription<T>(
      mapRecordsFunction as MapRecordsToPropsFn<T>
    )(WrappedComponent) as ComponentType<T & IProviderProps>; // TODO: ComponentType is probably wrong?

    return class WithOrbit extends PureComponent<T> {
      static displayName = `WithDataProvider(${getDisplayName(WrappedComponent)})`;

      render() {
        return (
          <OrbitConsumer>
            {(dataProps: IProviderProps) => {
              return <ConnectedSubscription {...this.props} { ...dataProps } />;
            }}  
          </OrbitConsumer>
        );
      }
    }
  }
}

export const withOrbit = withData;