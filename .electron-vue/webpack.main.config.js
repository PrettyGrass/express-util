'use strict'

process.env.BABEL_ENV = 'main'

const path = require('path')
const glob = require('glob')
const {dependencies} = require('../package.json')
const webpack = require('webpack')

const BabiliWebpackPlugin = require('babili-webpack-plugin')


const files = glob.sync(path.join(__dirname, '../src/main/**/*.js'))
const filesPath = []
files.forEach((file) => {

  if (file.indexOf('/main/index.js') > 0 || file.indexOf('/main/index.dev.js') > 0 || file.indexOf('/main/index.preview.js') > 0) {
    return
  }
  filesPath.push(file)
})
const otherFiles = glob.sync(path.join(__dirname, '../src/main/assets/**/*'))
otherFiles.forEach((file) => {
  filesPath.push(file)
})
var mainList = [path.join(__dirname, '../src/main/index.js')].concat(filesPath)

let mainConfig = {
  entry: {
    main: mainList
  },
  externals: [
    ...Object.keys(dependencies || {})
  ],
  module: {
    rules: [
      {
        test: /\.(js)$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-friendly-formatter')
          }
        }
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      },
      {
        test: /assets\//,
        loader: 'file-loader',
        options: {
          name: '[folder]/[name].[ext]'
        }
      }
    ]
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/electron')
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin()
  ],
  resolve: {
    extensions: ['.js', '.json', '.node']
  },
  target: 'electron-main'
}

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
    })
  )
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  mainConfig.plugins.push(
    new BabiliWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  )
}

module.exports = mainConfig
