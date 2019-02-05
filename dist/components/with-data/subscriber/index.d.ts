import * as React from 'react';
import { IProps as IProviderProps } from '../../data-provider';
import { MapRecordsToPropsFn, RecordsToProps, IWithOrbitOptions } from '../../shared';
import { Transform } from '@orbit/data';
import Store from '@orbit/store';
import { IQuerySubscriptions } from './determine-subscriptions';
export declare function withDataSubscription<TWrappedProps, TResultingProps>(mapRecordsToProps: MapRecordsToPropsFn<TWrappedProps>, options: IWithOrbitOptions): (WrappedComponent: React.ComponentType<TWrappedProps & TResultingProps>) => {
    new (props: TWrappedProps & IProviderProps): {
        dataStore: Store;
        isListening: boolean;
        subscriptions: IQuerySubscriptions;
        passedQueries: RecordsToProps;
        readonly recordProps: string[];
        readonly hasSubscriptions: boolean;
        readonly shouldSubscribe: boolean;
        componentDidMount(): void;
        componentWillUnmount(): void;
        render(): JSX.Element;
        /**
         *
         * helper / private functions for querying / refreshing data
         * from the data store
         *
         */
        computeSubscriptions: () => void;
        trySubscribe: () => void;
        tryUnsubscribe: () => void;
        handleTransform: (transform: Transform) => void;
        refreshSubscriptionsData: () => void;
        getDataFromCache: () => TResultingProps;
        context: any;
        setState<K extends keyof TResultingProps>(state: TResultingProps | ((prevState: Readonly<TResultingProps>, props: Readonly<TWrappedProps & IProviderProps>) => TResultingProps | Pick<TResultingProps, K> | null) | Pick<TResultingProps, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callBack?: (() => void) | undefined): void;
        readonly props: Readonly<{
            children?: React.ReactNode;
        }> & Readonly<TWrappedProps & IProviderProps>;
        state: Readonly<TResultingProps>;
        refs: {
            [key: string]: React.ReactInstance;
        };
    };
    displayName: string;
    contextType?: React.Context<any> | undefined;
};
