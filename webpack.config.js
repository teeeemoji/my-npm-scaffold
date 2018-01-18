const path = require('path');

// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: {
      root: 'Mediator',
      amd: 'mediator-js',
      commonjs: 'Mediator'
    },
    libraryTarget: 'umd'
  },
  module: {
    rules: [{
      test: /\.(js)$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env'],
          plugins: [
            // 'transform-decorators-legacy',
            'transform-class-properties'
          ]
        }
      }
    }]
  },
  plugins: [
    // new webpack.optimize.UglifyJsPlugin({
    //     compress: {
    //         warnings: false
    //     }
    // })
  ]
};