import React, { Component } from "react"
import PropTypes from "prop-types"

const FilterTodos = ({onChange}) => <div>
  Show
  {" "}
  <select defaultValue="all" onChange={(e) => onChange(e.target.value)}>
    <option value="all">All</option>
    <option value="todo">To do</option>
    <option value="done">Done</option>
  </select>
</div>

FilterTodos.propTypes = {
  onChange: PropTypes.func.isRequired,
}

export default FilterTodos