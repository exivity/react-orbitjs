const dataStoreShape = PropTypes.shape({
  query: PropTypes.func.isRequired,
  on: PropTypes.func.isRequired,
  cache: PropTypes.object.isRequired
})

DataProvider.propTypes = {
  dataStore: dataStoreShape.isRequired,
  children: PropTypes.element.isRequired,
}

DataProvider.childContextTypes = {
  dataStore: dataStoreShape.isRequired,
}