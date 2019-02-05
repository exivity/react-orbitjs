import * as React from 'react';
import { IProvidedProps as IDataProviderProps } from '../data-provider';
import { MapRecordsToProps, IWithOrbitOptions } from '../shared';
export declare type IProvidedProps = IDataProviderProps;
export declare function withData<TWrappedProps, TResultingProps>(mapRecordsToProps?: MapRecordsToProps<TWrappedProps>, passedOptions?: IWithOrbitOptions): (WrappedComponent: React.ComponentType<TWrappedProps & TResultingProps & import("../data-provider").IState>) => {
    new (props: Readonly<TWrappedProps>): {
        render(): JSX.Element;
        context: any;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<TWrappedProps>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callBack?: (() => void) | undefined): void;
        readonly props: Readonly<{
            children?: React.ReactNode;
        }> & Readonly<TWrappedProps>;
        state: Readonly<{}>;
        refs: {
            [key: string]: React.ReactInstance;
        };
    };
    new (props: TWrappedProps, context?: any): {
        render(): JSX.Element;
        context: any;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<TWrappedProps>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callBack?: (() => void) | undefined): void;
        readonly props: Readonly<{
            children?: React.ReactNode;
        }> & Readonly<TWrappedProps>;
        state: Readonly<{}>;
        refs: {
            [key: string]: React.ReactInstance;
        };
    };
    displayName: string;
    contextType?: React.Context<any> | undefined;
};
export declare const withOrbit: typeof withData;
