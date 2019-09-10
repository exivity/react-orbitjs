import * as React from 'react';
import Store from '@orbit/store';
import { QueryOrExpression, QueryBuilder } from '@orbit/data';

type ComponentType<P> = React.ComponentType<P>;
type ComponentClass<P> = React.ComponentClass<P>;

export interface DataProviderProps {
  dataStore: Store;
}

export type RecordsToProps<Keys extends string | number | symbol> = {
  [Key in Keys]: (q: QueryBuilder) => any;
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

export type Matching<InjectedProps, DecorationTargetProps> = {
  [P in keyof DecorationTargetProps]: P extends keyof InjectedProps
      ? InjectedProps[P] extends DecorationTargetProps[P]
          ? DecorationTargetProps[P]
          : InjectedProps[P]
      : DecorationTargetProps[P];
};

export type GetProps<C> = C extends ComponentType<infer P> ? P : never;

type MapRecordsToPropsFn<TRecordProps = {}, TOwnProps = {}> = (props: TOwnProps) => RecordsToProps<keyof TRecordProps>;

export type MapRecordsToProps<TRecordProps = {}, TOwnProps = {}> =
  | RecordsToProps<keyof TRecordProps>
  | MapRecordsToPropsFn<TRecordProps, TOwnProps>

export class DataProvider extends React.Component<DataProviderProps> {}

export type ConnectedComponentClass<C, P> = ComponentClass<JSX.LibraryManagedAttributes<C, P>> & {
  WrappedComponent: C;
};

export interface InferableComponentEnhancerWithProps<TInjectedProps, TNeedsProps> {
  <C extends ComponentType<Matching<TInjectedProps, GetProps<C>>>>(
      component: C
  ): ConnectedComponentClass<C, Omit<GetProps<C>, keyof TInjectedProps> & TNeedsProps>
}

export function withData<TRecordProps = {}, TOwnProps = {}>(
  mapRecordsToProps: MapRecordsToProps<TRecordProps, TOwnProps>
): InferableComponentEnhancerWithProps<TRecordProps & WithDataProps & TOwnProps, TOwnProps>
