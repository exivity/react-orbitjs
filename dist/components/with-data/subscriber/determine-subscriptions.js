"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function determineSubscriptions(dataStore, recordQueries) {
    const recordQueryKeys = Object.keys(recordQueries);
    const subscriptions = {};
    // Iterate all queries, to make a list of models to listen for
    recordQueryKeys.forEach(prop => {
        const queryExpression = recordQueries[prop](dataStore.queryBuilder).expression;
        subscriptions[prop] = queryExpression;
    });
    return subscriptions;
}
exports.determineSubscriptions = determineSubscriptions;
