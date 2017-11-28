import React, { Component } from "react"
import PropTypes from "prop-types"
import { withData } from "./../../../src"
import AddTodo from "./AddTodo"

class TodoList extends Component {
  render() {
    return <ul>
      {this.props.todos.map(todo => (
        <li key={todo.id} style={{
          textDecoration: todo.attributes.done ? "line-through" : "",
        }} onClick={() => {
          this.props.updateStore(t => t.replaceAttribute({type: "todo", id: todo.id}, "done", !todo.attributes.done))
        }}>
          {todo.attributes.description}
        </li>
      ))}
      <li>
        <AddTodo/>
      </li>
    </ul>
  }
}

TodoList.propTypes = {
  sortBy: PropTypes.string,
  show: PropTypes.oneOf(["all", "todo", "done"]),
}

TodoList.defaultProps = {
  sortBy: "description",
  show: "all",
}

const mapRecordsToProps = (ownProps) => {
  return {
    todos: q => {
      const query = q.findRecords("todo").sort(ownProps.sortBy)

      if (ownProps.show === "todo") {
        query.filter({attribute: "done", value: false})
      } else if (ownProps.show === "done") {
        query.filter({attribute: "done", value: true})
      }

      return query
    },
  }
}

export default withData(mapRecordsToProps)(TodoList)