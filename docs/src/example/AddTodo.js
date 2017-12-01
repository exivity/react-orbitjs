import React, { Component } from "react"
import { DateTime } from "luxon"
import { withData } from "./../../../src"

class AddTodo extends Component {
  state = {
    description: null,
  }

  saveTodo = () => {
    const {description} = this.state
    this.props.updateStore(t => t.addRecord({
      type: "todo",
      attributes: {
        description,
        done: false,
        added: DateTime.local().toString()
      },
    }))
  }

  render() {
    return <form onSubmit={(event) => {
      event.preventDefault()
      this.saveTodo()
    }}>
      <input type="text" name="description" required
             onChange={(e) => this.setState({description: e.target.value})}/>
      {" "}
      <button type="submit">add</button>
    </form>
  }
}

export default withData()(AddTodo)