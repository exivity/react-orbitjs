import React from "react"
import ReactDOM from "react-dom"

import { DataProvider } from "./../../src"
import store from "./store"

import Planetarium from "./Planetarium"

ReactDOM.render(
  <DataProvider dataStore={store}>
    <Planetarium/>
  </DataProvider>,
  document.getElementById("root"),
)