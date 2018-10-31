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
var orbit_1 = require("../contexts/orbit");
var DataSubscriber_1 = require("./DataSubscriber");
function withData(mapRecordsToProps) {
    var mapRecords = mapRecordsToProps || {};
    var isMapFunction = typeof mapRecords === 'function';
    var mapRecordsFunction = isMapFunction ? mapRecords : function () { return mapRecords; };
    return function WrapWithData(WrappedComponent) {
        var _a;
        var ConnectedSubscription = DataSubscriber_1.withDataSubscription(mapRecordsFunction)(WrappedComponent); // TODO: ComponentType is probably wrong?
        return _a = /** @class */ (function (_super) {
                __extends(WithOrbit, _super);
                function WithOrbit() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                WithOrbit.prototype.render = function () {
                    var _this = this;
                    return (react_1.default.createElement(orbit_1.OrbitConsumer, null, function (dataProps) {
                        return react_1.default.createElement(ConnectedSubscription, __assign({}, _this.props, dataProps));
                    }));
                };
                return WithOrbit;
            }(react_1.PureComponent)),
            _a.displayName = "WithDataProvider(" + getDisplayName_1.getDisplayName(WrappedComponent) + ")",
            _a;
    };
}
exports.withData = withData;
exports.withOrbit = withData;
