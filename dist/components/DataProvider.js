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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var orbit_1 = require("../contexts/orbit");
var DataProvider = /** @class */ (function (_super) {
    __extends(DataProvider, _super);
    function DataProvider(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            dataStore: props.dataStore,
            sources: props.sources,
            // legacy API
            updateStore: props.dataStore.update,
            queryStore: props.dataStore.cache.query
        };
        return _this;
    }
    DataProvider.prototype.render = function () {
        return (react_1.default.createElement(orbit_1.OrbitProvider, { value: this.state }, this.props.children));
    };
    return DataProvider;
}(react_1.Component));
exports.DataProvider = DataProvider;
exports.default = DataProvider;
