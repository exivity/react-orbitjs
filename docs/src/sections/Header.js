import React from "react"

const Header = () => (
  <header>
    <h1>react-orbitjs</h1>
    <h2>React bindings for Orbit. Inspired by react-redux.</h2>
    <p>
      <a className="button"
         href="https://github.com/exivity/react-orbitjs/">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Octicons-mark-github.svg/2048px-Octicons-mark-github.svg.png"
          alt="GitHub logo"/>
          github
      </a>
      <a className="button"
         href="https://www.npmjs.com/package/react-orbitjs">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/d/db/Npm-logo.svg"
          alt="NPM logo"/>
        npm
      </a>
    </p>
  </header>
)

export default Header