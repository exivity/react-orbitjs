import PropTypes from "prop-types"
import React from "react"
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"

const Code = ({children, language = "text"}) => (
  <SyntaxHighlighter language={language}
                     style={tomorrow}>{children}</SyntaxHighlighter>
)

Code.propTypes = {
  children: PropTypes.node.isRequired,
  language: PropTypes.oneOf([
    "text", "jsx", "javascript"
  ])
}

export default Code