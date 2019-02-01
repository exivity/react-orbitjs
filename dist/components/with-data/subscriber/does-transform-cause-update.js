"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Op;
(function (Op) {
    // Queries
    Op["FIND_RECORD"] = "findRecord";
    Op["FIND_RELATED_RECORD"] = "findRelatedRecord";
    Op["FIND_RELATED_RECORDS"] = "findRelatedRecords";
    Op["FIND_RECORDS"] = "findRecords";
    // Things that can be done to change the store's contents
    Op["ADD_RECORD"] = "addRecord";
    Op["REPLACE_RECORD"] = "replaceRecord";
    Op["REMOVE_RECORD"] = "removeRecord";
    Op["REPLACE_KEY"] = "replaceKey";
    Op["REPLACE_ATTRIBUTE"] = "replaceAttribute";
    Op["ADD_TO_RELATED_RECORDS"] = "addToRelatedRecords";
    Op["REMOVE_FROM_RELATED_RECORDS"] = "removeFromRelatedRecords";
    Op["REPLACE_RELATED_RECORD"] = "replaceRelatedRecord";
    Op["REPLACE_RELATED_RECORDS"] = "replaceRelatedRecords";
})(Op = exports.Op || (exports.Op = {}));
/**
 * 1. Generate a list of changed records, and potentially changed related records
 * 2. Match against our list of subscriptions
 *
 * @param dataStore
 * @param transform
 * @param subscriptions
 */
function doesTransformCauseUpdate(dataStore, transform, subscriptions, previousResults) {
    let shouldUpdate = false;
    for (let i = 0; i < transform.operations.length; i++) {
        let operation = transform.operations[i];
        const isRelevant = isOperationRelevantToSubscriptions(dataStore, operation, subscriptions, previousResults);
        if (isRelevant) {
            shouldUpdate = true;
            break;
        }
    }
    return shouldUpdate;
}
exports.doesTransformCauseUpdate = doesTransformCauseUpdate;
function isOperationRelevantToSubscriptions(dataStore, operation, subscriptions, previousResults) {
    switch (operation.op) {
        case Op.ADD_RECORD:
        case Op.REPLACE_RECORD:
        case Op.REPLACE_KEY:
        case Op.REPLACE_ATTRIBUTE:
        case Op.ADD_TO_RELATED_RECORDS:
        case Op.REPLACE_RELATED_RECORD:
        case Op.REPLACE_RELATED_RECORDS:
            // Are we watching this record in anyway?
            if (isRecordRelevantToAnySubscription(dataStore, operation.record, subscriptions)) {
                return true;
            }
            break;
        case Op.REMOVE_RECORD:
        case Op.REMOVE_FROM_RELATED_RECORDS:
            if (wasRecordRemovedFromAnySubscription(dataStore, operation.record, subscriptions, previousResults)) {
                return true;
            }
            break;
    }
    return false;
}
function wasRecordRemovedFromAnySubscription(dataStore, record, subscriptions, previousResults) {
    // NOTE: we can't query for the record, because it was removed.
    return findInSubscription(subscriptions, (qExp, propName) => {
        let previousResult = previousResults[propName];
        let maybeRelevant;
        let queryResult;
        // if the record was removed, and if it was already in our result list,
        // we don't need to check any of the query expressions
        let wasInPreviousResult = isRecordInList(record, Array.isArray(previousResult) ? previousResult : [previousResult]);
        if (wasInPreviousResult) {
            return true;
        }
        switch (qExp.op) {
            case Op.FIND_RECORD:
                maybeRelevant = qExp.record.id === record.id && qExp.record.type === record.type;
                if (maybeRelevant)
                    return true;
                break;
            case Op.FIND_RELATED_RECORD:
            case Op.FIND_RELATED_RECORDS:
                // is the TransformRecordOperation related to the same thing as qExp.record via the relationship?
                let parentRecord = dataStore.cache.query(q => q.findRecord(qExp.record));
                let relationData = parentRecord.relationships[qExp.relationship].data;
                let relationDatas = Array.isArray(relationData) ? relationData : [relationData];
                let relationToRecordExists = isRecordInList(record, relationDatas);
                if (!relationToRecordExists)
                    return true;
                break;
            case Op.FIND_RECORDS:
                // running the query should not have the `record`, but that doesn't mean that it _was_ in the result
                // TODO: will the type here ever be plural?
                if (qExp.type === record.type) {
                    queryResult = dataStore.cache.query(qExp);
                    if (!isRecordInList(record, queryResult)) {
                        return true;
                    }
                }
                break;
            default:
                throw new Error(`query expression's op was not recognized for tracking data updates`);
        }
        return false;
    });
}
function findInSubscription(subscriptions, func) {
    const props = Object.keys(subscriptions);
    for (let i = 0; i < props.length; i++) {
        let prop = props[i];
        let qExp = subscriptions[prop];
        if (func(qExp, prop)) {
            return true;
        }
    }
    return false;
}
function isRecordRelevantToAnySubscription(dataStore, record, subscriptions) {
    return findInSubscription(subscriptions, (qExp) => {
        let maybeRelevant;
        let queryResult = dataStore.cache.query(qExp);
        switch (qExp.op) {
            case Op.FIND_RECORD:
            case Op.FIND_RELATED_RECORD:
                maybeRelevant = isSameRecord(queryResult, record);
                if (maybeRelevant)
                    return true;
                break;
            case Op.FIND_RELATED_RECORDS:
            case Op.FIND_RECORDS:
                maybeRelevant = isRecordInList(record, queryResult);
                if (maybeRelevant)
                    return true;
                break;
            default:
                throw new Error(`query expression's op was not recognized for tracking data updates`);
        }
        return false;
    });
}
function isSameRecord(a, b) {
    return a.id === b.id && a.type === b.type;
}
function isRecordInList(a, list) {
    let result = list.find((l) => isSameRecord(a, l));
    return !!result;
}
