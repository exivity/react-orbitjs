import React, { Component } from "react"
import ReactDOM from "react-dom"
import Header from "./sections/Header"
import Introduction from "./sections/Introduction"
import TodoExample from "./sections/TodoExample"
import Installation from "./sections/Installation"
import GettingStarted from "./sections/GettingStarted"
import API from "./sections/API"
import Footer from "./sections/Footer"

class App extends Component {
  render() {
    return <div>
      <Header/>
      <main>
        <Introduction/>
        <TodoExample/>
        <Installation/>
        <GettingStarted/>
        <API/>
      </main>
      <Footer/>
    </div>
  }
}

ReactDOM.render(<App/>, document.getElementById("root"))