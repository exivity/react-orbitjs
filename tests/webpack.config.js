/* eslint-disable */
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

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
    rules: [
      {
        test: /\.(t|j)sx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              context: process.cwd(),
              configFile: locate('tests/tsconfig.json'),
            },
          },
        ],
        exclude: [/node_modules/, /\.cache/],
      },
      {
        test: /\.s?css$/,
        include: [/node_modules/, /src/],
        use: [
          'style-loader', // creates style nodes from JS strings
          'css-loader', // translates CSS into CommonJS
          'sass-loader', // compiles Sass to CSS
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: locate('tests/tsconfig.json'),
      }),
    ],
  },
  output: {
    filename: 'test-bundle-[name].js',
    path: process.cwd() + '/dist'
  },
  plugins: [
    ...plugins,
  ],
};
