const path = require("path")

// Webpack configuration
module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist/bundle"),
    filename: "react-orbitjs.js",
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