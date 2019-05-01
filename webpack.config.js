const path = require('path')
const nodeExternals = require('webpack-node-externals')
const ZipPlugin = require('zip-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const distPath = path.join(__dirname, '.dist')
const distNodeModulesPath = path.join(distPath, 'node_modules')
const nodeModulesPath = path.join(__dirname, 'node_modules')

module.exports = {
  mode: 'production',
  target: 'node',
  externals: [nodeExternals()],
  entry: './app/app.serverless.js',
  output: {
    libraryTarget: 'umd',
    path: distPath,
    publicPath: '/',
    filename: 'index.js',
  },
  resolve: {
    extensions: ['.js'],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      { from: nodeModulesPath, to: distNodeModulesPath },
    ]),
    new ZipPlugin({
      filename: 'dist.zip',
    }),
  ],
}
