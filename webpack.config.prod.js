const path = require('path');
const webpack = require('webpack');
const postcssInlineComment = require('postcss-inline-comment');
const postcssNested = require('postcss-nested');
const postcssVars = require('postcss-simple-vars');
const postcssImport = require('postcss-import');
const postcssMixins = require('postcss-mixins');
const postcssMqPacker = require('css-mqpacker');
const autoprefixer = require('autoprefixer');
const csswring = require('csswring');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src'),
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    modulesDirectories: ['src','public', 'components', 'node_modules']
  },
  plugins: [
    new CleanWebpackPlugin(['public/*']),
    new HtmlWebpackPlugin({
      title: 'Custom template',
      // Load a custom template (lodash by default see the FAQ for details)
      template: 'src/index.html'
    })
,  

new SWPrecacheWebpackPlugin({
  // By default, a cache-busting query parameter is appended to requests
  // used to populate the caches, to ensure the responses are fresh.
  // If a URL is already hashed by Webpack, then there is no concern
  // about it being stale, and the cache-busting can be skipped.
  dontCacheBustUrlsMatching: /\.\w{8}\./,
  filename: 'service-worker.js',
  logger(message) {
    if (message.indexOf('Total precache size is') === 0) {
      // This message occurs for every build and is a bit too noisy.
      return;
    }
    if (message.indexOf('Skipping static resource') === 0) {
      // This message obscures real errors so we ignore it.
      // https://github.com/facebookincubator/create-react-app/issues/2612
      return;
    }
    console.log(message);
  },
  minify: true,
  // For unknown URLs, fallback to the index page
  navigateFallback:  '/index.html',
  // Ignores URLs starting from /__ (useful for Firebase):
  // https://github.com/facebookincubator/create-react-app/issues/2237#issuecomment-302693219
  navigateFallbackWhitelist: [/^(?!\/__).*/],
  // Don't precache sourcemaps (they're large) and build asset manifest:
  staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
}),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        WEBPACK: true
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'src', 'assets'),
        to: path.resolve(__dirname, 'public', 'assets')
      }
    ]),
    new ExtractTextPlugin('bundle.css')
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        include: path.resolve(__dirname, 'src')
      },
      {
        test: /\.css/,
        loader: ExtractTextPlugin.extract('style', 'css!postcss'),
        include: path.resolve(__dirname, '/')
      }
    ]
  },
  postcss: function() {
    return [
      postcssImport,
      postcssVars,
      postcssNested,
      postcssInlineComment,
      postcssMixins,
      postcssMqPacker,
      autoprefixer,
      csswring
    ];
  }
};
