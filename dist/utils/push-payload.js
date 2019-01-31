"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_helpers_1 = require("./store-helpers");
const jsonapi_1 = require("@orbit/jsonapi");
// NOTE: more may be added here
var PAYLOAD_OPERATION;
(function (PAYLOAD_OPERATION) {
    PAYLOAD_OPERATION["ADD_RECORD"] = "addRecord";
    PAYLOAD_OPERATION["REPLACE_RECORD"] = "replaceRecord";
})(PAYLOAD_OPERATION = exports.PAYLOAD_OPERATION || (exports.PAYLOAD_OPERATION = {}));
// TODO: payload should be a valid `{ json:api }` payload
function pushPayload(store, payload, op = PAYLOAD_OPERATION.ADD_RECORD) {
    return __awaiter(this, void 0, void 0, function* () {
        const { keyMap, schema } = store;
        const serializer = new jsonapi_1.JSONAPISerializer({ schema, keyMap });
        const normalized = serializer.deserializeDocument(payload);
        const datas = buildDatas(normalized);
        const included = buildIncluded(normalized);
        const resources = datas.concat(included);
        fixRelationships(store, resources);
        assignIdsToResources(resources, keyMap, schema);
        yield store.update((q) => resources.map((resource) => {
            return q[op](resource);
        }), { skipRemote: true });
    });
}
exports.pushPayload = pushPayload;
function buildIncluded(normalized) {
    const included = normalized.included || [];
    return included;
}
function buildDatas(normalized) {
    const data = normalized.data;
    const records = Array.isArray(data) ? data : [data];
    return records;
}
function fixRelationships(store, resources) {
    resources.forEach((resource) => {
        Object.keys(resource.relationships || {}).forEach((relationName) => {
            const relation = resource.relationships[relationName] || {};
            if (!relation.data) {
                relation.data = [];
            }
            const isHasMany = Array.isArray(relation.data);
            const datas = isHasMany ? relation.data : [relation.data];
            datas.forEach((d) => {
                const recordIdentity = store_helpers_1.recordIdentityFrom(store, d.id, d.type);
                const localId = recordIdentity.id;
                d.id = localId;
            });
        });
    });
}
function assignIdsToResources(resources, keyMap, schema) {
    resources.forEach(resource => assignIds(resource, keyMap, schema));
}
function assignIds(resource, keyMap, schema) {
    resource.keys = { remoteId: resource.id };
    resource.id = keyMap.idFromKeys(resource.type, resource.keys) || schema.generateId(resource.type);
}
