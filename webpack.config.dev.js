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
const CleanWebpackPlugin = require('clean-webpack-plugin');
const postcssColorFunction = require("postcss-color-function");
const postcssCustomMedia = require("postcss-custom-media");


module.exports = {
  entry: [
    'webpack-hot-middleware/client',
    path.resolve(__dirname, 'src')
  ],
  output: {
    path: path.resolve(__dirname, 'src'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  plugins: [
    new CleanWebpackPlugin(['public/*']),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
        WEBPACK: true
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: "classnames-loader",
          },
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: [
                postcssImport({
                  path: [path.resolve(process.cwd(), "src")],
                }),
                postcssColorFunction,
                postcssCustomMedia,
                autoprefixer({
                  browsers: ["last 2 versions", "> 1%", "IE >= 9"],
                }),
              ],
            },
          },
        ],
      },
      {
        test: /\.story\.js?$/,
        enforce: "pre",
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "react-svg-loader",
            options: {
              svgo: {
                plugins: [
                  {
                    removeAttrs: { attrs: "xmlns.*" },
                  },
                ],
              },
            },
          },
        ],
      },
    ],
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        include: path.resolve(__dirname, 'src'),
        query: {
          presets: [ 'react-hmre' ]
        }
      },
      {
        test: /\.css$/,
        loader: 'style!css!postcss',
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
