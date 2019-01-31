import { Schema, KeyMap, Source } from '@orbit/data';
import Store from '@orbit/store';
import { JSONAPISerializer } from '@orbit/jsonapi';
export declare class RemoteIdJSONAPISerializer extends JSONAPISerializer {
    resourceKey(type: string): string;
}
export interface ICreateStoreOptions {
    logging?: boolean;
}
export interface ICreateStoreResult {
    sources: {
        [sourceName: string]: Source;
    };
    store: Store;
}
export declare function createStore(baseUrl: string, schema: Schema, keyMap: KeyMap, options?: ICreateStoreOptions): Promise<ICreateStoreResult>;
