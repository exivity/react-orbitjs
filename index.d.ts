import * as React from 'react';
import Store from '@orbit/store';
import { TransformOrOperations, QueryBuilder, Source } from '@orbit/data';


export interface DataProviderProps {
  dataStore: Store;
}

export interface RecordsToProps {
  [key: string]: (q: QueryBuilder) => any;
}

export interface WithData {
  dataStore: Store;
  sources: { [sourceName: string]: Source };
}

export type WithDataProps =
  & {
    queryStore: (transformOrOperations: TransformOrOperations, options?: object, id?: string) => any;
    updateStore: (transformOrOperations: TransformOrOperations, options?: object, id?: string) => any;
    dataStore: Store;
    sources: { [sourceName: string]: Source };
  }
  & WithData


type MapRecordsToPropsFn = (...args: any[]) => RecordsToProps;

export type MapRecordsToProps =
  | RecordsToProps
  | MapRecordsToPropsFn

export class DataProvider extends React.Component<DataProviderProps> {}


export function withData<TWrappedProps>(mapRecordsToProps: MapRecordsToProps):
  <Props, State>(
    WrappedComponent: React.Component<any, any, any> & { setState(): void}
  ) => React.Component<TWrappedProps & Props, State>;
