import React, { Component } from "react"
import ReactDOM from "react-dom"

import { DataProvider } from "./../../src"
import store from "./store"

import Planetarium from "./Planetarium"

class App extends Component {
  state = {
    sortBy: "name",
  }

  render() {
    const {sortBy} = this.state
    return <div>
      <div>
        Sort by
        <select defaultValue="name" onChange={(event) => this.setState({sortBy: event.target.value})}>
          <option value="name">Name</option>
          <option value="classification">Classification</option>
        </select>
      </div>
      <div>
        <button onClick={() => store.update(t => t.addRecord({
          type: "planet",
          id: parseInt(Math.random() * 100, 10),
          attributes: {
            name: Math.random().toString(36).substring(7),
          },
        }))}>add random planet
        </button>
      </div>
      <Planetarium sortBy={sortBy}/>
    </div>
  }
}

ReactDOM.render(
  <DataProvider dataStore={store}>
    <App/>
  </DataProvider>,
  document.getElementById("root"),
)