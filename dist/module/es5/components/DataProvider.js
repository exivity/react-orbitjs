"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _dataStoreShape = require("../utils/dataStoreShape");

var _dataStoreShape2 = _interopRequireDefault(_dataStoreShape);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DataProvider = function (_Component) {
  _inherits(DataProvider, _Component);

  function DataProvider(props, context) {
    _classCallCheck(this, DataProvider);

    var _this = _possibleConstructorReturn(this, (DataProvider.__proto__ || Object.getPrototypeOf(DataProvider)).call(this, props, context));

    _this.dataStore = props.dataStore;
    _this.sources = props.sources;
    return _this;
  }

  _createClass(DataProvider, [{
    key: "getChildContext",
    value: function getChildContext() {
      return { dataStore: this.dataStore, sources: this.sources };
    }
  }, {
    key: "render",
    value: function render() {
      return _react.Children.only(this.props.children);
    }
  }]);

  return DataProvider;
}(_react.Component);

DataProvider.propTypes = {
  dataStore: _dataStoreShape2.default.isRequired,
  sources: _propTypes2.default.object,
  children: _propTypes2.default.element.isRequired
};

DataProvider.childContextTypes = {
  dataStore: _dataStoreShape2.default.isRequired,
  sources: _propTypes2.default.object
};

exports.default = DataProvider;