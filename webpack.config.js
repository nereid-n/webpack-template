const path = require('path');
const PugPlugin = require('pug-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
	output: {
		path: path.join(__dirname, 'public/'),
	},
	
	entry: {
		index: './src/views/index.pug'
	},

	plugins: [
		new PugPlugin({
			js: {
				filename: 'assets/js/[name].[contenthash:8].js',
			},
			css: {
				filename: 'assets/css/[name].[contenthash:8].css',
			},
		}),
		new BrowserSyncPlugin({
      		host: 'localhost',
    		port: 3000,
    		server: { baseDir: ['public'] }
    	}),
		new ESLintPlugin({
			extensions: ['.tsx', '.ts', '.js'],
			exclude: 'node_modules'
		})
	],

	module: {
		rules: [
			{
				test: /\.pug$/,
				loader: PugPlugin.loader,
			},
			{
				test: /\.(css|scss)$/,
				use: ['css-loader', 'sass-loader'],
			},
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				exclude: /(node_modules)/
			},
			{
    			test: /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i,
    			type: 'asset/resource',
    			generator: {
        			filename: 'img/[hash][ext][query]'
				}
    		},
    		{
    			test: /\.(ttf|otf|woff|eot)$/i,
    			type: 'asset/resource',
    			generator: {
        			filename: 'fonts/[hash][ext][query]'
				}
    		}
		],
	},
	
	resolve: {
		extensions: ['.ts', '.js']
	},
	watch: true
};