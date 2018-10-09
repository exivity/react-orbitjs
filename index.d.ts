import * as React from 'react';
import Store from '@orbit/store';
import { TransformOrOperations, QueryOrExpression, QueryBuilder, Source } from '@orbit/data';


export interface DataProviderProps {
  dataStore: Store;
}

export interface RecordsToProps {
  [key: string]: (q: QueryBuilder) => any;
}

export interface WithData {
  dataStore: Store;
}

export type WithDataProps =
  & {
    queryStore: (queryOrExpression: QueryOrExpression, options?: object, id?: string) => any
    updateStore: (queryOrExpression: QueryOrExpression, options?: object, id?: string) => any
  }
  & WithData


type MapRecordsToPropsFn<TWrappedProps> = (props: TWrappedProps) => RecordsToProps;

export type MapRecordsToProps<TWrappedProps> =
  | RecordsToProps
  | MapRecordsToPropsFn<TWrappedProps>

export class DataProvider extends React.Component<DataProviderProps> {}


export function withData<TWrappedProps>(mapRecordsToProps: MapRecordsToProps<TWrappedProps>):
  <Props, State>(
    WrappedComponent: React.Component<any, any, any>
  ) => React.Component<TWrappedProps & Props>;
