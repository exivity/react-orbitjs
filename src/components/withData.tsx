import React, { ComponentType } from 'react';
import { QueryBuilder } from '@orbit/data';

import { OrbitConsumer } from './contexts/orbit';
import { IProps as IProvidedProps } from './DataProvider';
import { getDisplayName } from './utilities';

export interface RecordsToProps {
  [key: string]: (q: QueryBuilder) => any;
}
type MapRecordsToPropsFn<TWrappedProps> = (props: TWrappedProps) => RecordsToProps;

export type MapRecordsToProps<TWrappedProps> =
  | RecordsToProps
  | MapRecordsToPropsFn<TWrappedProps>

export function withData<T>(mapRecordsToProps: MapRecordsToProps<T>) {
  return function WrapWithData(WrappedComponent: ComponentType<T & IProvidedProps>) {
    return class WithOrbit extends React.PureComponent<T> {
      static displayName = `WithData(${getDisplayName(WrappedComponent)})`;

      constructor(props: T) {
        super(props);

      }

      render() {
        const {} = this.props;

        const dataProps = { 

        };
  
        return (
          <OrbitConsumer>
            {(dataProps: IProvidedProps) => {
              return (
                <WrappedComponent 
                  { ...dataProps } 
                  { ...this.props } 
                />
              );
            }}  
          </OrbitConsumer>
          
        );
      }
    }
  }
}

export const withOrbit = withData;