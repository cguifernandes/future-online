const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const Dotenv = require("dotenv-webpack");

module.exports = {
	entry: {
		popup: path.resolve(__dirname, "src/popup/index.tsx"),
		dashboard: path.resolve(__dirname, "src/pages/dashboard/index.tsx"),
		login: path.resolve(__dirname, "src/pages/login/index.tsx"),
		panel: path.resolve(__dirname, "src/pages/panel-control/index.tsx"),
		config: path.resolve(__dirname, "src/pages/config/index.tsx"),
		"content/content": path.resolve(__dirname, "src/content/content.ts"),
		"background/background": path.resolve(
			__dirname,
			"src/background/background.ts",
		),
		"content/wa-js": path.resolve(__dirname, "src/content/wa-js.ts"),
		"content/wpp": path.resolve(__dirname, "src/content/wpp.js"),
		utils: path.resolve(__dirname, "src/utils/utils.tsx"),
		"content/injector": path.resolve(__dirname, "src/content/injector.ts"),
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
					from: path.resolve(__dirname, "src/static"),
					to: path.resolve(__dirname, "dist"),
				},
			],
		}),
		...getHtmlPlugins(["popup", "dashboard", "login", "panel", "config"]),
		new Dotenv(),
	],
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	output: {
		filename: ({ chunk }) => {
			if (chunk && chunk.name && chunk.name.startsWith("content/")) {
				return `[name].js`;
			}

			if (chunk && chunk.name && chunk.name.startsWith("background/")) {
				return `[name].js`;
			}

			return `chunks/[name].js`;
		},
		path: path.resolve(__dirname, "dist"),
		assetModuleFilename: "misc/[name][ext][query]",
	},
	optimization: {
		splitChunks: {
			chunks: "all",
		},
	},
};

function getHtmlPlugins(chunks) {
	return chunks.map((chunk) => {
		const filename =
			chunk === "popup" ? `popup/${chunk}.html` : `pages/${chunk}.html`;

		return new HtmlPlugin({
			title: chunk.charAt(0).toUpperCase() + chunk.slice(1),
			filename: filename,
			chunks: [chunk],
			scriptLoading: "blocking",
		});
	});
}
