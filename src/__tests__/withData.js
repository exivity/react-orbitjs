import React from "react"
import renderer from "react-test-renderer"

import {Schema} from "@orbit/data"
import Store from "@orbit/store"

import {DataProvider, withData} from "./../index"

// Unfortunately, on Windows we can't use async/await for tests
// see https://github.com/facebook/jest/issues/3750 for more info

const definition = {
  models: {
    todo: {
      attributes: {
        description: {type: "string"},
      },
      relationships: {
        owner: {type: "hasOne", model: "user", inverse: "todos"},
      },
    },
    user: {
      attributes: {
        name: {type: "string"},
      },
      relationships: {
        todos: {type: "hasMany", model: "todo", inverse: "owner"},
      },
    },
  },
}

const schema = new Schema(definition)
let store

beforeEach(() => {
  store = new Store({schema})
})

afterEach(() => {
  // ...
})

// This will output a message to the console (Consider adding an error boundary
// to your tree to customize error handling behavior.)
test("withData requires a dataStore", () => {
  const Test = () => {
    return <span>test</span>
  }

  const TestWithData = withData()(Test)

  expect(() => {
    renderer.create(<TestWithData/>)
  }).toThrow()
})

test("withData renders children", () => {
  const Test = () => {
    return <span>test withdata</span>
  }

  const TestWithData = withData()(Test)

  const component = renderer.create(
    <DataProvider dataStore={store}>
      <TestWithData/>
    </DataProvider>,
  )

  let tree = component.toJSON()
  expect(tree).toMatchSnapshot()
})

test("withData subscribes and unsubscribes from store event", () => {
  const Test = () => {
    return <span>test</span>
  }

  const mapRecordsToProps = {
    todos: q => q.findRecords("todo"),
  }

  const TestWithData = withData(mapRecordsToProps)(Test)

  expect(store.listeners("transform")).toHaveLength(0)

  const component = renderer.create(
    <DataProvider dataStore={store}>
      <TestWithData/>
    </DataProvider>,
  )

  expect(store.listeners("transform")).toHaveLength(1)

  component.unmount()

  expect(store.listeners("transform")).toHaveLength(0)
})

test("withData passes records as prop", () => {
  const Test = ({todos}) => {
    expect(todos).toHaveLength(0)

    return <span>test</span>
  }

  const mapRecordsToProps = {
    todos: q => q.findRecords("todo"),
  }

  const TestWithData = withData(mapRecordsToProps)(Test)

  const component = renderer.create(
    <DataProvider dataStore={store}>
      <TestWithData/>
    </DataProvider>,
  )
})

test("withData passes non-existing record as undefined in findRecord", () => {
  const Test = ({todo}) => {
    expect(todo).toBeUndefined()

    return <span>test</span>
  }

  const mapRecordsToProps = {
    todo: q => q.findRecord({type: "todo", id: "non-existing"}),
  }

  const TestWithData = withData(mapRecordsToProps)(Test)

  const component = renderer.create(
    <DataProvider dataStore={store}>
      <TestWithData/>
    </DataProvider>,
  )
})

test("withData passes non-existing record as empty array in findRecords", () => {
  const Test = ({todos}) => {
    expect(todos).toHaveLength(0)

    return <span>test</span>
  }

  const mapRecordsToProps = {
    todos: q => q.findRecords("todo"),
  }

  const TestWithData = withData(mapRecordsToProps)(Test)

  const component = renderer.create(
    <DataProvider dataStore={store}>
      <TestWithData/>
    </DataProvider>,
  )
})

test("withData passes queryStore", () => {
  const Test = ({queryStore}) => {
    expect(typeof queryStore).toEqual("function")

    // queryStore should return a promise
    expect(typeof queryStore(q => q.findRecords("todo"))).toEqual("object")

    return <span>test</span>
  }

  const TestWithData = withData()(Test)

  const component = renderer.create(
    <DataProvider dataStore={store}>
      <TestWithData/>
    </DataProvider>,
  )
})

