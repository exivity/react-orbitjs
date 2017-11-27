const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")

// Webpack configuration
module.exports = {
  entry: "./example/src/index.js",
  output: {
    path: path.resolve("example/build"),
    filename: "main.bundle.js",
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: "babel-loader", exclude: /node_modules/},
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./example/src/index.html",
      filename: "index.html",
      inject: "body",
    }),
  ],
  devServer: {
    open: true,
  },
}