"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactTestRenderer = require("react-test-renderer");

var _reactTestRenderer2 = _interopRequireDefault(_reactTestRenderer);

var _data = require("@orbit/data");

var _store = require("@orbit/store");

var _store2 = _interopRequireDefault(_store);

var _index = require("./../index");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Unfortunately, on Windows we can't use async/await for tests
// see https://github.com/facebook/jest/issues/3750 for more info

var definition = {
  models: {
    todo: {
      attributes: {
        description: { type: "string" }
      },
      relationships: {
        owner: { type: "hasOne", model: "user", inverse: "todos" }
      }
    },
    user: {
      attributes: {
        name: { type: "string" }
      },
      relationships: {
        todos: { type: "hasMany", model: "todo", inverse: "owner" }
      }
    }
  }
};

var schema = new _data.Schema(definition);
var store = void 0;

beforeEach(function () {
  store = new _store2.default({ schema: schema });
});

afterEach(function () {
  // ...
});

// This will output a message to the console (Consider adding an error boundary
// to your tree to customize error handling behavior.)
test("withData requires a dataStore", function () {
  var Test = function Test() {
    return _react2.default.createElement(
      "span",
      null,
      "test"
    );
  };

  var TestWithData = (0, _index.withData)()(Test);

  expect(function () {
    _reactTestRenderer2.default.create(_react2.default.createElement(TestWithData, null));
  }).toThrow();
});

