import { RecordIdentity } from '@orbit/data';
import Store from '@orbit/store';
export interface IBuildNewOptions<TAttrs, TRelationships> {
    attributes?: TAttrs;
    relationships?: TRelationships;
}
export interface IQueryOptions {
    include?: string[];
    fields?: {
        [key: string]: string[] | any;
    };
    settings?: any;
}
interface IOrbitRemoteIdTracking {
    keys?: {
        remoteId: string;
    };
}
declare type IRecordIdentity = RecordIdentity & IOrbitRemoteIdTracking;
export declare function localIdFromRecordIdentity(store: Store, recordIdentity: any): any;
export declare function idFromRecordIdentity(store: Store, recordIdentity: IRecordIdentity): string;
export declare function recordIdentityFrom(store: Store, id: string, type: string): any;
export declare function remoteIdentityFrom(store: Store, resource: any): any;
export interface IIdentityFromKeys {
    type?: string;
    id?: string;
    keys?: any;
}
export declare function recordIdentityFromKeys(store: Store, { type, id, keys }: IIdentityFromKeys): any;
export {};
