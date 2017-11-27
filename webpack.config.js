const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")

// Webpack configuration
module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve("dist"),
    filename: "react-orbitjs.bundle.js",
  },
  externals: [
    "react",
  ],
  module: {
    loaders: [
      {test: /\.js$/, loader: "babel-loader", exclude: /node_modules/},
    ],
  },
}