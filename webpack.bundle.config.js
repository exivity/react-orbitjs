const path = require("path")

// Webpack configuration
module.exports = {
  mode: "production",
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
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
}
