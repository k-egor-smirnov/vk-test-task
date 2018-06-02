const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    app: [
      path.join(__dirname, "src", "index.html"),
      path.join(__dirname, "src", "app.js")
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "./index.html",
      inject: "head"
    }),
    new CleanWebpackPlugin("./dist/*", {
      watch: true
    })
  ],
  output: {
    filename: "[name].[chunkhash:4].js",
    publicPath: "/dist",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [{ test: /\.html$/, loader: "html-loader" }]
  },
  resolve: {
    extensions: [".json", ".js", ".jsx", ".css"]
  },
  devtool: "source-map",
  devServer: {
    publicPath: path.resolve(__dirname, "dist")
  }
};
