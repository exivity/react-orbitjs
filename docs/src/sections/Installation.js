import React from "react"
import Code from "./../components/Code"

const Installation = () => (
  <section>
    <h2>Installation</h2>
    <blockquote>
      react-orbitjs requires <a href="https://reactjs.org/">React</a> 15
      and <a href="http://orbitjs.com/">Orbit</a> 0.15 or later to work.
    </blockquote>
    <p>With <a href="https://www.npmjs.com/">npm</a></p>
    <Code>npm install --save react-orbitjs</Code>
    <p>With <a href="https://yarnpkg.com/">yarn</a></p>
    <Code>yarn add react-orbitjs</Code>
  </section>
)

export default Installation