"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_orbitjs_1 = require("react-orbitjs");
const errors_1 = require("./errors");
// This is a stupid way to 'deeply' compare things.
// But it kinda works.
// Functions are omitted from the comparison
function areCollectionsRoughlyEqual(a, b) {
    const sameLength = Object.keys(a).length === Object.keys(b).length;
    return sameLength && JSON.stringify(a) === JSON.stringify(b);
}
exports.areCollectionsRoughlyEqual = areCollectionsRoughlyEqual;
function isEmpty(data) {
    return (!data ||
        (Array.isArray(data) && data.length === 0) ||
        (typeof data === 'string' && data.length === 0));
}
exports.isEmpty = isEmpty;
function timeoutablePromise(timeoutMs, promise) {
    const timeout = new Promise((resolve, reject) => {
        const id = setTimeout(() => {
            clearTimeout(id);
            reject(`Timed out after ${timeoutMs} ms.`);
        }, timeoutMs);
    });
    return Promise.race([promise, timeout]);
}
exports.timeoutablePromise = timeoutablePromise;
const defaultOptions = {
    passthroughError: false,
    useRemoteDirectly: false,
    mapResultsFn: null,
    timeout: 5000,
};
// Example Usage
//
// import { query } from '@data';
//
// export default compose(
//   query((passedProps) => {
//
//     return {
//       someKey: q => q.findRecord(...),
//       someOtherKey: [q => q.findRecord, { /* source options */ }]
//     }
//   })
// )(SomeComponent);
//
//
// Why does this exist?
// the react-orbitjs addon actually doesn't give is much.
// it has a "lot" of cache-related handling, but no ergonomic
// way to actually make network requests.
//
// TODO: tie in to react-orbitjs' cache handling.
// TODO: what if we just use orbit directly? do we need react-orbitjs?
function query(mapRecordsToProps, options) {
    let map;
    const opts = Object.assign({}, defaultOptions, (options || {}));
    const { passthroughError, useRemoteDirectly, mapResultsFn } = opts;
    if (typeof mapRecordsToProps !== 'function') {
        map = ( /* props */) => (Object.assign({ cacheKey: 'default-cache-key' }, mapRecordsToProps));
    }
    else {
        map = mapRecordsToProps;
    }
    return (InnerComponent) => {
        class DataWrapper extends React.Component {
            constructor() {
                super(...arguments);
                this.state = { result: {}, error: undefined, isLoading: false };
                // tslint:disable-next-line:variable-name
                this._isMounted = false;
                this.mapResult = {};
                this.fetchData = () => __awaiter(this, void 0, void 0, function* () {
                    const result = map(this.props);
                    const { dataStore, sources: { remote }, } = this.props;
                    const querier = useRemoteDirectly ? remote : dataStore;
                    const responses = {};
                    const resultingKeys = Object.keys(result).filter(k => k !== 'cacheKey');
                    const requestPromises = resultingKeys.map((key) => __awaiter(this, void 0, void 0, function* () {
                        const query = result[key];
                        const args = typeof query === 'function' ? [query] : query;
                        try {
                            const queryResult = yield querier.query(...args);
                            responses[key] = queryResult;
                            return Promise.resolve(queryResult);
                        }
                        catch (e) {
                            if (querier === remote) {
                                querier.requestQueue.skip();
                            }
                            return Promise.reject(e);
                        }
                    }));
                    if (requestPromises.length > 0) {
                        yield timeoutablePromise(opts.timeout, Promise.all(requestPromises));
                    }
                    return responses;
                });
                this.tryFetch = (force = false) => __awaiter(this, void 0, void 0, function* () {
                    const needsFetch = force || (!this.isFetchNeeded() || this.state.isLoading);
                    if (needsFetch) {
                        return;
                    }
                    this.setState({ isLoading: true }, () => __awaiter(this, void 0, void 0, function* () {
                        try {
                            let result = yield this.fetchData();
                            if (mapResultsFn) {
                                result = yield mapResultsFn(this.props, result);
                            }
                            this.setState({ result, isLoading: false });
                        }
                        catch (e) {
                            this.setState({ error: e, isLoading: false });
                        }
                    }));
                });
                this.isFetchNeeded = () => {
                    const result = map(this.props);
                    const dataPropsChanged = areCollectionsRoughlyEqual(result, this.mapResult);
                    if (dataPropsChanged) {
                        return false;
                    }
                    this.mapResult = result;
                    return true;
                };
            }
            componentDidMount() {
                this._isMounted = true;
                this.tryFetch();
            }
            componentDidUpdate() {
                this.tryFetch();
            }
            componentWillUnmount() {
                this._isMounted = false;
            }
            setState(state, callback) {
                if (this._isMounted) {
                    super.setState(state, callback);
                }
            }
            render() {
                const { result, error, isLoading } = this.state;
                const _a = this.props, { dataStore, updateStore, queryStore, sources } = _a, remainingProps = __rest(_a, ["dataStore", "updateStore", "queryStore", "sources"]);
                const dataProps = Object.assign({}, result, { error,
                    isLoading, refetch: this.tryFetch.bind(this, true) });
                if (!passthroughError && error) {
                    return React.createElement(errors_1.ErrorMessage, { error: error });
                }
                return React.createElement(InnerComponent, Object.assign({}, remainingProps, dataProps));
            }
        }
        return react_orbitjs_1.withData({})(DataWrapper);
    };
}
exports.query = query;
