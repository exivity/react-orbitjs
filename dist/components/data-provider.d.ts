import * as React from 'react';
import Store from '@orbit/store';
import { Source, QueryOrExpression, TransformOrOperations } from '@orbit/data';
export interface IProps {
    dataStore: Store;
    sources: {
        [sourceName: string]: Source;
    };
}
export interface IState {
    dataStore: Store;
    sources: {
        [sourceName: string]: Source;
    };
    updateStore: (queryOrExpression: TransformOrOperations, options?: object, id?: string) => any;
    queryStore: (queryOrExpression: QueryOrExpression, options?: object, id?: string) => any;
}
export declare type IProvidedProps = IState;
export declare class DataProvider extends React.Component<IProps, IState> {
    constructor(props: IProps);
    render(): JSX.Element;
}
export default DataProvider;
export declare const OrbitProvider: typeof DataProvider;
