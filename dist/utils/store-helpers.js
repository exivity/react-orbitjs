"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@orbit/utils");
function localIdFromRecordIdentity(store, recordIdentity) {
    const keyMap = store.keyMap;
    const { keys, type, id: maybeLocalId } = recordIdentity;
    if (keys) {
        return recordIdentity.id;
    }
    return keyMap.idFromKeys(type, { remoteId: maybeLocalId }) || recordIdentity.id;
}
exports.localIdFromRecordIdentity = localIdFromRecordIdentity;
// this should return the remoteId, always.
function idFromRecordIdentity(store, recordIdentity) {
    const keyMap = store.keyMap;
    const keys = recordIdentity.keys;
    if (!keys) {
        // what if id is still a local id? but there are no keys?
        const existingRemoteId = keyMap.idToKey(recordIdentity.type, 'remoteId', recordIdentity.id);
        return existingRemoteId || recordIdentity.id;
    }
    const remoteId = keys.remoteId;
    return remoteId || recordIdentity.id;
}
exports.idFromRecordIdentity = idFromRecordIdentity;
function recordIdentityFrom(store, id, type) {
    return recordIdentityFromKeys(store, { keys: { remoteId: id }, type });
}
exports.recordIdentityFrom = recordIdentityFrom;
function remoteIdentityFrom(store, resource) {
    if (!resource.keys) {
        // the returned id is a local id
        // resource id becomes the keys.remoteId
        return recordIdentityFrom(store, resource.id, resource.type);
    }
    return resource;
}
exports.remoteIdentityFrom = remoteIdentityFrom;
function recordIdentityFromKeys(store, { type, id, keys }) {
    utils_1.assert(`type (${type}) and either id or keys must be specified`, type !== undefined && (id !== undefined || keys !== undefined));
    const { keyMap, schema } = store;
    const recordIdentity = {
        type,
        keys: keys || { remoteId: keyMap.idToKey(type, 'remoteId', id) },
        id: id || keyMap.idFromKeys(type, keys) || schema.generateId(type),
    };
    keyMap.pushRecord(recordIdentity);
    return recordIdentity;
}
exports.recordIdentityFromKeys = recordIdentityFromKeys;
