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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var recompose_1 = require("recompose");
var react_orbitjs_1 = require("react-orbitjs");
// NOTE: all relationships should already be fetched / in the cache
//
// example:
//
// withRelationships((props) => {
//   const { currentUser, currentOrganization } = props;
//
//   return {
//     // many-to-many
//     organizations: [currentUser, 'organizationMemberships', 'organizations'],
//     groups: [currentUser, GROUP_MEMBERSHIPS, GROUPS],
//
//     // has-many
//     ownedProjects: [currentUser, 'projects'],
//
//     // has-one / belongs-to
//     organizationOwner: [currentOrganization, 'owner']
//
//   }
// })
function withRelationships(mappingFn) {
    return function (WrappedComponent) {
        var WithRelationship = /** @class */ (function (_super) {
            __extends(WithRelationship, _super);
            function WithRelationship() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.state = { isLoading: false, error: undefined, result: {} };
                _this.fetchRelationships = function () { return __awaiter(_this, void 0, void 0, function () {
                    var _a, dataStore, relationshipsToFind, resultingRelationshipProps, promises, e_1;
                    var _this = this;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _a = this.props, dataStore = _a.dataStore, relationshipsToFind = _a.relationshipsToFind;
                                resultingRelationshipProps = {};
                                promises = Object.keys(relationshipsToFind).map(function (resultKey) { return __awaiter(_this, void 0, void 0, function () {
                                    var relationshipArgs, relation;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                relationshipArgs = relationshipsToFind[resultKey];
                                                return [4 /*yield*/, retrieveRelation(dataStore, relationshipArgs)];
                                            case 1:
                                                relation = _a.sent();
                                                resultingRelationshipProps[resultKey] = relation;
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, Promise.all(promises)];
                            case 2:
                                _b.sent();
                                return [3 /*break*/, 4];
                            case 3:
                                e_1 = _b.sent();
                                this.setState({ error: e_1 });
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/, resultingRelationshipProps];
                        }
                    });
                }); };
                _this.asyncStarter = function () { return __awaiter(_this, void 0, void 0, function () {
                    var result, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (this.state.isLoading) {
                                    return [2 /*return*/];
                                }
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                this.setState({ isLoading: true, error: undefined });
                                return [4 /*yield*/, this.fetchRelationships()];
                            case 2:
                                result = _a.sent();
                                this.setState({ result: result, isLoading: false, error: undefined });
                                return [3 /*break*/, 4];
                            case 3:
                                error_1 = _a.sent();
                                this.setState({ isLoading: false, error: error_1 });
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); };
                return _this;
            }
            WithRelationship.prototype.componentDidMount = function () {
                this.asyncStarter();
            };
            WithRelationship.prototype.render = function () {
                var _a = this.state, result = _a.result, isLoading = _a.isLoading, error = _a.error;
                var nextProps = __assign({}, this.props, (result || {}), { isLoading: isLoading,
                    error: error });
                return React.createElement(WrappedComponent, __assign({}, nextProps));
            };
            return WithRelationship;
        }(React.PureComponent));
        return recompose_1.compose(recompose_1.withProps(function (props) {
            var mapResult = mappingFn(props);
            return {
                relationshipsToFind: mapResult,
            };
        }), react_orbitjs_1.withData({}))(WithRelationship);
    };
}
exports.withRelationships = withRelationships;
function retrieveRelation(dataStore, relationshipArgs) {
    return __awaiter(this, void 0, void 0, function () {
        var sourceModel, relationshipPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sourceModel = relationshipArgs[0];
                    relationshipPath = relationshipArgs.slice(1);
                    if (!(relationshipPath.length === 2)) return [3 /*break*/, 2];
                    return [4 /*yield*/, retrieveManyToMany(dataStore, sourceModel, relationshipPath)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2: return [4 /*yield*/, retriveDirectRelationship(dataStore, sourceModel, relationshipPath[0])];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function retrieveManyToMany(dataStore, sourceModel, relationshipPath) {
    return __awaiter(this, void 0, void 0, function () {
        var joinRelationship, targetRelationship, joins, targets, promises;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    joinRelationship = relationshipPath[0], targetRelationship = relationshipPath[1];
                    joins = dataStore.cache.query(function (q) { return q.findRelatedRecords(sourceModel, joinRelationship); });
                    targets = [];
                    promises = joins.map(function (joinRecord) { return __awaiter(_this, void 0, void 0, function () {
                        var target;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, dataStore.cache.query(function (q) { return q.findRelatedRecord(joinRecord, targetRelationship); })];
                                case 1:
                                    target = _a.sent();
                                    targets.push(target);
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(promises)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, targets];
            }
        });
    });
}
function retriveDirectRelationship(dataStore, sourceModel, relationshipName) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // TODO: add detection for hasOne vs hasMany, via lookup of the schema from dataStore
            throw new Error('not implemented');
        });
    });
}
