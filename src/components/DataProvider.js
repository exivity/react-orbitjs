import { Children, Component } from "react"
import PropTypes from "prop-types"
import dataStoreShape from "../utils/dataStoreShape"

class DataProvider extends Component {
  constructor(props, context) {
    super(props, context)
    this.dataStore = props.dataStore
  }

  getChildContext() {
    return {dataStore: this.dataStore}
  }

  render() {
    return Children.only(this.props.children)
  }
}

DataProvider.propTypes = {
  dataStore: dataStoreShape.isRequired,
  children: PropTypes.element.isRequired,
}

DataProvider.childContextTypes = {
  dataStore: dataStoreShape.isRequired,
}

export default DataProvider