test("withData passes updateStore", () => {
  const Test = ({updateStore}) => {
    expect(typeof updateStore).toEqual("function")

    // updateStore should return a promise
    expect(typeof updateStore(t => t.addRecord({}))).toEqual("object")

    return <span>test</span>
  }

  const TestWithData = withData()(Test)

  const component = renderer.create(
    <DataProvider dataStore={store}>
      <TestWithData/>
    </DataProvider>,
  )
})

test("withData receives updates for findRecord", (done) => {
  let callCount = 0
  const record = {
    type: "todo",
    id: "my-first-todo",
    attributes: {
      description: "Run tests",
    },
  }

  const testTodo = (todo) => {
    if (callCount++ === 1) {
      expect(todo).toEqual(record)
      done()
    }
  }

  const Test = ({todo}) => {
    testTodo(todo)

    return <span>test</span>
  }

  const mapRecordsToProps = {
    todo: q => q.findRecord({type: "todo", id: "my-first-todo"}),
  }

  const TestWithData = withData(mapRecordsToProps)(Test)

  const component = renderer.create(
    <DataProvider dataStore={store}>
      <TestWithData/>
    </DataProvider>,
  )

  store.update(t => t.addRecord(record))
})

test("withData receives updates for findRecords", (done) => {
  let callCount = 0

  const testTodos = (todos) => {
    expect(todos).toHaveLength(callCount++)

    if (callCount === 2) {
      done()
    }
  }

  const Test = ({todos}) => {
    testTodos(todos)

    return <span>test</span>
  }

  const mapRecordsToProps = {
    todos: q => q.findRecords("todo"),
  }

  const TestWithData = withData(mapRecordsToProps)(Test)

  const component = renderer.create(
    <DataProvider dataStore={store}>
      <TestWithData/>
    </DataProvider>,
  )

  store.update(t => t.addRecord({
      type: "todo",
      id: "my-first-todo",
      attributes: {
        description: "Run tests",
      },
    },
  ))

})

test("withData receives updates for findRelatedRecord", (done) => {
  // Unfortunately, on Windows we can't use async/await for tests
  // see https://github.com/facebook/jest/issues/3750 for more info
  let callCount = 0
  const user = {
    type: "user",
    id: "test-user",
    attributes: {
      name: "Test user",
    },
  }
  const updatedName = "updated-test-user"

  store
    .update(t => t.addRecord(user))
    .then(() => {
      return store.update(t => t.addRecord({
          type: "todo",
          id: "my-first-todo",
          attributes: {
            description: "Run tests",
          },
        },
      ))
    })
    .then(() => {

      const testTodos = (owner) => {
        callCount++

        if (callCount === 1) {
          expect(owner).toBeNull()
        } else if (callCount === 2) {
          expect(owner).toMatchObject(user)
        } else if (callCount === 3) {
          expect(owner.attributes.name).toEqual(updatedName)
        } else if (callCount === 4) {
          expect(owner).toBeNull()
          done()
        }
      }

      const Test = ({owner}) => {
        testTodos(owner)

        return <span>test</span>
      }

      const mapRecordsToProps = {
        owner: q => q.findRelatedRecord({
          type: "todo",
          id: "my-first-todo",
        }, "owner"),
      }

      const TestWithData = withData(mapRecordsToProps)(Test)

      const component = renderer.create(
        <DataProvider dataStore={store}>
          <TestWithData/>
        </DataProvider>,
      )

      store.update(t => t.replaceRelatedRecord(
        {type: "todo", id: "my-first-todo"},
        "owner",
        {type: "user", id: "test-user"},
      )).then(() => {
        store.update(t => t.replaceAttribute(
          {type: "user", id: "test-user"},
          "name", updatedName,
        ))
      }).then(() => {
        store.update(t => t.replaceRelatedRecord(
          {type: "todo", id: "my-first-todo"},
          "owner",
          null,
        ))
      })
    })
})

