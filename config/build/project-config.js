const pathConfig = require('./path-config'); // to pass public path directly to webpack
module.exports = {
	info:
	{
		"name": "Project Name",
		"url": "https://projecturl.com",
		"description": "Primary Marketing Site",
		"version": "1.0.0",
		"author": "Astuteo LLC",
		"authorUrl": "https://astuteo.com"
	},
	templates:
	{
		path: "templates"
	},
	tailwindconfig: 'tailwind.config.js',
	javascripts:
	{
		publicPath: "/" + pathConfig.assets + "/" + pathConfig.javascripts.dest,
		entry:
		{
			app: ["./app.js"]
		},
		production:
		{
			// this will need to be updated when blendid is upgraded to webpack v4 https://stackoverflow.com/questions/41040266/remove-console-logs-with-webpack-uglify#41041233
			uglifyJsPlugin:
			{
				// Eliminate comments
				comments: true,
				// Compression specific options
				compress:
				{
					// remove warnings
					warnings: false,
					// Drop console statements
					drop_console: true
				}
			}
		},
		babel:
		{
			presets: ['env'],
			plugins: ['transform-class-properties']
		},
		include: ['node_modules']
	},
};
