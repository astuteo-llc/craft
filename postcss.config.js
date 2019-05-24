/**
 * POSTCSS Config
 *
 * External configuration for PostCSS that is read in
 * by the PostCSS task by our Blendid build process
 */

const tailwindcss       = require("tailwindcss");
const purgecss          = require('@fullhuman/postcss-purgecss');
const cssnano           = require('cssnano');
const colorFunctions    = require('postcss-color-function');
const postcssPresetEnv  = require('postcss-preset-env');
const pathConfig        = require('./config/build/path-config');
const whitelist         = require('./config/build/whitelist-selectors');

class TailwindExtractor {
    static extract(content) {
        return content.match(/[A-Za-z0-9-_:\/]+/g) || [];
    }
}

module.exports = ({ file, options, env }) => {
    let jPath = './../../src/' + pathConfig.javascripts.src;
    let tPath = './../../' + pathConfig.templates;
    //
    // If we on production extract only the
    // classes we're using and compress it
    //
    if (global.production === true) {
        return {
            plugins: [
                tailwindcss("./../../tailwind.config.js"),
                purgecss({
                    content: [
                        tPath + '/**/*.{twig,html}',
                        jPath + '/**/*.{js,vue} ',
                        'http://pjpower.test/'
                    ],
                    whitelist: whitelist,
                    extractors: [
                        {
                            extractor: TailwindExtractor,
                            extensions: ['twig','js','html','vue']
                        }
                    ]
                }),
                colorFunctions(),
                postcssPresetEnv(),
                cssnano()
            ]
        }
    } else {
        return {
            plugins: [
                tailwindcss("./../../tailwind.config.js"),
                colorFunctions(),
                postcssPresetEnv()
            ]
        }
    }
};
