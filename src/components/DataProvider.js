import { Children, Component } from "react"
import PropTypes from "prop-types"
import dataStoreShape from "../utils/dataStoreShape"

class DataProvider extends Component {
  constructor(props, context) {
    super(props, context)
    this.dataStore = props.dataStore
    this.sources = props.sources
  }

  getChildContext() {
    return {dataStore: this.dataStore, sources: this.sources}
  }

  render() {
    return Children.only(this.props.children)
  }
}

DataProvider.propTypes = {
  dataStore: dataStoreShape.isRequired,
  sources: PropTypes.object,
  children: PropTypes.element.isRequired,
}

DataProvider.childContextTypes = {
  dataStore: dataStoreShape.isRequired,
  sources: PropTypes.object
}

export default DataProvider