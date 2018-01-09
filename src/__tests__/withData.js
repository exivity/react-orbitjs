import React from "react"
import renderer from "react-test-renderer"

import {Schema} from "@orbit/data"
import Store from "@orbit/store"

import {DataProvider, withData} from "./../index"

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