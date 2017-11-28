const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")

// Webpack configuration
module.exports = {
  entry: "./docs/src/index.js",
  output: {
    path: path.resolve("docs/dist"),
    filename: "main.bundle.js",
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: "babel-loader", exclude: /node_modules/},
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./docs/src/index.html",
      filename: "index.html",
      inject: "body",
    }),
  ],
  devtool: "source-map",
  devServer: {
    open: true,
  },
}