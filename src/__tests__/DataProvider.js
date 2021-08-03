import React from "react"
import renderer from "react-test-renderer"
import { DataProvider } from "../index"
import dataStoreShape from "../utils/dataStoreShape"
import { getOrbitSchemaAndStore } from './utils'

const { memory } = getOrbitSchemaAndStore({})

test("DataProvider renders children", () => {
  const component = renderer.create(
    <DataProvider dataStore={memory}>
      <span>test children</span>
    </DataProvider>
  )

  let tree = component.toJSON()
  expect(tree).toMatchSnapshot()
})

test("DataProvider make dataStore available through context", () => {
  const TestContext = (props, context) => {
    expect(context.dataStore).toBe(memory)

    return <span>test context</span>
  }

  TestContext.contextTypes = {
    dataStore: dataStoreShape.isRequired,
  }

  const component = renderer.create(
    <DataProvider dataStore={memory}>
      <TestContext/>
    </DataProvider>
  )
})
