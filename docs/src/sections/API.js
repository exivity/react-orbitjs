import React from "react"
import Code from "./../components/Code"
import DataProviderAPI from "./../code-samples/DataProvider.api.js"
import withDataAPI from "./../code-samples/withData.api.js"

const API = () => (
  <section>
    <h2>API</h2>
    <h3><code>{`<DataProvider/>`}</code></h3>
    <Code language="javascript">{DataProviderAPI}</Code>
    <h3><code>withData()</code></h3>
    <Code language="javascript">{withDataAPI}</Code>
  </section>
)

export default API