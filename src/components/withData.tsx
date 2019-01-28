import * as React from 'react';

import { getDisplayName } from './-utils/getDisplayName';

import { OrbitContext } from './orbit-context';
import { IProps as IProviderProps, IProvidedProps as IDataProviderProps } from './DataProvider';
import { withDataSubscription } from './DataSubscriber';
import { MapRecordsToProps, MapRecordsToPropsFn } from './shared';

export type IProvidedProps = IDataProviderProps;

export function withData<T>(mapRecordsToProps?: MapRecordsToProps<T>) {
  const mapRecords = mapRecordsToProps || {};
  const isMapFunction = typeof mapRecords === 'function';
  const mapRecordsFunction = isMapFunction ? mapRecords : () => mapRecords;

  return (WrappedComponent: React.ComponentType<T & IProviderProps>) => {
    const ConnectedSubscription = withDataSubscription<T>(
      mapRecordsFunction as MapRecordsToPropsFn<T>
    )(WrappedComponent) as React.ComponentType<T & IProviderProps>; // TODO: ComponentType is probably wrong?

    return class WithOrbit extends React.PureComponent<T> {
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