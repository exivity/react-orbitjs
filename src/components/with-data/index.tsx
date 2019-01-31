import * as React from 'react';

import { getDisplayName } from './-utils/getDisplayName';

import { OrbitContext } from '../orbit-context';
import { IProps as IProviderProps, IProvidedProps as IDataProviderProps } from '../data-provider';
import { withDataSubscription } from './subscriber';
import { MapRecordsToProps, MapRecordsToPropsFn, IWithOrbitOptions } from '../shared';

export type IProvidedProps = IDataProviderProps;

const defaultOptions = {
  label: '',
};

export function withData<TWrappedProps, TResultingProps>(
  mapRecordsToProps?: MapRecordsToProps<TWrappedProps>,
  passedOptions?: IWithOrbitOptions
) {
  type FinalResultProps = TWrappedProps & TResultingProps & IProvidedProps;

  const options: IWithOrbitOptions = {
    ...defaultOptions,
    ...(passedOptions || {}),
  };

  const mapRecords = mapRecordsToProps || {};
  let mapRecordsFunction: MapRecordsToPropsFn<TWrappedProps>;

  if (typeof mapRecords === 'function') {
    mapRecordsFunction = mapRecords;
  } else {
    mapRecordsFunction = () => mapRecords;
  }

  return (WrappedComponent: React.ComponentType<FinalResultProps>) => {
    const ConnectedSubscription = withDataSubscription<TWrappedProps, TResultingProps>(
      mapRecordsFunction,
      options
    )(WrappedComponent);

    return class WithOrbit extends React.Component<TWrappedProps> {
      static displayName = `WithOrbitData:${options.label}(${getDisplayName(WrappedComponent)})`;

      render() {
        return (
          <OrbitContext.Consumer>
            {(dataProps: IProviderProps) => {
              return <ConnectedSubscription {...this.props} {...dataProps} />;
            }}
          </OrbitContext.Consumer>
        );
      }
    };
  };
}

export const withOrbit = withData;
