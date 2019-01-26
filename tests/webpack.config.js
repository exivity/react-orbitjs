/* eslint-disable */
const {
  locate, plugins, moduleRules, resolver,
  environment, isProduction, isDevelopment
} = require('../config/webpack.common.js');

if (process.env.COVERAGE) {
  moduleRules.push({
    enforce: 'post',
    test: /\.(t|j)sx?$/,
    use: [{
      loader: 'istanbul-instrumenter-loader'
    }],
    exclude: [/node_modules/],
  });
}

module.exports = {
  mode: environment,
  devtool: 'inline-source-map',
  context: process.cwd(),
  entry: locate('tests/index.ts'),
  module: {
    rules: moduleRules
  },
  resolve: resolver,
  output: {
    filename: 'test-bundle-[name].js',
    path: process.cwd() + '/dist'
  },
  plugins: [
    ...plugins,
  ],
};