test("withData renders children", function () {
  var Test = function Test() {
    return _react2.default.createElement(
      "span",
      null,
      "test withdata"
    );
  };

  var TestWithData = (0, _index.withData)()(Test);

  var component = _reactTestRenderer2.default.create(_react2.default.createElement(
    _index.DataProvider,
    { dataStore: store },
    _react2.default.createElement(TestWithData, null)
  ));

  var tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test("withData subscribes and unsubscribes from store event", function () {
  var Test = function Test() {
    return _react2.default.createElement(
      "span",
      null,
      "test"
    );
  };

  var mapRecordsToProps = {
    todos: function todos(q) {
      return q.findRecords("todo");
    }
  };

  var TestWithData = (0, _index.withData)(mapRecordsToProps)(Test);

  expect(store.listeners("transform")).toHaveLength(0);

  var component = _reactTestRenderer2.default.create(_react2.default.createElement(
    _index.DataProvider,
    { dataStore: store },
    _react2.default.createElement(TestWithData, null)
  ));

  expect(store.listeners("transform")).toHaveLength(1);

  component.unmount();

  expect(store.listeners("transform")).toHaveLength(0);
});

test("withData passes records as prop", function () {
  var Test = function Test(_ref) {
    var todos = _ref.todos;

    expect(todos).toHaveLength(0);

    return _react2.default.createElement(
      "span",
      null,
      "test"
    );
  };

  var mapRecordsToProps = {
    todos: function todos(q) {
      return q.findRecords("todo");
    }
  };

  var TestWithData = (0, _index.withData)(mapRecordsToProps)(Test);

  var component = _reactTestRenderer2.default.create(_react2.default.createElement(
    _index.DataProvider,
    { dataStore: store },
    _react2.default.createElement(TestWithData, null)
  ));
});

test("withData passes non-existing record as undefined in findRecord", function () {
  var Test = function Test(_ref2) {
    var todo = _ref2.todo;

    expect(todo).toBeUndefined();

    return _react2.default.createElement(
      "span",
      null,
      "test"
    );
  };

  var mapRecordsToProps = {
    todo: function todo(q) {
      return q.findRecord({ type: "todo", id: "non-existing" });
    }
  };

  var TestWithData = (0, _index.withData)(mapRecordsToProps)(Test);

  var component = _reactTestRenderer2.default.create(_react2.default.createElement(
    _index.DataProvider,
    { dataStore: store },
    _react2.default.createElement(TestWithData, null)
  ));
});

test("withData passes non-existing record as empty array in findRecords", function () {
  var Test = function Test(_ref3) {
    var todos = _ref3.todos;

    expect(todos).toHaveLength(0);

    return _react2.default.createElement(
      "span",
      null,
      "test"
    );
  };

  var mapRecordsToProps = {
    todos: function todos(q) {
      return q.findRecords("todo");
    }
  };

  var TestWithData = (0, _index.withData)(mapRecordsToProps)(Test);

  var component = _reactTestRenderer2.default.create(_react2.default.createElement(
    _index.DataProvider,
    { dataStore: store },
    _react2.default.createElement(TestWithData, null)
  ));
});

test("withData passes queryStore", function () {
  var Test = function Test(_ref4) {
    var queryStore = _ref4.queryStore;

    expect(typeof queryStore === "undefined" ? "undefined" : _typeof(queryStore)).toEqual("function");

    // queryStore should return a promise
    expect(_typeof(queryStore(function (q) {
      return q.findRecords("todo");
    }))).toEqual("object");

    return _react2.default.createElement(
      "span",
      null,
      "test"
    );
  };

  var TestWithData = (0, _index.withData)()(Test);

  var component = _reactTestRenderer2.default.create(_react2.default.createElement(
    _index.DataProvider,
    { dataStore: store },
    _react2.default.createElement(TestWithData, null)
  ));
});

test("withData passes updateStore", function () {
  var Test = function Test(_ref5) {
    var updateStore = _ref5.updateStore;

    expect(typeof updateStore === "undefined" ? "undefined" : _typeof(updateStore)).toEqual("function");

    // updateStore should return a promise
    expect(_typeof(updateStore(function (t) {
      return t.addRecord({});
    }))).toEqual("object");

    return _react2.default.createElement(
      "span",
      null,
      "test"
    );
  };

  var TestWithData = (0, _index.withData)()(Test);

  var component = _reactTestRenderer2.default.create(_react2.default.createElement(
    _index.DataProvider,
    { dataStore: store },
    _react2.default.createElement(TestWithData, null)
  ));
});

test("withData receives updates for findRecord", function (done) {
  var callCount = 0;

  var record = {
    type: "todo",
    id: "my-first-todo",
    attributes: {
      description: "Run tests"
    }
  };

  var testTodo = function testTodo(todo) {
    if (callCount++ === 1) {
      expect(todo).toEqual(record);
      done();
    }
  };

  var Test = function Test(_ref6) {
    var todo = _ref6.todo;

    testTodo(todo);

    return _react2.default.createElement(
      "span",
      null,
      "test"
    );
  };

  var mapRecordsToProps = {
    todo: function todo(q) {
      return q.findRecord({ type: "todo", id: "my-first-todo" });
    }
  };

  var TestWithData = (0, _index.withData)(mapRecordsToProps)(Test);

  var component = _reactTestRenderer2.default.create(_react2.default.createElement(
    _index.DataProvider,
    { dataStore: store },
    _react2.default.createElement(TestWithData, null)
  ));

  store.update(function (t) {
    return t.addRecord(record);
  });
});

test("withData receives updates for findRecords", function (done) {
  var callCount = 0;

  var testTodos = function testTodos(todos) {
    expect(todos).toHaveLength(callCount++);

    if (callCount === 2) {
      done();
    }
  };

  var Test = function Test(_ref7) {
    var todos = _ref7.todos;

    testTodos(todos);

    return _react2.default.createElement(
      "span",
      null,
      "test"
    );
  };

  var mapRecordsToProps = {
    todos: function todos(q) {
      return q.findRecords("todo");
    }
  };

  var TestWithData = (0, _index.withData)(mapRecordsToProps)(Test);

  var component = _reactTestRenderer2.default.create(_react2.default.createElement(
    _index.DataProvider,
    { dataStore: store },
    _react2.default.createElement(TestWithData, null)
  ));

  store.update(function (t) {
    return t.addRecord({
      type: "todo",
      id: "my-first-todo",
      attributes: {
        description: "Run tests"
      }
    });
  });
});

test("withData receives updates for findRelatedRecord", function (done) {
  // Unfortunately, on Windows we can't use async/await for tests
  // see https://github.com/facebook/jest/issues/3750 for more info
  var callCount = 0;
  var user = {
    type: "user",
    id: "test-user",
    attributes: {
      name: "Test user"
    }
  };
  var updatedName = "updated-test-user";

  store.update(function (t) {
    return t.addRecord(user);
  }).then(function () {
    return store.update(function (t) {
      return t.addRecord({
        type: "todo",
        id: "my-first-todo",
        attributes: {
          description: "Run tests"
        }
      });
    });
  }).then(function () {

    var testTodos = function testTodos(owner) {
      callCount++;

      if (callCount === 1) {
        expect(owner).toBeNull();
      } else if (callCount === 2) {
        expect(owner).toMatchObject(user);
      } else if (callCount === 3) {
        expect(owner.attributes.name).toEqual(updatedName);
      } else if (callCount === 4) {
        expect(owner).toBeNull();
        done();
      }
    };

    var Test = function Test(_ref8) {
      var owner = _ref8.owner;

      testTodos(owner);

      return _react2.default.createElement(
        "span",
        null,
        "test"
      );
    };

    var mapRecordsToProps = {
      owner: function owner(q) {
        return q.findRelatedRecord({
          type: "todo",
          id: "my-first-todo"
        }, "owner");
      }
    };

    var TestWithData = (0, _index.withData)(mapRecordsToProps)(Test);

    var component = _reactTestRenderer2.default.create(_react2.default.createElement(
      _index.DataProvider,
      { dataStore: store },
      _react2.default.createElement(TestWithData, null)
    ));

    store.update(function (t) {
      return t.replaceRelatedRecord({ type: "todo", id: "my-first-todo" }, "owner", { type: "user", id: "test-user" });
    }).then(function () {
      store.update(function (t) {
        return t.replaceAttribute({ type: "user", id: "test-user" }, "name", updatedName);
      });
    }).then(function () {
      store.update(function (t) {
        return t.replaceRelatedRecord({ type: "todo", id: "my-first-todo" }, "owner", null);
      });
    });
  });
});

test("withData receives updates for findRelatedRecords", function (done) {
  // Unfortunately, on Windows we can't use async/await for tests
  // see https://github.com/facebook/jest/issues/3750 for more info
  var callCount = 0;
  var updatedDescription = "Run tests again";

  store.update(function (t) {
    return t.addRecord({
      type: "user",
      id: "test-user",
      attributes: {
        name: "Test user"
      }
    });
  }).then(function () {
    return store.update(function (t) {
      return t.addRecord({
        type: "todo",
        id: "my-first-todo",
        attributes: {
          description: "Run tests"
        }
      });
    });
  }).then(function () {

    var testTodos = function testTodos(todos, user) {
      callCount++;

      if (callCount === 1) {
        expect(todos).toHaveLength(0);
      } else if (callCount === 2) {
        expect(todos).toHaveLength(1);
        expect(user.relationships.todos.data).toHaveLength(1);
      } else if (callCount === 3) {
        expect(todos).toHaveLength(1);
        expect(todos[0].attributes.description).toEqual(updatedDescription);
        expect(user.relationships.todos.data).toHaveLength(1);
      } else if (callCount === 4) {
        expect(todos).toHaveLength(0);
        expect(user.relationships.todos.data).toHaveLength(0);
      } else if (callCount === 5) {
        expect(todos).toHaveLength(1);
        expect(user.relationships.todos.data).toHaveLength(1);
      } else if (callCount === 6) {
        expect(todos).toHaveLength(0);
        expect(user.relationships.todos.data).toHaveLength(0);
        done();
      }
    };

    var Test = function Test(_ref9) {
      var todos = _ref9.todos,
          user = _ref9.user;

      testTodos(todos, user);

      return _react2.default.createElement(
        "span",
        null,
        "test"
      );
    };

    var mapRecordsToProps = {
      user: function user(q) {
        return q.findRecord({ type: "user", id: "test-user" });
      },
      todos: function todos(q) {
        return q.findRelatedRecords({
          type: "user",
          id: "test-user"
        }, "todos");
      }
    };

    var TestWithData = (0, _index.withData)(mapRecordsToProps)(Test);

    var component = _reactTestRenderer2.default.create(_react2.default.createElement(
      _index.DataProvider,
      { dataStore: store },
      _react2.default.createElement(TestWithData, null)
    ));

    store.update(function (t) {
      return t.addToRelatedRecords({ type: "user", id: "test-user" }, "todos", { type: "todo", id: "my-first-todo" });
    }).then(function () {
      return store.update(function (t) {
        return t.replaceAttribute({ type: "todo", id: "my-first-todo" }, "description", updatedDescription);
      });
    }).then(function () {
      store.update(function (t) {
        return t.removeFromRelatedRecords({ type: "user", id: "test-user" }, "todos", { type: "todo", id: "my-first-todo" });
      });
    }).then(function () {
      store.update(function (t) {
        return t.addRecord({
          type: "todo",
          id: "my-second-todo",
          attributes: {
            description: "Run more tests"
          },
          relationships: {
            owner: {
              data: { type: "user", id: "test-user" }
            }
          }
        });
      });
    }).then(function () {
      store.update(function (t) {
        return t.removeRecord({
          type: "todo",
          id: "my-second-todo"
        });
      });
    });
  });
});

test("withData receives updates for multiple keys", function (done) {
  // Unfortunately, on Windows we can't use async/await for tests
  // see https://github.com/facebook/jest/issues/3750 for more info
  var callCount = 0;

  store.update(function (t) {
    return t.addRecord({
      type: "user",
      id: "test-user",
      attributes: {
        name: "Test user"
      }
    });
  }).then(function () {
    return store.update(function (t) {
      return t.addRecord({
        type: "todo",
        id: "my-first-todo",
        attributes: {
          description: "Run tests"
        }
      });
    });
  }).then(function () {

    var testTodos = function testTodos(_ref10) {
      var todos = _ref10.todos,
          users = _ref10.users;

      callCount++;

      if (callCount === 1) {
        expect(todos).toHaveLength(1);
        expect(users).toHaveLength(1);
      } else if (callCount === 2) {
        expect(todos).toHaveLength(2);
        expect(users).toHaveLength(1);
      } else if (callCount === 3) {
        expect(todos).toHaveLength(2);
        expect(users).toHaveLength(2);
        done();
      }
    };

    var Test = function Test(_ref11) {
      var todos = _ref11.todos,
          users = _ref11.users;

      testTodos({ todos: todos, users: users });

      return _react2.default.createElement(
        "span",
        null,
        "test"
      );
    };

    var mapRecordsToProps = {
      todos: function todos(q) {
        return q.findRecords("todo");
      },
      users: function users(q) {
        return q.findRecords("user");
      }
    };

    var TestWithData = (0, _index.withData)(mapRecordsToProps)(Test);

    var component = _reactTestRenderer2.default.create(_react2.default.createElement(
      _index.DataProvider,
      { dataStore: store },
      _react2.default.createElement(TestWithData, null)
    ));

    store.update(function (t) {
      return t.addRecord({
        type: "todo",
        id: "my-second-todo",
        attributes: {
          description: "Run more tests"
        }
      });
    }).then(function () {
      store.update(function (t) {
        return t.addRecord({
          type: "user",
          id: "another-user",
          attributes: {
            name: "Another user"
          }
        });
      });
    });
  });
});

test("withData keeps references for unchanged props", function (done) {
  store.update(function (t) {
    return t.addRecord({
      type: "user",
      id: "test-user",
      attributes: {
        name: "Test user"
      }
    });
  }).then(function () {
    var Test = function Test(_ref12) {
      var todos = _ref12.todos,
          users = _ref12.users;
      return _react2.default.createElement("span", null);
    };

    var mapRecordsToProps = {
      todos: function todos(q) {
        return q.findRecords("todo");
      },
      users: function users(q) {
        return q.findRecords("user");
      }
    };

    var TestWithData = (0, _index.withData)(mapRecordsToProps)(Test);

    var componentRenderer = _reactTestRenderer2.default.create(_react2.default.createElement(
      _index.DataProvider,
      { dataStore: store },
      _react2.default.createElement(TestWithData, null)
    ));

    var testComponent = componentRenderer.root.findByType(Test);

    expect(testComponent.props.todos).toHaveLength(0);
    expect(testComponent.props.users).toHaveLength(1);

    var previousUsers = testComponent.props.users;

    store.update(function (t) {
      return t.addRecord({
        type: "todo",
        id: "my-first-todo",
        attributes: {
          description: "Run tests"
        }
      });
    }).then(function () {
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
      name: "Test user"
    }
  };

  var Test = function Test(_ref13) {
    var user = _ref13.user;
    return _react2.default.createElement("span", null);
  };

  var mapRecordsToProps = function mapRecordsToProps(_ref14) {
    var userId = _ref14.userId;
    return {
      user: function user(q) {
        return q.findRecord({ type: "user", id: userId });
      }
    };
  };

  var TestWithData = (0, _index.withData)(mapRecordsToProps)(Test);

  var componentRenderer = _reactTestRenderer2.default.create(_react2.default.createElement(
    _index.DataProvider,
    { dataStore: store },
    _react2.default.createElement(TestWithData, { userId: "test-user" })
  ));

  var testComponent = componentRenderer.root.findByType(Test);

  expect(testComponent.props.user).toBeUndefined();

  store.update(function (t) {
    return t.addRecord(record);
  }).then(function () {
    expect(testComponent.props.user).toEqual(record);
    done();
  });
});

test("withData receives updates when own props change", function (done) {
  var record = {
    type: "user",
    id: "test-user",
    attributes: {
      name: "Test user"
    }
  };

  store.update(function (t) {
    return t.addRecord(record);
  }).then(function () {
    var Test = function Test(_ref15) {
      var user = _ref15.user;
      return _react2.default.createElement("span", null);
    };

    var mapRecordsToProps = function mapRecordsToProps(_ref16) {
      var userId = _ref16.userId;
      return {
        user: function user(q) {
          return q.findRecord({ type: "user", id: userId });
        }
      };
    };

    var TestWithData = (0, _index.withData)(mapRecordsToProps)(Test);

    var testComponent = void 0;
    var componentRenderer = _reactTestRenderer2.default.create(_react2.default.createElement(
      _index.DataProvider,
      { dataStore: store },
      _react2.default.createElement(TestWithData, null)
    ));
    testComponent = componentRenderer.root.findByType(Test);

    expect(testComponent.props.user).toBeUndefined();

    componentRenderer.update(_react2.default.createElement(
      _index.DataProvider,
      { dataStore: store },
      _react2.default.createElement(TestWithData, { userId: "test-user" })
    ));
    testComponent = componentRenderer.root.findByType(Test);

    expect(testComponent.props.user).toEqual(record);

    done();
  });
});

test("withData doesn't update props if records remain the same", function () {
  var Test = function Test() {
    return _react2.default.createElement("span", null);
  };

  var mapRecordsToProps = function mapRecordsToProps() {
    return {
      users: function users(q) {
        return q.findRecords("user");
      }
    };
  };

  var TestWithData = (0, _index.withData)(mapRecordsToProps)(Test);

  var testComponent = void 0;
  var usersProp = void 0;

  var componentRenderer = _reactTestRenderer2.default.create(_react2.default.createElement(
    _index.DataProvider,
    { dataStore: store },
    _react2.default.createElement(TestWithData, { unusedProp: 1 })
  ));
  testComponent = componentRenderer.root.findByType(Test);

  expect(testComponent.props.users).toHaveLength(0);
  usersProp = testComponent.props.users;

  componentRenderer.update(_react2.default.createElement(
    _index.DataProvider,
    { dataStore: store },
    _react2.default.createElement(TestWithData, { unusedProp: 2 })
  ));
  testComponent = componentRenderer.root.findByType(Test);

  expect(testComponent.props.users).toHaveLength(0);
  expect(testComponent.props.users).toBe(usersProp);
});