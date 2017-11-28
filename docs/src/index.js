import React, { Component } from "react"
import ReactDOM from "react-dom"

import TodoApp from "./examples/TodoApp"

class App extends Component {
  render() {
    return <div>
      <header>
        <h1>react-orbitjs</h1>
        <h2>React bindings for Orbit. Inspired by react-redux.</h2>
        <p>
          <a className="button" href="https://github.com/exivity/react-orbitjs/">github</a>
        </p>
      </header>
      <main>
        <section>
          <h2>Obligatory todo app example</h2>
          <p><a href="https://github.com/exivity/react-orbitjs/tree/master/docs/src/examples">View source</a></p>
          <TodoApp/>
        </section>
        <section>
          <h2>Installation</h2>
          <p><em>react-orbitjs requires React 15 and Orbit 0.15 or later.</em></p>
          <p>With <a href="https://www.npmjs.com/">npm</a></p>
          <code>npm install --save react-orbitjs</code>
          <p>With <a href="https://yarnpkg.com/">yarn</a></p>
          <code>yarn add react-orbitjs</code>
        </section>
        <section>
          <h2>API</h2>
          <h3>DataProvider</h3>
          <pre>{`const store = new Store({schema})

ReactDOM.render(
  <DataProvider dataStore={store}>
    <Planetarium/>
  </DataProvider>,
  rootElement
)`}</pre>
          <h3>withData()</h3>
          <pre>{`const mapRecordsToProps = (ownProps) => {
  return {
    planets: q => q.findRecords("planet").sort(ownProps.sortBy),
  }
}

// or

const mapRecordsToProps = {
  planets: q => q.findRecords("planet"),
}

const PlanetariumWithData = withData(mapRecordsToProps)(Planetarium)`}
        </pre>

        </section>
      </main>
      <footer>
        Made with ☕ at <a href="https://exivity.com/">exivity.com</a>
      </footer>
    </div>
  }
}

ReactDOM.render(<App/>, document.getElementById("root"))