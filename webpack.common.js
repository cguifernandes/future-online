const path = require("node:path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const Dotenv = require("dotenv-webpack");

module.exports = {
	entry: {
		popup: path.resolve("./src/popup/index.tsx"),
		dashboard: path.resolve("./src/tabs/dashboard/index.tsx"),
		content: path.resolve("./src/content/content.ts"),
		background: path.resolve("./src/background/background.ts"),
	},
	module: {
		rules: [
			{
				use: "ts-loader",
				test: /\.tsx?$/,
				exclude: /node_modules/,
			},
			{
				test: /\.css$/i,
				use: [
					"style-loader",
					{
						loader: "css-loader",
						options: {
							importLoaders: 1,
						},
					},
					{
						loader: "postcss-loader",
						options: {
							postcssOptions: {
								ident: "postcss",
								plugins: [tailwindcss, autoprefixer],
							},
						},
					},
				],
			},
			{
				type: "assets/resource",
				test: /\.(png|jpg|jpeg|gif|woff|woff2|tff|eot|svg)$/,
			},
		],
	},
	plugins: [
		new CleanWebpackPlugin({
			cleanStaleWebpackAssets: false,
		}),
		new CopyPlugin({
			patterns: [
				{
					from: path.resolve("src/static"),
					to: path.resolve("dist"),
				},
			],
		}),
		...getHtmlPlugins(["popup", "dashboard"]),
		new Dotenv(),
	],
	resolve: {
		extensions: [".tsx", ".js", ".ts"],
	},
	output: {
		filename: "[name].js",
		path: path.join(__dirname, "dist"),
	},
	optimization: {
		splitChunks: {
			chunks: "all",
		},
	},
};

function getHtmlPlugins(chunks) {
	return chunks.map(
		(chunk) =>
			new HtmlPlugin({
				title: chunk.charAt(0).toUpperCase() + chunk.slice(1),
				filename: `${chunk}.html`,
				chunks: [chunk],
			}),
	);
}
