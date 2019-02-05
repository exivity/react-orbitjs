"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@orbit/utils");
function modelForRelationOf(dataStore, type, relationship) {
    const model = modelOfType(dataStore, type);
    utils_1.assert(`model or relationship could not be found for the ${type}'s ${relationship}`, !!(model && model.relationships));
    const modelRelationship = model.relationships[relationship];
    utils_1.assert(`relationship ${relationship} was not found in model ${type}`, modelRelationship !== undefined);
    const relatedModel = modelRelationship.model;
    utils_1.assert(`there is no model for the relationship ${relationship} on ${type}`, relatedModel !== undefined);
    return relatedModel;
}
exports.modelForRelationOf = modelForRelationOf;
function modelOfType(dataStore, type) {
    const model = dataStore.schema.models[type];
    utils_1.assert(`model was not found for ${type}`, model !== undefined);
    return model;
}
exports.modelOfType = modelOfType;
function relationshipsForType(dataStore, type) {
    const relationships = modelOfType(dataStore, type).relationships;
    return relationships || {};
}
exports.relationshipsForType = relationshipsForType;
function areArraysShallowlyEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    let eachContainsAllValues = true;
    for (let i = 0; i < a.length; i++) {
        if (!b.includes(a[i])) {
            eachContainsAllValues = false;
            break;
        }
    }
    return eachContainsAllValues;
}
exports.areArraysShallowlyEqual = areArraysShallowlyEqual;
