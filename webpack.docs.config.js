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
    rules: [
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
    new CopyWebpackPlugin({
      patterns: [
        { from: "docs/src/index.css" },
        { from: "docs/src/favicon.png" },
      ]
    })
  ],
  devtool: "source-map",
  devServer: {
    open: true,
  },
}