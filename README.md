react-orbitjs
=============

[React](https://reactjs.org/) bindings for [Orbit](http://orbitjs.com/).
_Inspired by [react-redux](https://github.com/reactjs/react-redux)._

Installation
------------

react-orbitjs requires **React 15 and Orbit 0.15 or later.**

_npm_

```
npm install --save react-orbitjs
```

_yarn_

```
yarn add react-orbitjs
```

Documentation
-------------

### `<DataProvider/>`

```
const store = new Store({schema})

ReactDOM.render(
  <DataProvider dataStore={store}>
    <Planetarium/>
  </DataProvider>,
  rootElement
)
```

### `withData()`

```
const mapRecordsToProps = (ownProps) => {
  return {
    planets: q => q.findRecords("planet").sort(ownProps.sortBy),
  }
}

// or

const mapRecordsToProps = {
  planets: q => q.findRecords("planet"),
}

const PlanetariumWithData = withData(mapRecordsToProps)(Planetarium)
```

License
-------

MIT