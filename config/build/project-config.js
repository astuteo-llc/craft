const pathConfig = require('./path-config'); // to pass public path directly to webpack
module.exports = {
    info: {
        "name": "Project Name",
        "url": "https://projecturl.com",
        "description": "Primary Marketing Site",
        "version": "1.0.0",
        "author": "Astuteo LLC",
        "authorUrl": "https://astuteo.com"
    },
    templates: {
        path: "templates"
    },

    javascripts: {
        publicPath: "/" + pathConfig.assets + "/" + pathConfig.javascripts.dest,
        entry: {
            app: ["./app.js"]
        },
		babel: {
			presets: ['env'],
			plugins: ['transform-class-properties']
		},
        include: ['node_modules']
    }
}
