import React from "react"
import Code from "./../components/Code"
import DataProviderSample from "./../code-samples/DataProvider.sample.js"
import withDataSample from "./../code-samples/withData.sample.js"

const GettingStarted = () => (
  <section>
    <h2>Getting Started</h2>
    <p>Define your Orbit stores, and provide them to your app through a
      single <code>{`<DataProvider/>`}</code> root component:
    </p>
    <Code language="jsx">{DataProviderSample}</Code>
    <p>Then, use the <code>withData()</code> <a
      href="https://reactjs.org/docs/higher-order-components.html">Higher-Order-Component</a> factory
      to wrap your component which will receive the results from the Orbit store
      queries:</p>
    <blockquote>Please note that <code>withData()</code> passes props received from
      the <a href="http://orbitjs.com/v0.15/guide/querying-data.html#Querying-a-store’s-cache">store cache</a>. If you want to pull data from external sources, use the injected <code>this.props.queryStore()</code> method.</blockquote>
    <Code language="jsx">{withDataSample}</Code>
  </section>
)

export default GettingStarted