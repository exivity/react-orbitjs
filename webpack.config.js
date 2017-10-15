const path = require("path")
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Webpack configuration
module.exports = {
  entry: {
    "dist/react-orbitjs": "./src/index.js",
    "example/build/main": "./example/src/index.js",
  },
  output: {
    path: path.resolve("."),
    filename: "[name].bundle.js",
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: "babel-loader", exclude: /node_modules/},
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './example/src/index.html',
      filename: 'example/build/index.html',
      inject: 'body'
    })
  ],
  devServer: {
    contentBase: "example/build",
  },
}