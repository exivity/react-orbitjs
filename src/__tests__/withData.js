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
    },
  },
}

const schema = new Schema(definition)
const store = new Store({schema})

test("withData renders children", () => {
  const Test = () => {
    return <span>test withdata</span>
  }

  const TestWithData = withData()(Test)

  const component = renderer.create(
    <DataProvider dataStore={store}>
      <TestWithData/>
    </DataProvider>
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
    todos: q => q.findRecords("todo")
  }

  const TestWithData = withData(mapRecordsToProps)(Test)

  const component = renderer.create(
    <DataProvider dataStore={store}>
      <TestWithData/>
    </DataProvider>
  )
})

test("withData receives updates", (done) => {
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
    todos: q => q.findRecords("todo")
  }

  const TestWithData = withData(mapRecordsToProps)(Test)

  const component = renderer.create(
    <DataProvider dataStore={store}>
      <TestWithData/>
    </DataProvider>
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

test("withData passes non-existing record as undefined", () => {
  const Test = ({todo}) => {
    expect(todo).toBeUndefined()

    return <span>test</span>
  }

  const mapRecordsToProps = {
    todos: q => q.findRecord({type: "todo", id: "non-existing"})
  }

  const TestWithData = withData(mapRecordsToProps)(Test)

  const component = renderer.create(
    <DataProvider dataStore={store}>
      <TestWithData/>
    </DataProvider>
  )
})