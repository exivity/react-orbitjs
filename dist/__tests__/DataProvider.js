"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_test_renderer_1 = require("react-test-renderer");
var data_1 = require("@orbit/data");
var store_1 = require("@orbit/store");
var index_1 = require("./../index");
var schema = new data_1.Schema({});
var store = new store_1.default({ schema: schema });
test("DataProvider renders children", function () {
    var component = react_test_renderer_1.default.create(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
        react_1.default.createElement("span", null, "test children")));
    var tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
test("DataProvider make dataStore available through context", function () {
    var TestContext = function (props, context) {
        expect(context.dataStore).toBe(store);
        return react_1.default.createElement("span", null, "test context");
    };
    var component = react_test_renderer_1.default.create(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
        react_1.default.createElement(TestContext, null)));
});
