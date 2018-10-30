"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_test_renderer_1 = require("react-test-renderer");
var data_1 = require("@orbit/data");
var store_1 = require("@orbit/store");
var index_1 = require("./../index");
// Unfortunately, on Windows we can't use async/await for tests
// see https://github.com/facebook/jest/issues/3750 for more info
var definition = {
    models: {
        todo: {
            attributes: {
                description: { type: "string" },
            },
            relationships: {
                owner: { type: "hasOne", model: "user", inverse: "todos" },
            },
        },
        user: {
            attributes: {
                name: { type: "string" },
            },
            relationships: {
                todos: { type: "hasMany", model: "todo", inverse: "owner" },
            },
        },
    },
};
var schema = new data_1.Schema(definition);
var store;
beforeEach(function () {
    store = new store_1.default({ schema: schema });
});
afterEach(function () {
    // ...
});
// This will output a message to the console (Consider adding an error boundary
// to your tree to customize error handling behavior.)
test("withData requires a dataStore", function () {
    var Test = function () {
        return react_1.default.createElement("span", null, "test");
    };
    var TestWithData = index_1.withData()(Test);
    expect(function () {
        react_test_renderer_1.default.create(react_1.default.createElement(TestWithData, null));
    }).toThrow();
});
test("withData renders children", function () {
    var Test = function () {
        return react_1.default.createElement("span", null, "test withdata");
    };
    var TestWithData = index_1.withData()(Test);
    var component = react_test_renderer_1.default.create(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
        react_1.default.createElement(TestWithData, null)));
    var tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
test("withData subscribes and unsubscribes from store event", function () {
    var Test = function () {
        return react_1.default.createElement("span", null, "test");
    };
    var mapRecordsToProps = {
        todos: function (q) { return q.findRecords("todo"); },
    };
    var TestWithData = index_1.withData(mapRecordsToProps)(Test);
    expect(store.listeners("transform")).toHaveLength(0);
    var component = react_test_renderer_1.default.create(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
        react_1.default.createElement(TestWithData, null)));
    expect(store.listeners("transform")).toHaveLength(1);
    component.unmount();
    expect(store.listeners("transform")).toHaveLength(0);
});
test("withData passes records as prop", function () {
    var Test = function (_a) {
        var todos = _a.todos;
        expect(todos).toHaveLength(0);
        return react_1.default.createElement("span", null, "test");
    };
    var mapRecordsToProps = {
        todos: function (q) { return q.findRecords("todo"); },
    };
    var TestWithData = index_1.withData(mapRecordsToProps)(Test);
    var component = react_test_renderer_1.default.create(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
        react_1.default.createElement(TestWithData, null)));
});
test("withData passes non-existing record as undefined in findRecord", function () {
    var Test = function (_a) {
        var todo = _a.todo;
        expect(todo).toBeUndefined();
        return react_1.default.createElement("span", null, "test");
    };
    var mapRecordsToProps = {
        todo: function (q) { return q.findRecord({ type: "todo", id: "non-existing" }); },
    };
    var TestWithData = index_1.withData(mapRecordsToProps)(Test);
    var component = react_test_renderer_1.default.create(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
        react_1.default.createElement(TestWithData, null)));
});
test("withData passes non-existing record as empty array in findRecords", function () {
    var Test = function (_a) {
        var todos = _a.todos;
        expect(todos).toHaveLength(0);
        return react_1.default.createElement("span", null, "test");
    };
    var mapRecordsToProps = {
        todos: function (q) { return q.findRecords("todo"); },
    };
    var TestWithData = index_1.withData(mapRecordsToProps)(Test);
    var component = react_test_renderer_1.default.create(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
        react_1.default.createElement(TestWithData, null)));
});
test("withData passes queryStore", function () {
    var Test = function (_a) {
        var queryStore = _a.queryStore;
        expect(typeof queryStore).toEqual("function");
        // queryStore should return a promise
        expect(typeof queryStore(function (q) { return q.findRecords("todo"); })).toEqual("object");
        return react_1.default.createElement("span", null, "test");
    };
    var TestWithData = index_1.withData()(Test);
    var component = react_test_renderer_1.default.create(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
        react_1.default.createElement(TestWithData, null)));
});
test("withData passes updateStore", function () {
    var Test = function (_a) {
        var updateStore = _a.updateStore;
        expect(typeof updateStore).toEqual("function");
        // updateStore should return a promise
        expect(typeof updateStore(function (t) { return t.addRecord({}); })).toEqual("object");
        return react_1.default.createElement("span", null, "test");
    };
    var TestWithData = index_1.withData()(Test);
    var component = react_test_renderer_1.default.create(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
        react_1.default.createElement(TestWithData, null)));
});
test("withData receives updates for findRecord", function (done) {
    var callCount = 0;
    var record = {
        type: "todo",
        id: "my-first-todo",
        attributes: {
            description: "Run tests",
        },
    };
    var testTodo = function (todo) {
        if (callCount++ === 1) {
            expect(todo).toEqual(record);
            done();
        }
    };
    var Test = function (_a) {
        var todo = _a.todo;
        testTodo(todo);
        return react_1.default.createElement("span", null, "test");
    };
    var mapRecordsToProps = {
        todo: function (q) { return q.findRecord({ type: "todo", id: "my-first-todo" }); },
    };
    var TestWithData = index_1.withData(mapRecordsToProps)(Test);
    var component = react_test_renderer_1.default.create(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
        react_1.default.createElement(TestWithData, null)));
    store.update(function (t) { return t.addRecord(record); });
});
test("withData receives updates for findRecords", function (done) {
    var callCount = 0;
    var testTodos = function (todos) {
        expect(todos).toHaveLength(callCount++);
        if (callCount === 2) {
            done();
        }
    };
    var Test = function (_a) {
        var todos = _a.todos;
        testTodos(todos);
        return react_1.default.createElement("span", null, "test");
    };
    var mapRecordsToProps = {
        todos: function (q) { return q.findRecords("todo"); },
    };
    var TestWithData = index_1.withData(mapRecordsToProps)(Test);
    var component = react_test_renderer_1.default.create(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
        react_1.default.createElement(TestWithData, null)));
    store.update(function (t) { return t.addRecord({
        type: "todo",
        id: "my-first-todo",
        attributes: {
            description: "Run tests",
        },
    }); });
});
test("withData receives updates for findRelatedRecord", function (done) {
    // Unfortunately, on Windows we can't use async/await for tests
    // see https://github.com/facebook/jest/issues/3750 for more info
    var callCount = 0;
    var user = {
        type: "user",
        id: "test-user",
        attributes: {
            name: "Test user",
        },
    };
    var updatedName = "updated-test-user";
    store
        .update(function (t) { return t.addRecord(user); })
        .then(function () {
        return store.update(function (t) { return t.addRecord({
            type: "todo",
            id: "my-first-todo",
            attributes: {
                description: "Run tests",
            },
        }); });
    })
        .then(function () {
        var testTodos = function (owner) {
            callCount++;
            if (callCount === 1) {
                expect(owner).toBeNull();
            }
            else if (callCount === 2) {
                expect(owner).toMatchObject(user);
            }
            else if (callCount === 3) {
                expect(owner.attributes.name).toEqual(updatedName);
            }
            else if (callCount === 4) {
                expect(owner).toBeNull();
                done();
            }
        };
        var Test = function (_a) {
            var owner = _a.owner;
            testTodos(owner);
            return react_1.default.createElement("span", null, "test");
        };
        var mapRecordsToProps = {
            owner: function (q) { return q.findRelatedRecord({
                type: "todo",
                id: "my-first-todo",
            }, "owner"); },
        };
        var TestWithData = index_1.withData(mapRecordsToProps)(Test);
        var component = react_test_renderer_1.default.create(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
            react_1.default.createElement(TestWithData, null)));
        store.update(function (t) { return t.replaceRelatedRecord({ type: "todo", id: "my-first-todo" }, "owner", { type: "user", id: "test-user" }); }).then(function () {
            store.update(function (t) { return t.replaceAttribute({ type: "user", id: "test-user" }, "name", updatedName); });
        }).then(function () {
            store.update(function (t) { return t.replaceRelatedRecord({ type: "todo", id: "my-first-todo" }, "owner", null); });
        });
    });
});
test("withData receives updates for findRelatedRecords", function (done) {
    // Unfortunately, on Windows we can't use async/await for tests
    // see https://github.com/facebook/jest/issues/3750 for more info
    var callCount = 0;
    var updatedDescription = "Run tests again";
    store
        .update(function (t) { return t.addRecord({
        type: "user",
        id: "test-user",
        attributes: {
            name: "Test user",
        },
    }); })
        .then(function () {
        return store.update(function (t) { return t.addRecord({
            type: "todo",
            id: "my-first-todo",
            attributes: {
                description: "Run tests",
            },
        }); });
    })
        .then(function () {
        var testTodos = function (todos, user) {
            callCount++;
            if (callCount === 1) {
                expect(todos).toHaveLength(0);
            }
            else if (callCount === 2) {
                expect(todos).toHaveLength(1);
                expect(user.relationships.todos.data).toHaveLength(1);
            }
            else if (callCount === 3) {
                expect(todos).toHaveLength(1);
                expect(todos[0].attributes.description).toEqual(updatedDescription);
                expect(user.relationships.todos.data).toHaveLength(1);
            }
            else if (callCount === 4) {
                expect(todos).toHaveLength(0);
                expect(user.relationships.todos.data).toHaveLength(0);
            }
            else if (callCount === 5) {
                expect(todos).toHaveLength(1);
                expect(user.relationships.todos.data).toHaveLength(1);
            }
            else if (callCount === 6) {
                expect(todos).toHaveLength(0);
                expect(user.relationships.todos.data).toHaveLength(0);
                done();
            }
        };
        var Test = function (_a) {
            var todos = _a.todos, user = _a.user;
            testTodos(todos, user);
            return react_1.default.createElement("span", null, "test");
        };
        var mapRecordsToProps = {
            user: function (q) { return q.findRecord({ type: "user", id: "test-user" }); },
            todos: function (q) { return q.findRelatedRecords({
                type: "user",
                id: "test-user",
            }, "todos"); },
        };
        var TestWithData = index_1.withData(mapRecordsToProps)(Test);
        var component = react_test_renderer_1.default.create(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
            react_1.default.createElement(TestWithData, null)));
        store.update(function (t) { return t.addToRelatedRecords({ type: "user", id: "test-user" }, "todos", { type: "todo", id: "my-first-todo" }); }).then(function () {
            return store.update(function (t) { return t.replaceAttribute({ type: "todo", id: "my-first-todo" }, "description", updatedDescription); });
        }).then(function () {
            store.update(function (t) { return t.removeFromRelatedRecords({ type: "user", id: "test-user" }, "todos", { type: "todo", id: "my-first-todo" }); });
        }).then(function () {
            store.update(function (t) { return t.addRecord({
                type: "todo",
                id: "my-second-todo",
                attributes: {
                    description: "Run more tests",
                },
                relationships: {
                    owner: {
                        data: { type: "user", id: "test-user" },
                    }
                }
            }); });
        }).then(function () {
            store.update(function (t) { return t.removeRecord({
                type: "todo",
                id: "my-second-todo"
            }); });
        });
    });
});
test("withData receives updates for multiple keys", function (done) {
    // Unfortunately, on Windows we can't use async/await for tests
    // see https://github.com/facebook/jest/issues/3750 for more info
    var callCount = 0;
    store
        .update(function (t) { return t.addRecord({
        type: "user",
        id: "test-user",
        attributes: {
            name: "Test user",
        },
    }); })
        .then(function () {
        return store.update(function (t) { return t.addRecord({
            type: "todo",
            id: "my-first-todo",
            attributes: {
                description: "Run tests",
            },
        }); });
    })
        .then(function () {
        var testTodos = function (_a) {
            var todos = _a.todos, users = _a.users;
            callCount++;
            if (callCount === 1) {
                expect(todos).toHaveLength(1);
                expect(users).toHaveLength(1);
            }
            else if (callCount === 2) {
                expect(todos).toHaveLength(2);
                expect(users).toHaveLength(1);
            }
            else if (callCount === 3) {
                expect(todos).toHaveLength(2);
                expect(users).toHaveLength(2);
                done();
            }
        };
        var Test = function (_a) {
            var todos = _a.todos, users = _a.users;
            testTodos({ todos: todos, users: users });
            return react_1.default.createElement("span", null, "test");
        };
        var mapRecordsToProps = {
            todos: function (q) { return q.findRecords("todo"); },
            users: function (q) { return q.findRecords("user"); },
        };
        var TestWithData = index_1.withData(mapRecordsToProps)(Test);
        var component = react_test_renderer_1.default.create(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
            react_1.default.createElement(TestWithData, null)));
        store.update(function (t) { return t.addRecord({
            type: "todo",
            id: "my-second-todo",
            attributes: {
                description: "Run more tests",
            },
        }); }).then(function () {
            store.update(function (t) { return t.addRecord({
                type: "user",
                id: "another-user",
                attributes: {
                    name: "Another user",
                },
            }); });
        });
    });
});
test("withData keeps references for unchanged props", function (done) {
    store
        .update(function (t) { return t.addRecord({
        type: "user",
        id: "test-user",
        attributes: {
            name: "Test user",
        },
    }); })
        .then(function () {
        var Test = function (_a) {
            var todos = _a.todos, users = _a.users;
            return react_1.default.createElement("span", null);
        };
        var mapRecordsToProps = {
            todos: function (q) { return q.findRecords("todo"); },
            users: function (q) { return q.findRecords("user"); },
        };
        var TestWithData = index_1.withData(mapRecordsToProps)(Test);
        var componentRenderer = react_test_renderer_1.default.create(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
            react_1.default.createElement(TestWithData, null)));
        var testComponent = componentRenderer.root.findByType(Test);
        expect(testComponent.props.todos).toHaveLength(0);
        expect(testComponent.props.users).toHaveLength(1);
        var previousUsers = testComponent.props.users;
        store.update(function (t) { return t.addRecord({
            type: "todo",
            id: "my-first-todo",
            attributes: {
                description: "Run tests",
            },
        }); }).then(function () {
            expect(testComponent.props.todos).toHaveLength(1);
            expect(testComponent.props.users).toHaveLength(1);
            expect(testComponent.props.users).toBe(previousUsers);
            done();
        });
    });
});
test("withData receives updates for findRecord depending on own props", function (done) {
    var record = {
        type: "user",
        id: "test-user",
        attributes: {
            name: "Test user",
        },
    };
    var Test = function (_a) {
        var user = _a.user;
        return react_1.default.createElement("span", null);
    };
    var mapRecordsToProps = function (_a) {
        var userId = _a.userId;
        return ({
            user: function (q) { return q.findRecord({ type: "user", id: userId }); },
        });
    };
    var TestWithData = index_1.withData(mapRecordsToProps)(Test);
    var componentRenderer = react_test_renderer_1.default.create(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
        react_1.default.createElement(TestWithData, { userId: "test-user" })));
    var testComponent = componentRenderer.root.findByType(Test);
    expect(testComponent.props.user).toBeUndefined();
    store.update(function (t) { return t.addRecord(record); }).then(function () {
        expect(testComponent.props.user).toEqual(record);
        done();
    });
});
test("withData receives updates when own props change", function (done) {
    var record = {
        type: "user",
        id: "test-user",
        attributes: {
            name: "Test user",
        },
    };
    store
        .update(function (t) { return t.addRecord(record); })
        .then(function () {
        var Test = function (_a) {
            var user = _a.user;
            return react_1.default.createElement("span", null);
        };
        var mapRecordsToProps = function (_a) {
            var userId = _a.userId;
            return ({
                user: function (q) { return q.findRecord({ type: "user", id: userId }); },
            });
        };
        var TestWithData = index_1.withData(mapRecordsToProps)(Test);
        var testComponent;
        var componentRenderer = react_test_renderer_1.default.create(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
            react_1.default.createElement(TestWithData, null)));
        testComponent = componentRenderer.root.findByType(Test);
        expect(testComponent.props.user).toBeUndefined();
        componentRenderer.update(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
            react_1.default.createElement(TestWithData, { userId: "test-user" })));
        testComponent = componentRenderer.root.findByType(Test);
        expect(testComponent.props.user).toEqual(record);
        done();
    });
});
test("withData doesn't update props if records remain the same", function () {
    var Test = function () { return react_1.default.createElement("span", null); };
    var mapRecordsToProps = function () { return ({
        users: function (q) { return q.findRecords("user"); },
    }); };
    var TestWithData = index_1.withData(mapRecordsToProps)(Test);
    var testComponent;
    var usersProp;
    var componentRenderer = react_test_renderer_1.default.create(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
        react_1.default.createElement(TestWithData, { unusedProp: 1 })));
    testComponent = componentRenderer.root.findByType(Test);
    expect(testComponent.props.users).toHaveLength(0);
    usersProp = testComponent.props.users;
    componentRenderer.update(react_1.default.createElement(index_1.DataProvider, { dataStore: store },
        react_1.default.createElement(TestWithData, { unusedProp: 2 })));
    testComponent = componentRenderer.root.findByType(Test);
    expect(testComponent.props.users).toHaveLength(0);
    expect(testComponent.props.users).toBe(usersProp);
});
