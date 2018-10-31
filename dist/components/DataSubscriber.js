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
var react_1 = require("react");
var getDisplayName_1 = require("../utils/getDisplayName");
function withDataSubscription(mapRecordsToProps) {
    return function wrapSubscription(WrappedComponent) {
        var _a;
        var componentDisplayName = "WithDataSubscription(" + getDisplayName_1.getDisplayName(WrappedComponent) + ")";
        return _a = /** @class */ (function (_super) {
                __extends(DataSubscriber, _super);
                function DataSubscriber(props) {
                    var _this = _super.call(this, props) || this;
                    if (!_this.props.dataStore) {
                        throw new Error("Could not find \"dataStore\" in props of \"" + componentDisplayName + "\". \n" +
                            "Either wrap the root component in a <DataProvider>, \n" +
                            ("or explicitly pass \"dataStore\" as a prop to \"" + componentDisplayName + "\"."));
                    }
                    return _this;
                }
                /**
                 * State contains the key-value pairing of desired propNames to their
                 * eventual record / record array values
                 * @param props
                 */
                DataSubscriber.getDerivedStateFromProps = function (props /*, state */) {
                    return mapRecordsToProps(props);
                };
                ;
                DataSubscriber.prototype.render = function () {
                    var recordProps = {};
                    return (react_1.default.createElement(WrappedComponent, __assign({}, this.props, recordProps)));
                };
                return DataSubscriber;
            }(react_1.PureComponent)),
            _a.displayName = componentDisplayName,
            _a;
    };
}
exports.withDataSubscription = withDataSubscription;
