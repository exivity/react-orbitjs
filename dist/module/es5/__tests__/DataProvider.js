"use strict";

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactTestRenderer = require("react-test-renderer");

var _reactTestRenderer2 = _interopRequireDefault(_reactTestRenderer);

var _data = require("@orbit/data");

var _store = require("@orbit/store");

var _store2 = _interopRequireDefault(_store);

var _index = require("./../index");

var _dataStoreShape = require("./../utils/dataStoreShape");

var _dataStoreShape2 = _interopRequireDefault(_dataStoreShape);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var schema = new _data.Schema({});
var store = new _store2.default({ schema: schema });

test("DataProvider renders children", function () {
  var component = _reactTestRenderer2.default.create(_react2.default.createElement(
    _index.DataProvider,
    { dataStore: store },
    _react2.default.createElement(
      "span",
      null,
      "test children"
    )
  ));

  var tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test("DataProvider make dataStore available through context", function () {
  var TestContext = function TestContext(props, context) {
    expect(context.dataStore).toBe(store);

    return _react2.default.createElement(
      "span",
      null,
      "test context"
    );
  };

  TestContext.contextTypes = {
    dataStore: _dataStoreShape2.default.isRequired
  };

  var component = _reactTestRenderer2.default.create(_react2.default.createElement(
    _index.DataProvider,
    { dataStore: store },
    _react2.default.createElement(TestContext, null)
  ));
});