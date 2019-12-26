module.exports = {
  presets: [
    [ '@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 } ],
    '@babel/preset-react',
  ],
  plugins: [
    [ '@babel/plugin-proposal-decorators', { legacy: true } ],
    [ '@babel/plugin-proposal-class-properties', { loose: true } ],
    [ '@babel/plugin-proposal-object-rest-spread', { loose: true } ],
    '@babel/plugin-transform-object-assign',
    '@babel/plugin-transform-runtime',
  ],
  ignore: [ /@babel[\\|/]runtime/ ],
};
