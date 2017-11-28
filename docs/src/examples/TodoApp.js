import React, { Component } from "react"
import { DataProvider } from "./../../../src"
import store from "./store"
import TodoList from "./TodoList"
import SortTodos from "./SortTodos"
import FilterTodos from "./FilterTodos"

class TodoApp extends Component {
  state = {
    show: "all",
    sortBy: "description",
  }

  render() {
    const {show, sortBy} = this.state

    return <DataProvider dataStore={store}>
      <div className="example">
        <SortTodos onChange={(sortBy) => this.setState({sortBy})}/>
        <hr/>
        <TodoList show={show} sortBy={sortBy}/>
        <hr/>
        <FilterTodos onChange={(show) => this.setState({show})}/>
      </div>
    </DataProvider>
  }
}

export default TodoApp