import * as React from 'react';
interface IProvidedDefaultProps {
    error?: Error;
    isLoading: boolean;
    refetch: () => Promise<void>;
}
export declare type IProvidedProps<T> = IProvidedDefaultProps & T;
export interface IQueryOptions {
    passthroughError?: boolean;
    useRemoteDirectly?: boolean;
    timeout?: number;
    mapResultsFn?: (props: any, result: any) => Promise<any>;
}
export declare function areCollectionsRoughlyEqual(a: any, b: any): boolean;
export declare function isEmpty(data: any): boolean;
export declare function timeoutablePromise(timeoutMs: number, promise: Promise<any>): Promise<any>;
export declare function query<T>(mapRecordsToProps: any, options?: IQueryOptions): (InnerComponent: any) => {
    new (props: Readonly<{}>): {
        render(): JSX.Element;
        context: any;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<{}>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callBack?: (() => void) | undefined): void;
        readonly props: Readonly<{
            children?: React.ReactNode;
        }> & Readonly<{}>;
        state: Readonly<{}>;
        refs: {
            [key: string]: React.ReactInstance;
        };
    };
    new (props: {}, context?: any): {
        render(): JSX.Element;
        context: any;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<{}>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callBack?: (() => void) | undefined): void;
        readonly props: Readonly<{
            children?: React.ReactNode;
        }> & Readonly<{}>;
        state: Readonly<{}>;
        refs: {
            [key: string]: React.ReactInstance;
        };
    };
    displayName: string;
    contextType?: React.Context<any> | undefined;
};
export {};
