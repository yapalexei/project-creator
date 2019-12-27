const path = require('path');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');
module.exports = ( { config } ) => {
  const indexOfDefPlug = config.plugins.findIndex(item => item instanceof webpack.DefinePlugin);
  if (indexOfDefPlug > -1) config.plugins.splice(indexOfDefPlug, 1);
  config.plugins.push(new Dotenv({
    path: './process.env',
    expand: true,
  }));
  return {
  ...config,
  module: {
    ...config.module,
    rules: [
      ...config.module.rules.filter(rule => !(
        (rule.use && rule.use.length && rule.use.find(({ loader }) => loader === 'babel-loader'))
      )),
      {
        test: /\.js?$/,
        include: require('path').resolve('./'),
        exclude: /(node_modules|lib)/,
        loader: 'babel-loader',
      },
      {
        test: /\.js$/,
        use: 'eslint-loader',
        enforce: 'pre',
        exclude: /(node_modules|lib)/
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          // 'sass-loader'
        ],
        include: path.resolve(__dirname, '../'),
      }
    ]
  },
  node: {
    fs: "empty"
  }
} };
