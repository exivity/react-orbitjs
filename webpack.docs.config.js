const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin = require('copy-webpack-plugin')


// Webpack configuration
module.exports = {
  entry: "./docs/src/index.js",
  output: {
    path: path.resolve("docs/dist"),
    filename: "main.bundle.js",
  },
  module: {
    loaders: [
      {test: /\.(?:sample|api)\.js$/, loader: "raw-loader"},
      {test: /\.js$/, loader: "babel-loader", exclude: [/node_modules/, /\.(?:sample|api)\.js$/]},
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./docs/src/index.html",
      filename: "index.html",
      inject: "body",
    }),
    new CopyWebpackPlugin([
      { from: "docs/src/index.css" }
    ])
  ],
  devtool: "source-map",
  devServer: {
    open: true,
  },
}