test("withData receives updates for findRelatedRecords", (done) => {
  // Unfortunately, on Windows we can't use async/await for tests
  // see https://github.com/facebook/jest/issues/3750 for more info
  let callCount = 0
  const updatedDescription = "Run tests again"

  store
    .update(t => t.addRecord({
      type: "user",
      id: "test-user",
      attributes: {
        name: "Test user",
      },
    }))
    .then(() => {
      return store.update(t => t.addRecord({
          type: "todo",
          id: "my-first-todo",
          attributes: {
            description: "Run tests",
          },
        },
      ))
    })
    .then(() => {

      const testTodos = (todos) => {
        callCount++

        if (callCount === 1) {
          expect(todos).toHaveLength(0)
        } else if (callCount === 2) {
          expect(todos).toHaveLength(1)
        } else if (callCount === 3) {
          expect(todos).toHaveLength(1)
          expect(todos[0].attributes.description).toEqual(updatedDescription)
        } else if (callCount === 4) {
          expect(todos).toHaveLength(0)
          done()
        }
      }

      const Test = ({todos}) => {
        testTodos(todos)

        return <span>test</span>
      }

      const mapRecordsToProps = {
        todos: q => q.findRelatedRecords({
          type: "user",
          id: "test-user",
        }, "todos"),
      }

      const TestWithData = withData(mapRecordsToProps)(Test)

      const component = renderer.create(
        <DataProvider dataStore={store}>
          <TestWithData/>
        </DataProvider>,
      )

      store.update(t => t.addToRelatedRecords(
        {type: "user", id: "test-user"},
        "todos",
        {type: "todo", id: "my-first-todo"},
      )).then(() => {
        return store.update(t => t.replaceAttribute(
          {type: "todo", id: "my-first-todo"},
          "description", updatedDescription,
        ))
      }).then(() => {
        store.update(t => t.removeFromRelatedRecords(
          {type: "user", id: "test-user"},
          "todos",
          {type: "todo", id: "my-first-todo"},
        ))
      })
    })
})

test("withData receives updates for multiple keys", (done) => {
  // Unfortunately, on Windows we can't use async/await for tests
  // see https://github.com/facebook/jest/issues/3750 for more info
  let callCount = 0

  store
    .update(t => t.addRecord({
      type: "user",
      id: "test-user",
      attributes: {
        name: "Test user",
      },
    }))
    .then(() => {
      return store.update(t => t.addRecord({
          type: "todo",
          id: "my-first-todo",
          attributes: {
            description: "Run tests",
          },
        },
      ))
    })
    .then(() => {

      const testTodos = ({todos, users}) => {
        callCount++

        if (callCount === 1) {
          expect(todos).toHaveLength(1)
          expect(users).toHaveLength(1)
        } else if (callCount === 2) {
          expect(todos).toHaveLength(2)
          expect(users).toHaveLength(1)
        } else if (callCount === 3) {
          expect(todos).toHaveLength(2)
          expect(users).toHaveLength(2)
          done()
        }
      }

      const Test = ({todos, users}) => {
        testTodos({todos, users})

        return <span>test</span>
      }

      const mapRecordsToProps = {
        todos: q => q.findRecords("todo"),
        users: q => q.findRecords("user"),
      }

      const TestWithData = withData(mapRecordsToProps)(Test)

      const component = renderer.create(
        <DataProvider dataStore={store}>
          <TestWithData/>
        </DataProvider>,
      )

      store.update(t => t.addRecord({
          type: "todo",
          id: "my-second-todo",
          attributes: {
            description: "Run more tests",
          },
        },
      )).then(() => {
        store.update(t => t.addRecord({
            type: "user",
            id: "another-user",
            attributes: {
              name: "Another user",
            },
          },
        ))
      })
    })
})

