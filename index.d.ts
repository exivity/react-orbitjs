import React, { ComponentClass, ComponentType } from 'react';
import { QueryOrExpression, QueryBuilder, FindRecordTerm, FindRecordsTerm, FindRelatedRecordTerm, FindRelatedRecordsTerm, Source } from '@orbit/data';

export interface DataProviderProps {
  dataStore: Source;
}

export type RecordsToProps<Keys extends string | number | symbol> = {
  [Key in Keys]?: (q: QueryBuilder) => FindRecordTerm | FindRecordsTerm | FindRelatedRecordTerm | FindRelatedRecordsTerm;
}

export interface WithData {
  dataStore: Source;
}

export type WithDataProps =
  & {
    queryStore: (queryOrExpression: QueryOrExpression, options?: object, id?: string) => any
    updateStore: (queryOrExpression: QueryOrExpression, options?: object, id?: string) => any
  }
  & WithData

export type MapRecordsToPropsFn<TRecordProps = {}, TOwnProps = {}> = (props: TOwnProps) => RecordsToProps<keyof TRecordProps>;

export type MapRecordsToProps<TRecordProps = {}, TOwnProps = {}> =
  | RecordsToProps<keyof TRecordProps>
  | MapRecordsToPropsFn<TRecordProps, TOwnProps>

export class DataProvider extends React.Component<DataProviderProps> {}

export function withData<TRecordProps = {}, TOwnProps = {}>(
  mapRecordsToProps?: MapRecordsToProps<TRecordProps, TOwnProps>
): InferableComponentEnhancerWithProps<TRecordProps & WithDataProps>

export type GetProps<C> = C extends ComponentType<infer P> ? P : boolean;

export type ConnectedComponentClass<C, P> = ComponentClass<JSX.LibraryManagedAttributes<C, P>> & {
  WrappedComponent: C;
};

export type InferableComponentEnhancerWithProps<TInjectedProps> =
    <C extends ComponentType<GetProps<C>>>(
        component: C
    ) => ConnectedComponentClass<C, Omit<GetProps<C>, keyof TInjectedProps>>;

