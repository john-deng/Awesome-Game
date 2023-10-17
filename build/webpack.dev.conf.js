// 'use strict'; is the strict mode introduced in ECMAScript 5. It enforces stricter execution of code, reduces some errors and improves security.

// Import necessary modules
const utils = require('./utils'); // Utility module
const webpack = require('webpack'); // Webpack module
const config = require('../config'); // Configuration module
const merge = require('webpack-merge'); // Merge module, can merge multiple exported configuration objects into one
const path = require('path'); // path: Provides methods for handling file paths
const baseWebpackConfig = require('./webpack.base.conf'); // Import base Webpack configuration
const CopyWebpackPlugin = require('copy-webpack-plugin'); // File copy module
const HtmlWebpackPlugin = require('html-webpack-plugin'); // Generate HTML template module
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin'); // webpack error output plugin
const portfinder = require('portfinder'); // Get tool module for unused ports

const HOST = process.env.HOST; // Current system host
const PORT = process.env.PORT && Number(process.env.PORT); // Current system port

// Merge base Webpack configuration into this development environment Webpack configuration using merge().
const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    // CSS style loader configuration
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // How Webpack generates source map
  devtool: config.dev.devtool,

  // Configure web server 
  devServer: {
    // Level of logging
    clientLogLevel: 'warning',
    // history api fallback: When using HTML5 history API, any 404 response may need to be replaced with index.html (vue.js routing refresh issue)
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') }
      ]
    }, 
    // Hot module replacement
    hot: true,
    contentBase: false, 
    // Whether to enable gzip compression
    compress: true,
    // Domain name to bind to
    host: HOST || config.dev.host,
    // Port number to use
    port: PORT || config.dev.port,
    // Automatically open default browser
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    // Configure proxy to solve cross-domain issues
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      // Monitor file modification time
      poll: config.dev.poll
    }
  },
  // Define global variable
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    // Hot reload module, realizes real-time update after code modification
    new webpack.HotModuleReplacementPlugin(),
    // Webpack's named module plugin, uses the relative path of the module as the name,
    // so that the current module's relative path can be seen in the Hot Module Replacement plugin.
    new webpack.NamedModulesPlugin(), 
    // If there is a compilation error, webpack will not terminate the task, but output error information.
    new webpack.NoEmitOnErrorsPlugin(),
    // Auto generate HTML file
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true,
      // Custom favicon icon
      favicon: path.resolve('favicon.ico')
    }),
    // Copy static resource files
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
});

// Return an empty Promise object
module.exports = new Promise((resolve, reject) => {
  // Set port number
  portfinder.basePort = process.env.PORT || config.dev.port;
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err);
    } else {
      // Assign the obtained port number to process.env.PORT
      process.env.PORT = port;
      // Assign the obtained port number to devWebpackConfig.devServer.port
      devWebpackConfig.devServer.port = port;

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`]
        },
        onErrors: config.dev.notifyOnErrors
          ? utils.createNotifierCallback()
          : undefined
      }));

      // Export configuration file
      resolve(devWebpackConfig);
    }
  });
});