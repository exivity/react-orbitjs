react-orbitjs
=============

[![Travis](https://img.shields.io/travis/developertown/react-orbitjs.svg)](https://travis-ci.org/developertown/react-orbitjs)
[![Maintainability](https://api.codeclimate.com/v1/badges/9755e12c66ccc470efad/maintainability)](https://codeclimate.com/github/developertown/react-orbitjs/maintainability)

[React](https://reactjs.org/) bindings for [Orbit.js](http://orbitjs.com/).

This package attempts to make it easier to work with
[Orbit.js](http://orbitjs.com/) in a [React](https://reactjs.org/)
environment. In a nutshell it's a transform listener, updating
a component props with records as they are changed. If you're familiar
with [redux](https://github.com/reactjs/redux/) in combination with
[react-redux](https://github.com/reactjs/react-redux), you already know
how to use this package.

Installation
------------

_react-orbitjs requires React 16 and Orbit 0.15 or later._

_yarn_

```
yarn add developertown/react-orbitjs
```
Note: there is no published npm package at the moment, but part of C.I. is testing the latest build against projects that use this library.

See: "External partner tests" in travis.

API
---

 - Context / Data Store Access
  - `OribtProvider`
  - `APIProvider`
  - `withOrbit`

 - Utilities
  - `query`
  - `strategies`
    - `pessimisticWithRemoteIds`
  - Errors 
    - `ErrorMessage`
    - `parseError`
  - Utils
    - `pushPayload`
    - `recordIdentityFrom`
    - `localIdFromRecordIdentity`
    - `remoteIdentityFrom`
    - `attributesFor`


### `<OrbitProvider />`

### `<APIProvider />`

### `withOrbit`

### `query`

### `strategies`

### `pessimisticWithRemoteIds`

### `<ErrorMessage />`

### `parseError`

### `pushPayload`

### `recordIdentityFrom`
### `localIdFromRecordIdentity`
### `remoteIdentityFrom`
### `attributesFor`



--- old docs

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
