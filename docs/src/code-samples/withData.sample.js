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