test("withData keeps references for unchanged props", (done) => {
  store
    .update(t => t.addRecord({
      type: "user",
      id: "test-user",
      attributes: {
        name: "Test user",
      },
    }))
    .then(() => {
      const Test = ({todos, users}) => <span/>

      const mapRecordsToProps = {
        todos: q => q.findRecords("todo"),
        users: q => q.findRecords("user"),
      }

      const TestWithData = withData(mapRecordsToProps)(Test)

      const componentRenderer = renderer.create(
        <DataProvider dataStore={store}>
          <TestWithData/>
        </DataProvider>,
      )

      const testComponent = componentRenderer.root.findByType(Test)

      expect(testComponent.props.todos).toHaveLength(0)
      expect(testComponent.props.users).toHaveLength(1)

      const previousUsers = testComponent.props.users

      store.update(t => t.addRecord({
          type: "todo",
          id: "my-first-todo",
          attributes: {
            description: "Run tests",
          },
        },
      )).then(() => {
        expect(testComponent.props.todos).toHaveLength(1)
        expect(testComponent.props.users).toHaveLength(1)
        expect(testComponent.props.users).toBe(previousUsers)
        done()
      })
    })
})

test("withData receives updates for findRecord depending on own props", (done) => {
  const record = {
    type: "user",
    id: "test-user",
    attributes: {
      name: "Test user",
    },
  }

  const Test = ({user}) => <span/>

  const mapRecordsToProps = ({userId}) => ({
    user: q => q.findRecord({type: "user", id: userId}),
  })

  const TestWithData = withData(mapRecordsToProps)(Test)

  const componentRenderer = renderer.create(
    <DataProvider dataStore={store}>
      <TestWithData userId="test-user"/>
    </DataProvider>,
  )

  const testComponent = componentRenderer.root.findByType(Test)

  expect(testComponent.props.user).toBeUndefined()

  store.update(t => t.addRecord(record)).then(() => {
    expect(testComponent.props.user).toEqual(record)
    done()
  })
})

test("withData receives updates when own props change", (done) => {
  const record = {
    type: "user",
    id: "test-user",
    attributes: {
      name: "Test user",
    },
  }

  store
    .update(t => t.addRecord(record))
    .then(() => {
      const Test = ({user}) => <span/>

      const mapRecordsToProps = ({userId}) => ({
        user: q => q.findRecord({type: "user", id: userId}),
      })

      const TestWithData = withData(mapRecordsToProps)(Test)

      let testComponent
      const componentRenderer = renderer.create(
        <DataProvider dataStore={store}>
          <TestWithData/>
        </DataProvider>,
      )
      testComponent = componentRenderer.root.findByType(Test)

      expect(testComponent.props.user).toBeUndefined()

      componentRenderer.update(
        <DataProvider dataStore={store}>
          <TestWithData userId="test-user"/>
        </DataProvider>)
      testComponent = componentRenderer.root.findByType(Test)

      expect(testComponent.props.user).toEqual(record)

      done()
    })
})

test("withData doesn't update props if records remain the same", () => {
  const Test = () => <span/>

  const mapRecordsToProps = () => ({
    users: q => q.findRecords("user"),
  })

  const TestWithData = withData(mapRecordsToProps)(Test)

  let testComponent
  let usersProp

  const componentRenderer = renderer.create(
    <DataProvider dataStore={store}>
      <TestWithData unusedProp={1}/>
    </DataProvider>,
  )
  testComponent = componentRenderer.root.findByType(Test)

  expect(testComponent.props.users).toHaveLength(0)
  usersProp = testComponent.props.users

  componentRenderer.update(
    <DataProvider dataStore={store}>
      <TestWithData unusedProp={2}/>
    </DataProvider>)
  testComponent = componentRenderer.root.findByType(Test)

  expect(testComponent.props.users).toHaveLength(0)
  expect(testComponent.props.users).toBe(usersProp)
})