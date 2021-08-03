react-orbitjs
=============

[![npm](https://img.shields.io/npm/v/react-orbitjs.svg)](https://www.npmjs.com/package/react-orbitjs)
[![ci](https://github.com/exivity/react-orbitjs/actions/workflows/ci.yml/badge.svg)](https://github.com/exivity/react-orbitjs/actions/workflows/ci.yml)
[![Codecov](https://img.shields.io/codecov/c/github/exivity/react-orbitjs.svg)](https://codecov.io/gh/exivity/react-orbitjs)
[![Code Climate](https://img.shields.io/codeclimate/maintainability/exivity/react-orbitjs.svg)](https://codeclimate.com/github/exivity/react-orbitjs)

[React](https://reactjs.org/) bindings for [Orbit](http://orbitjs.com/).

This package attempts to make it easier to work with
[Orbit.js](http://orbitjs.com/) in a [React](https://reactjs.org/)
environment. In a nutshell it's a transform listener, updating
a component props with records as they are changed. If you're familiar
with [redux](https://github.com/reactjs/redux/) in combination with
[react-redux](https://github.com/reactjs/react-redux), you already know
how to use this package.

---

### [Documentation & Demo](https://exivity.github.io/react-orbitjs/)

---

A big thank you to the author and contributers of the popular
[react-redux](https://github.com/reactjs/react-redux) package, as
react-orbitjs is largely based on their code.

Installation
------------

_react-orbitjs requires React 16 and Orbit 0.16._

_npm_

```
npm install --save react-orbitjs
```

_yarn_

```
yarn add react-orbitjs
```

API
---

### `<DataProvider/>`

```jsx
const store = new MemorySource({schema})

// Simply pass a reference to your Orbit store to the <DataProvider/> component
// and wrap your root App component. The provider makes a dataStore child
// context available to all children, which is consumed by the HOC generated
// with the withData() connector.
ReactDOM.render(
  <DataProvider dataStore={store}>
    <App/>
  </DataProvider>,
  rootElement
)
```

### `withData()`

```jsx
// This mapper uses the props passed in to manipulate the queries. Useful for
// sort/filter functions, etc.
const mapRecordsToProps = (ownProps) => {
  return {
    planets: q => q.findRecords("planet").sort(ownProps.sortBy),
  }
}

// Or use a simple object if you don't use the props in your queries.
const mapRecordsToProps = {
  planets: q => q.findRecords("planet"),
}

// Export the generated component. Your <Planetarium/> component receives all
// the props you pass to the wrapper component, combined with the results from
// the queries defined in the mapRecordsToProps function or object, and
// convenience queryStore and updateStore props, which defer to store.query and
// store.update.
export default PlanetariumWithData = withData(mapRecordsToProps)(Planetarium)
```

License
-------

MIT
