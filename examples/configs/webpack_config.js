const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: path.resolve(__dirname, '../demos/todo/index.js'),
    output: {
        path: path.resolve(__dirname, '../demos/todo/dist'),
        filename: '[name][hash:8]_bundle.js'
    },
    resolve: {},
    devServer: {
        host: '127.0.0.1',
        port: 3030,
        hot: true,
        open: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                query: {
                    "presets": ["@babel/preset-env", "@babel/preset-react"]
                } 
            },
            {
              test: /\.css$/,
              loader: ['style-loader', 'css-loader']
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/index.html')
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('development'),
          'process.env.DEBUG': JSON.stringify('development')
        })
    ]
}