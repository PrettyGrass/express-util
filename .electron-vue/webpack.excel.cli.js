const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const BabiliWebpackPlugin = require('babili-webpack-plugin')

let nodeModules = {};
fs.readdirSync('node_modules')

const cliPack = {
  entry: {
    node: './src/renderer/cli/excel.cli.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist/cli'),
    filename: 'excel-to-string-cli-bundle.js'
  },
  target: 'node',
  externals: nodeModules,
  plugins: []
}

if (process.env.NODE_ENV === 'production') {

  cliPack.plugins.push(
    new BabiliWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
  )
}

module.exports = cliPack