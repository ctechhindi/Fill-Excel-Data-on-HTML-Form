const webpack = require('webpack');
const ejs = require('ejs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');
const { VueLoaderPlugin } = require('vue-loader');
// https://github.com/Turbo87/webpack-notifier
var WebpackNotifierPlugin = require('webpack-notifier');
const { version } = require('./package.json');
const JavascriptFilesInject = require("./plugins/javascript-files-inject.js");

const config = {
  mode: process.env.NODE_ENV,
  context: __dirname + '/src',
  entry: {
    'background': './background.js',
    'popup/popup': './popup/popup.js',
    'options/options': './options/options.js',
    'request/request': './request/request.js',
    'script/run': './script/run.js',
    'script/root': './script/root.js',
    'script/copy_element': './script/copy_element.js',
    'script/fetch_form_fields': './script/fetch_form_fields.js',
    'script/onload': './script/onload.js',
    'script/selector-generator': './script/selector-generator.js',
    // Temp Scripts
    'temp/script1': './script/run_2.js',
    'temp/script2': './script/templates/run_2-template.js',
    // 'temp/script3': './script/custom_form_functions.js',
    // 'temp/script4': './script/templates/custom_form_functions-template.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.js', '.vue'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.sass$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader?indentedSyntax'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
          outputPath: '/images/',
          emitFile: true,
          esModule: false,
        },
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
          outputPath: '/fonts/',
          emitFile: true,
          esModule: false,
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      global: 'window',
    }),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CopyPlugin([
      { from: 'icons', to: 'icons', ignore: ['icon.xcf'] },
      { from: 'assets', to: 'assets'},
      { from: 'css', to: 'css'},
      { from: 'popup/popup.html', to: 'popup/popup.html', transform: transformHtml },
      { from: 'options/options.html', to: 'options/options.html', transform: transformHtml },
      { from: 'request/request.html', to: 'request/request.html', transform: transformHtml },
      {
        from: 'manifest.json',
        to: 'manifest.json',
        transform: (content) => {
          const jsonContent = JSON.parse(content);
          jsonContent.version = version;

          if (config.mode === 'development') {
            jsonContent['content_security_policy'] = "script-src 'self' 'unsafe-eval'; object-src 'self'";
          }

          return JSON.stringify(jsonContent, null, 2);
        },
      },
    ]),
    new JavascriptFilesInject({
      scriptFile: "script/run_2.js",
      templateFile: "script/templates/run_2-template.js",
      outputFile: __dirname + '/dist/script/inject-run.js',
      minify: true,
    }),
    // new JavascriptFilesInject({
    //   scriptFile: "script/custom_form_functions.js",
    //   templateFile: "script/templates/custom_form_functions-template.js",
    //   outputFile: __dirname + '/dist/script/custom-action.js',
    //   minify: true,
    // }),
    new WebpackNotifierPlugin({
      alwaysNotify: true
    }),
  ]
};

if (config.mode === 'production') {
  config.plugins = (config.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
    }),
  ]);
}

if (process.env.HMR === 'true') {
  config.plugins = (config.plugins || []).concat([
    new ExtensionReloader({
      manifest: __dirname + '/src/manifest.json',
    }),
  ]);
}

function transformHtml(content) {
  return ejs.render(content.toString(), {
    ...process.env,
  });
}

module.exports = config;
