"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const getDisplayName_1 = require("../-utils/getDisplayName");
const utils_1 = require("@orbit/utils");
const determine_subscriptions_1 = require("./determine-subscriptions");
const does_transform_cause_update_1 = require("./does-transform-cause-update");
// import { areArraysShallowlyEqual } from './helpers';
function withDataSubscription(mapRecordsToProps, options) {
    return function wrapSubscription(WrappedComponent) {
        var _a;
        const componentDisplayName = `WithDataSubscription:${options.label}(${getDisplayName_1.getDisplayName(WrappedComponent)})`;
        // TODO:
        //  when the props change, we need to re-evaluate the subscriptions
        return _a = class DataSubscriber extends React.Component {
                constructor(props) {
                    super(props);
                    this.isListening = false;
                    // any changes to these records / record-lists will cause a re-render
                    this.subscriptions = {};
                    // the list of queries to pass in as mapRecordsToProps
                    this.passedQueries = {};
                    /**
                     *
                     * helper / private functions for querying / refreshing data
                     * from the data store
                     *
                     */
                    this.computeSubscriptions = () => {
                        this.passedQueries = mapRecordsToProps(this.props);
                        this.subscriptions = determine_subscriptions_1.determineSubscriptions(this.dataStore, this.passedQueries);
                    };
                    this.trySubscribe = () => {
                        if (this.shouldSubscribe && !this.isListening) {
                            this.isListening = true;
                            this.dataStore.on('transform', this.handleTransform);
                        }
                    };
                    this.tryUnsubscribe = () => {
                        if (this.isListening) {
                            this.isListening = false;
                            this.dataStore.off('transform', this.handleTransform);
                        }
                    };
                    this.handleTransform = (transform) => {
                        if (!this.isListening || !this.hasSubscriptions) {
                            return;
                        }
                        const shouldUpdate = does_transform_cause_update_1.doesTransformCauseUpdate(this.dataStore, transform, this.subscriptions, this.state);
                        if (shouldUpdate) {
                            this.refreshSubscriptionsData();
                        }
                    };
                    this.refreshSubscriptionsData = () => {
                        const results = this.getDataFromCache();
                        this.setState(Object.assign({}, results));
                    };
                    this.getDataFromCache = () => {
                        if (!this.hasSubscriptions) {
                            return {};
                        }
                        const { dataStore } = this.props;
                        const queryForProps = mapRecordsToProps(this.props) || {};
                        let results = {};
                        Object.keys(queryForProps).forEach((propName) => {
                            const query = queryForProps[propName](dataStore.queryBuilder);
                            const result = dataStore.cache.query(query);
                            results[propName] = result;
                        });
                        return results;
                    };
                    utils_1.assert(`Could not find "dataStore" in props of "${componentDisplayName}". \n` +
                        `Either wrap the root component in a <DataProvider>, \n` +
                        `or explicitly pass "dataStore" as a prop to "${componentDisplayName}".`, !!props.dataStore);
                    this.dataStore = props.dataStore;
                    this.computeSubscriptions();
                    this.state = this.getDataFromCache();
                }
                get recordProps() {
                    return Object.keys(this.subscriptions);
                }
                get hasSubscriptions() {
                    return this.recordProps.length > 0;
                }
                get shouldSubscribe() {
                    return this.hasSubscriptions;
                }
                componentDidMount() {
                    this.trySubscribe();
                }
                componentWillUnmount() {
                    this.tryUnsubscribe();
                }
                // shouldComponentUpdate(nextProps: T & IProviderProps /*, nextState */) {
                //   if (this.isListening) {
                //     const newQueries = mapRecordsToProps(nextProps);
                //     const newKeys = Object.keys(newQueries);
                //     if (!areArraysShallowlyEqual(newKeys, this.recordProps)) {
                //       this.computeSubscriptions();
                //       this.refreshSubscriptionsData(); // causes update
                //       return false;
                //     }
                //   }
                //   // default
                //   return true;
                // }
                render() {
                    return React.createElement(WrappedComponent, Object.assign({}, this.props, this.state));
                }
            },
            _a.displayName = componentDisplayName,
            _a;
    };
}
exports.withDataSubscription = withDataSubscription;
