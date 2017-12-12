const path = require("path")

// Webpack configuration
module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist/bundle/umd"),
    filename: "react-orbitjs.js",
    library: "ReactOrbitjs",
    libraryTarget: "umd",
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