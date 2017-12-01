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