import * as React from 'react';
import Store from '@orbit/store';
import Coordinator from '@orbit/coordinator';
import { Source } from '@orbit/data';
import { ICreateStoreResult } from '~/strategies/pessimistic-with-remote-ids';
export interface IProps {
    storeCreator: () => Promise<ICreateStoreResult>;
}
interface IState {
    store?: Store;
    sources?: {
        [sourceName: string]: Source;
    };
}
export declare class APIProvider extends React.Component<IProps, IState> {
    coordinator: Coordinator;
    state: {
        store: undefined;
        sources: undefined;
    };
    constructor(props: any);
    initDataStore(): Promise<void>;
    render(): JSX.Element | null;
}
export {};
