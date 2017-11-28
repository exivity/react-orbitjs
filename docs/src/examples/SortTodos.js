import React, { Component } from "react"
import PropTypes from "prop-types"

const SortTodos = ({onChange}) => <div>
  Sort by
  {" "}
  <select defaultValue="description" onChange={(e) => onChange(e.target.value)}>
    <option value="description">Description</option>
    <option value="added">Date</option>
  </select>
</div>

SortTodos.propTypes = {
  onChange: PropTypes.func.isRequired,
}

export default SortTodos