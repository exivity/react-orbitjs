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
// import PropTypes from "prop-types"
// import dataStoreShape from "../utils/dataStoreShape"
var DataProvider = /** @class */ (function (_super) {
    __extends(DataProvider, _super);
    function DataProvider(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.dataStore = props.dataStore;
        _this.sources = props.sources;
        return _this;
    }
    DataProvider.prototype.getChildContext = function () {
        return { dataStore: this.dataStore, sources: this.sources };
    };
    DataProvider.prototype.render = function () {
        return react_1.Children.only(this.props.children);
    };
    return DataProvider;
}(react_1.Component));
// DataProvider.propTypes = {
//   dataStore: dataStoreShape.isRequired,
//   sources: PropTypes.object,
//   children: PropTypes.element.isRequired,
// }
DataProvider.childContextTypes = {
    dataStore: {},
    sources: {}
};
exports.default = DataProvider;
