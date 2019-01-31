import Store from '@orbit/store';
export declare enum PAYLOAD_OPERATION {
    ADD_RECORD = "addRecord",
    REPLACE_RECORD = "replaceRecord"
}
export declare function pushPayload(store: Store, payload: any, op?: PAYLOAD_OPERATION): Promise<void>;
