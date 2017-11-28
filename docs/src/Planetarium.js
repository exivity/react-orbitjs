import React, { Component } from "react"
import PropTypes from "prop-types"

import { withData } from "./../../src"

class Planetarium extends Component {
  render() {
    return <div>
      <h1>Planetarium</h1>
      <ul>
        {this.props.planets.map(planet => (
          <li key={planet.id}>
            {planet.attributes.name}
            <button onClick={() => this.props.updateStore(t => t.removeRecord({type: "planet", id: planet.id}))}>
              remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  }
}

Planetarium.propTypes = {
  sortBy: PropTypes.string,
}

const mapRecordsToProps = (ownProps) => {
  return {
    planets: q => q.findRecords("planet").sort(ownProps.sortBy),
  }
}

export default withData(mapRecordsToProps)(Planetarium)