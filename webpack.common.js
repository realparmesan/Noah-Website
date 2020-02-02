const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const AssetsPlugin = require("assets-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        main: path.join(__dirname, "src", "index.ts"),
        // cms: path.join(__dirname, "src", "js", "cms.js"),
    },
    devtool: 'source-map',
    output: {
        path: path.join(__dirname, "dist"),
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.((png)|(eot)|(woff)|(woff2)|(ttf)|(svg)|(gif))(\?v=\d+\.\d+\.\d+)?$/,
                use: ["file-loader?name=/[hash].[ext]"]
            },
            {
                test: /\.tsx?$/,
                use: [{
                    loader: "ts-loader",
                }],
                exclude: /node_modules/,
            },
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                test: /\.(sa|sc|c)ss$/,
                exclude: /node_modules/,
                use: ["style-loader", MiniCssExtractPlugin.loader, "css-loader", "postcss-loader", "sass-loader"]
            }
        ]
    },

    plugins: [
        new AssetsPlugin({
            filename: "webpack.json",
            path: path.join(process.cwd(), "data"),
            prettyPrint: true
        }),
        new CopyWebpackPlugin([
            {
                from: "./src/fonts/",
                to: "fonts/",
                flatten: true
            }
        ]),
        new HtmlWebpackPlugin({
          filename: 'admin/index.html',
          template: 'site/static/admin/index.html',
          inject: false,
        }),
    ]
};
