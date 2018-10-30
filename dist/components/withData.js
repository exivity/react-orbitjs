"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
// import PropTypes from 'prop-types'
var react_1 = require("react");
// import dataStoreShape from "../utils/dataStoreShape"
var shallowEqual_1 = require("../utils/shallowEqual");
var hoistStatics = require("hoist-non-react-statics");
var defaultMapRecordsToProps = {};
var defaultMergeProps = function (recordProps, parentProps) { return (__assign({}, parentProps, recordProps)); };
function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || "Component";
}
function withData(mapRecordsToProps, mergeProps) {
    var shouldSubscribe = Boolean(mapRecordsToProps);
    var mapRecords = mapRecordsToProps || defaultMapRecordsToProps;
    var finalMergeProps = mergeProps || defaultMergeProps;
    return function wrapWithConnect(WrappedComponent) {
        var componentDisplayName = "WithData(" + getDisplayName(WrappedComponent) + ")";
        function computeMergedProps(stateProps, parentProps) {
            return finalMergeProps(stateProps, parentProps);
        }
        var WithData = /** @class */ (function (_super) {
            __extends(WithData, _super);
            function WithData(props, context) {
                var _this = _super.call(this, props, context) || this;
                _this.computeChangedRecordProps = function (selectedRecordProps, dataStore, props) {
                    return _this.selectivelyComputeRecordProps(selectedRecordProps, dataStore, props);
                };
                _this.computeAllRecordProps = function (dataStore, props) {
                    return _this.selectivelyComputeRecordProps(true, dataStore, props);
                };
                _this.selectivelyComputeRecordProps = function (selectedRecordPropsOrAll, dataStore, props) {
                    var recordQueries;
                    if (selectedRecordPropsOrAll === true || selectedRecordPropsOrAll.length) {
                        recordQueries = _this.getRecordQueries(dataStore, props);
                    }
                    if (selectedRecordPropsOrAll === true) {
                        selectedRecordPropsOrAll = Object.keys(recordQueries);
                    }
                    var recordProps = {};
                    selectedRecordPropsOrAll.forEach(function (prop) {
                        try {
                            recordProps[prop] = dataStore.cache.query(recordQueries[prop]);
                        }
                        catch (error) {
                            console.warn(error.message);
                            recordProps[prop] = undefined;
                        }
                    });
                    return recordProps;
                };
                _this.getConvenienceProps = function (dataStore, sources) {
                    if (!_this.convenienceProps) {
                        _this.convenienceProps = {
                            queryStore: function () {
                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments[_i];
                                }
                                return dataStore.query.apply(dataStore, args);
                            },
                            updateStore: function () {
                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                    args[_i] = arguments[_i];
                                }
                                return dataStore.update.apply(dataStore, args);
                            },
                            dataStore: dataStore,
                            sources: sources
                        };
                    }
                    return _this.convenienceProps;
                };
                _this.getRecordQueries = function (dataStore, props) {
                    if (!_this.mapRecordsIsConfigured
                        || (_this.doRecordPropsDependOnOwnProps && _this.haveOwnPropsChanged)) {
                        return _this.configureMapRecords(dataStore, props);
                    }
                    return _this.mapRecordsGivenOwnProps(props);
                };
                _this.mapRecordsGivenOwnProps = function (props) {
                    return _this.recordPropsIsFunction ?
                        mapRecords(props) :
                        mapRecords;
                };
                _this.configureMapRecords = function (dataStore, props) {
                    _this.recordPropsIsFunction = (typeof mapRecords === "function");
                    _this.doRecordPropsDependOnOwnProps = _this.recordPropsIsFunction && mapRecords.length > 0;
                    _this.mapRecordsIsConfigured = true;
                    var recordQueries = _this.mapRecordsGivenOwnProps(props);
                    var recordQueryKeys = Object.keys(recordQueries);
                    recordQueryKeys.forEach(function (prop) { return _this.subscribedModels[prop] = []; });
                    // Iterate all queries, to make a list of models to listen for
                    recordQueryKeys.forEach(function (prop) {
                        var expression = recordQueries[prop](dataStore.queryBuilder).expression;
                        switch (expression.op) {
                            case "findRecord":
                                _this.subscribedModels[prop].push(expression.record.type);
                                break;
                            case "findRecords":
                                _this.subscribedModels[prop].push(expression.type);
                                break;
                            case "findRelatedRecord":
                            case "findRelatedRecords":
                                _this.subscribedModels[prop].push(expression.record.type);
                                _this.subscribedModels[prop].push(_this.dataStore.schema.models[expression.record.type].relationships[expression.relationship].model);
                        }
                    });
                    recordQueryKeys.forEach(function (prop) {
                        _this.subscribedModels[prop] = _this.subscribedModels[prop].filter(function (value, index, self) { return self.indexOf(value) === index; });
                    });
                    return recordQueries;
                };
                _this.updateRecordPropsIfNeeded = function () {
                    var nextRecordProps = {};
                    if (_this.recordProps === null) {
                        // Initial run
                        nextRecordProps = __assign({}, _this.getConvenienceProps(_this.dataStore, _this.sources), _this.computeAllRecordProps(_this.dataStore, _this.props));
                    }
                    else if (_this.haveOwnPropsChanged && _this.doRecordPropsDependOnOwnProps) {
                        nextRecordProps = __assign({}, _this.recordProps, _this.computeAllRecordProps(_this.dataStore, _this.props));
                    }
                    else {
                        nextRecordProps = __assign({}, _this.recordProps, _this.computeChangedRecordProps(_this.dataStoreChangedProps, _this.dataStore, _this.props));
                    }
                    if (_this.recordProps && shallowEqual_1.default(nextRecordProps, _this.recordProps)) {
                        return false;
                    }
                    _this.recordProps = nextRecordProps;
                    return true;
                };
                _this.updateMergedPropsIfNeeded = function () {
                    var nextMergedProps = computeMergedProps(_this.recordProps, _this.props);
                    if (_this.mergedProps && shallowEqual_1.default(nextMergedProps, _this.mergedProps)) {
                        return false;
                    }
                    _this.mergedProps = nextMergedProps;
                    return true;
                };
                _this.trySubscribe = function () {
                    if (shouldSubscribe && !_this.isListening) {
                        _this.isListening = true;
                        _this.dataStore.on("transform", _this.handleTransform);
                    }
                };
                _this.tryUnsubscribe = function () {
                    if (_this.isListening) {
                        _this.isListening = null;
                        _this.dataStore.off("transform", _this.handleTransform);
                    }
                };
                _this.clearCache = function () {
                    _this.convenienceProps = null;
                    _this.recordProps = null;
                    _this.mergedProps = null;
                    _this.haveOwnPropsChanged = true;
                    _this.dataStoreChangedProps = [];
                    _this.hasDataStoreChanged = true;
                    _this.renderedElement = null;
                    _this.mapRecordsIsConfigured = false;
                    _this.subscribedModels = {};
                };
                _this.handleTransform = function (transform) {
                    if (!_this.isListening) {
                        return;
                    }
                    // Iterate all transforms, to see if any of those matches a model in the list of queries
                    var operationModels = [];
                    transform.operations.forEach(function (operation) {
                        switch (operation.op) {
                            case "addRecord":
                            case "replaceRecord":
                                // operation.record may contains some relationships, in this case
                                // its inverse relationships are modified too, we add them to operationModels.
                                operationModels.push(operation.record.type);
                                if (operation.record.relationships === undefined)
                                    break;
                                Object.keys(operation.record.relationships).forEach(function (relationship) {
                                    operationModels.push(_this.dataStore.schema.models[operation.record.type].relationships[relationship].model);
                                });
                                break;
                            case "removeRecord":
                                // If the removed record had some relationships, inverse relationships
                                // are modified too. As operation.record does not contain any relationships
                                // we have to assume that all its inverse relationships defined
                                // in the schema could be impacted and must be added to operationModels.
                                operationModels.push(operation.record.type);
                                var relationships_1 = _this.dataStore.schema.models[operation.record.type].relationships;
                                Object.keys(relationships_1).map(function (k) { return relationships_1[k]; }).forEach(function (relationship) {
                                    operationModels.push(relationship.model);
                                });
                                break;
                            case "replaceKey":
                            case "replaceAttribute":
                                operationModels.push(operation.record.type);
                                break;
                            case "addToRelatedRecords":
                            case "removeFromRelatedRecords":
                            case "replaceRelatedRecord":
                                // Add both record and relatedRecord to operationModels, because
                                // it can modify both its relationships and inverse relationships.
                                operationModels.push(operation.record.type);
                                operationModels.push(_this.dataStore.schema.models[operation.record.type].relationships[operation.relationship].model);
                                break;
                            case "replaceRelatedRecords":
                                operationModels.push(operation.record.type);
                                operation.relatedRecords.forEach(function (relatedRecord) {
                                    operationModels.push(relatedRecord.type);
                                });
                                break;
                            default:
                                console.warn("This transform operation is not supported in react-orbitjs.");
                        }
                    });
                    operationModels.forEach(function (model) {
                        Object.keys(_this.subscribedModels).forEach(function (prop) {
                            if (_this.subscribedModels[prop].includes(model)) {
                                _this.hasDataStoreChanged = true;
                                _this.dataStoreChangedProps.push(prop);
                            }
                        });
                    });
                    _this.forceUpdate();
                };
                _this.dataStore = props.dataStore || context.dataStore;
                _this.sources = props.sources || context.sources;
                if (!_this.dataStore) {
                    throw new Error("Could not find \"dataStore\" in either the context or " +
                        ("props of \"" + componentDisplayName + "\". ") +
                        "Either wrap the root component in a <DataProvider>, " +
                        ("or explicitly pass \"dataStore\" as a prop to \"" + componentDisplayName + "\"."));
                }
                // const storeState = this.dataStore.getState()
                // this.state = {storeState}
                _this.clearCache();
                return _this;
            }
            WithData.prototype.shouldComponentUpdate = function () {
                return this.haveOwnPropsChanged || this.hasDataStoreChanged;
            };
            WithData.prototype.componentDidMount = function () {
                this.trySubscribe();
            };
            WithData.prototype.componentWillReceiveProps = function (nextProps) {
                if (!shallowEqual_1.default(nextProps, this.props)) {
                    this.haveOwnPropsChanged = true;
                }
            };
            WithData.prototype.componentWillUnmount = function () {
                this.tryUnsubscribe();
                this.clearCache();
            };
            WithData.prototype.render = function () {
                var _a = this, haveOwnPropsChanged = _a.haveOwnPropsChanged, hasDataStoreChanged = _a.hasDataStoreChanged, renderedElement = _a.renderedElement;
                var shouldUpdateRecordProps = true;
                if (renderedElement) {
                    shouldUpdateRecordProps = hasDataStoreChanged || (haveOwnPropsChanged && this.doRecordPropsDependOnOwnProps);
                }
                var haveRecordPropsChanged = false;
                if (shouldUpdateRecordProps) {
                    haveRecordPropsChanged = this.updateRecordPropsIfNeeded();
                }
                this.haveOwnPropsChanged = false;
                this.hasDataStoreChanged = false;
                this.dataStoreChangedProps = [];
                var haveMergedPropsChanged = true;
                if (haveRecordPropsChanged ||
                    haveOwnPropsChanged) {
                    haveMergedPropsChanged = this.updateMergedPropsIfNeeded();
                }
                else {
                    haveMergedPropsChanged = false;
                }
                if (!haveMergedPropsChanged && renderedElement) {
                    return renderedElement;
                }
                this.renderedElement = react_1.createElement(WrappedComponent, this.mergedProps);
                return this.renderedElement;
            };
            return WithData;
        }(react_1.Component));
        WithData.displayName = componentDisplayName;
        WithData.WrappedComponent = WrappedComponent;
        // WithData.contextTypes = {
        //   dataStore: dataStoreShape,
        //   sources: PropTypes.object,
        // }
        // WithData.propTypes = {
        //   dataStore: dataStoreShape,
        //   sources: PropTypes.object,
        // }
        return hoistStatics(WithData, WrappedComponent);
    };
}
exports.default = withData;
