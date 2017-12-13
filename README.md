react-orbitjs
=============

[![npm](https://img.shields.io/npm/v/react-orbitjs.svg)](https://www.npmjs.com/package/react-orbitjs)
[![Travis](https://img.shields.io/travis/exivity/react-orbitjs.svg)](https://travis-ci.org/exivity/react-orbitjs)
[![Codecov](https://img.shields.io/codecov/c/github/exivity/react-orbitjs.svg)](https://codecov.io/gh/exivity/react-orbitjs)

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

_react-orbitjs requires React 15 and Orbit 0.15 or later._

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
const store = new Store({schema})

// Simply pass a reference to your Orbit store to the <DataProvider/> HOC and
// wrap your root App component. The HOC makes a dataStore child context
// available to all children, which is consumed by the wrapper component
// generated with the withData() connector.
ReactDOM.render(
  <DataProvider dataStore={store}>
    <App/>
  </DataProvider>,
  rootElement
)
```

### `withData()`

```jsx
// This mapper uses the props passed to the wrapper component to manipulate the
// queries. Useful for sort/filter functions, etc.
const mapRecordsToProps = (ownProps) => {
  return {
    planets: q => q.findRecords("planet").sort(ownProps.sortBy),
  }
}

// Or use a simple object if you don't use the wrapper component props in your
// queries.
const mapRecordsToProps = {
  planets: q => q.findRecords("planet"),
}

// Export the generated wrapper component. Your <Planetarium/> component
// receives all the props you pass to the wrapper component, combined
// with the results from the queries defined in the mapRecordsToProps function
// or object, and convenience queryStore and updateStore props, which are
// wrappers around store.query and store.update.
export default PlanetariumWithData = withData(mapRecordsToProps)(Planetarium)
```

License
-------

MIT