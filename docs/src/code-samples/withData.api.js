withData(mapRecordsToProps: functionOrObject = {})(WrappedComponent): WithData

const recordShape = PropTypes.shape({
  type: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  attributes: PropTypes.array,
  relationships: PropTypes.array,
})

WithData.WrappedComponent = WrappedComponent

WithData.contextTypes = {
  dataStore: dataStoreShape,
}

WithData.propTypes = {
  dataStore: dataStoreShape,
}

WrappedComponent.propTypes = {
  queryStore: PropTypes.func,
  updateStore: PropTypes.func,
  ...mapRecordsToPropsReturnObjectKeys: PropTypes.arrayOf(recordShape),
  ...WithData.props,
}