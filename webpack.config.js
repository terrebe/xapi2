var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpack = require('webpack');
var path = require("path");
//var tincan - require("tincan");
//var myApp = new tincan("IM xAPI","778f48b68331df","a14a9bf93e57a3");

var isProd = process.env.NODE_ENV === 'production'; //true or false
var cssDev = ['style-loader', 'css-loader', 'sass-loader'];
var cssProd = ExtractTextPlugin.extract({
          fallback: 'style-loader',
          loader: ['css-loader','sass-loader'],
          publicPath: './'
        })
var cssConfig = isProd ? cssProd : cssDev;

module.exports = {
  entry: {
    app: './src/app.js',
    contact: './src/contact.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: cssConfig
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          //'file-loader?name=images/[name].[ext]',
          'file-loader?name=[name].[ext]&outputPath=images/',
          'image-webpack-loader'
          ]
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    hot: true,
    stats: "errors-only",
    open: true
  },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Project Demo',
        minify: {
          collapseWhitespace: true
        },
        hash: true,
        excludeChunks: ['contact'],
        template: './src/index.html', // Load a custom template (ejs by default see the FAQ for details)
      }),
      new HtmlWebpackPlugin({
        title: 'Contact Page',
        hash: true,
        chunks: ['contact'],
        filename: 'contact.html',
        template: './src/contact.html'
      }),
      new ExtractTextPlugin({
        filename: 'app.css',
        disabled: !isProd,
        allChunks: true
      }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin()
    ]
}
