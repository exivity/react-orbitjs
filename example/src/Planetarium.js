import React, { Component } from "react"
import PropTypes from "prop-types"

import { withData } from "./../../src"

class Planetarium extends Component {
  render() {
    return <div>
      <h1>Planetarium</h1>
      <ul>
        {this.props.planets.map(planet => <li>{planet.name}</li>)}
      </ul>
    </div>
  }
}

Planetarium.propTypes = {}

const mapRecordsToProps = {
  planets: q => q.findRecords("planet").sort("name"),
}

export default withData(mapRecordsToProps)(Planetarium)