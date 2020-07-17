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
