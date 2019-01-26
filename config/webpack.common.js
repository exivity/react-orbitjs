const path = require('path');

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');

function locate(path) {
  return process.cwd() + '/' + path;
}

const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isDevelopment = environment === 'development';
const isTesting = environment === 'test' || environment === 'testing';

const tsLoaderExclude = [];

if (!isTesting) {
  tsLoaderExclude.concat([
    /__tests__/,
    /(\.|-)test/,
    /\/-page.ts/,
    /\/-(\w+)\.tsx?/,
    /^\/?tests\//,
  ]);
}

const moduleRules = [
  {
    test: /\.(t|j)sx?$/,
    use: [
      {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    ],
    exclude: [/node_modules/, /\.cache/],
  },
  {
    test: /\.s?css$/,
    include: [/node_modules/, /src/, ...tsLoaderExclude],
    use: [
      'style-loader', // creates style nodes from JS strings
      'css-loader', // translates CSS into CommonJS
      'sass-loader', // compiles Sass to CSS
    ],
  },
  {
    test: /\.(png|svg)$/,
    loader: 'url-loader?limit=100000',
  },
  { test: /\.ttf$/, loader: 'ignore-loader' },
  { test: /\.woff$/, loader: 'ignore-loader' },
  { test: /\.woff2$/, loader: 'ignore-loader' },
  { test: /\.eot$/, loader: 'ignore-loader' },
  { test: /favicon.(ico|png)$/, loader: 'file-loader?name=[name].[ext]' },
];

const resolver = {
  extensions: ['.tsx', '.ts', '.js', '.jsx'],
  plugins: [
    new TsconfigPathsPlugin({
      configFile: locate('tsconfig.json'),
    }),
  ],
};

const plugins = [
  new webpack.EnvironmentPlugin([
    'AUTH0_CONNECTION',
    'AUTH0_DOMAIN',
    'AUTH0_CLIENT_ID',
    'AUTH0_SCOPE',
    'API_HOST',
    'HAS_API',
    'NODE_ENV',
    'IS_TESTING',
  ]),
];

module.exports = {
  locate,
  moduleRules,
  resolver,
  environment,
  isProduction,
  isDevelopment,
  plugins,
};
