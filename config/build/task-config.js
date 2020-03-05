/**
 * CORE ASTUTEO BUILD SYSTEM
 * Version 4.0 | Updated: 1/2020
 *
 * This file is required by Blendid. We're overriding the stylesheets
 * process completely in order to incorporate Tailwind CSS
 *
 * CONFIGURATION:
 * All file locations are relative to the project root (<pr>)
 *
 * 1: <pr>/config/build/task-config.js | This file, required by Blendid
 * 2: <pr>/config/build/path-config.json | Required by Blendid, set asset directories
 * 3: <pr>/config/build/project-config.js | Project specific settings
 * 4: <pr>/config/build/local-config.js | Your locally dev URL, copy from sample.local-config.js
 * 5: <pr>/config/build/whitelist-selectors.js | whitelist for PurgeCSS
 * 6: <pr>/.browserslistrc | Lists the browsers we support for autoprefixer
 * 7: <pr>/tailwind.js | Tailwind Style Configuration
 *
 * IN THIS FILE:
 * 1: Require modules used in custom tasks
 * 2: Astuteo Banner (added to CSS and JS in build process)
 * 3: Imagemin Config
 * 4: Astuteo's adjustments to core configuration
 *    |- 4A: Custom Stylesheets Task
 *    |- 4B: Load Webpack Config
 * 5: Additional Tasks
 *    |- 5A: Set Paths
 *    |- 5B: Compress Images
 *    |- 5C: TODO Creation
 *    |- 5E: Delete Build Assets (production only)
 *    |- 5F: Copy Non-Revved Images (production only)
 *    |- 5G: Post Build Sequence
 * 6: Task Hooks*
 */

/**
 * 1: Require modules used in custom tasks
 *
 * Most of these modules are installed and loaded by the main
 * blendid module. Otherwise they're included in our package.json
 */

const path              = require('path');
const gulpSequence      = require('gulp-sequence');
const gulp              = require('gulp');
const todo              = require('gulp-todo');
const header            = require('gulp-header');
const del               = require('del');

// To add our alternate Sass task
const browserSync       = require('browser-sync');
const postcss           = require('gulp-postcss');
const sass              = require('gulp-sass');
const gulpif            = require('gulp-if');
const sourcemaps        = require('gulp-sourcemaps');
const projectPath		= require('../../node_modules/blendid/gulpfile.js/lib/projectPath');
const handleErrors    	= require('../../node_modules/blendid/gulpfile.js/lib/handleErrors');

// PostCSS & PostCSS Plugins
const cssnano           = require('cssnano');
const autoprefixer 		= require('autoprefixer');
const colorFunctions    = require('postcss-color-function');
const postcssPresetEnv  = require('postcss-preset-env');
const tailwindcss       = require("tailwindcss");
const purgecss          = require('@fullhuman/postcss-purgecss');

// Import Astuteo and local Config and add paths
const project           = require('./project-config');
const thisJs 			= project.javascripts;
const thisInfo 			= project.info;
const thisTemplates 	= project.templates;
let localConfigUrl 		= 'http://site.test';
try {
	localConfigUrl       = require('./local-config').url;
} catch(e) {

}
const pwd = process.env.PWD;

/**
 * 1: PostCSS Configuration
 *
 */
class TailwindExtractor {
	static extract(content) {
		return content.match(/[A-Za-z0-9-_:\/]+/g) || [];
	}
}
const whitelist         = require(pwd + '/config/build/whitelist-selectors.js');
// Load and configure plugins
let postCssPlugins = [
	tailwindcss(pwd + "/" + project.tailwindconfig),
	autoprefixer(),
	postcssPresetEnv(),
	colorFunctions(),
];

// PurgeCSS runs only on production build. Configure it here:
const purgeCssConfig = {
	content: [
		pwd + '/templates/**/*.{twig,html}',
		pwd + '/src/js/**/*.{js,vue} ',
	],
	whitelist: whitelist,
	defaultExtractor: content =>
		content.match(/[\w-/:]+(?<!:)/g) || []
};

/**
 * 2: Astuteo Banner(added to CSS and JS in build process)
 *
 * Appends this banner at the top of all built JS and CSS files
 */
Date.prototype.mmddyyyy = function() {
	let mm = this.getMonth() + 1; // getMonth() is zero-based
	let dd = this.getDate();
	return [
		(mm>9 ? '' : '0') + mm,
		(dd>9 ? '' : '0') + dd,
		this.getFullYear()
	].join('');
};

let date = new Date();
date = date.mmddyyyy();

var banner = ['/**',
	' * <%= pkg.name %> - <%= pkg.description %>',
	' * @date <%= date %>',
	' * @link <%= pkg.url %>',
	' * @author <%= pkg.author %> - <%= pkg.authorUrl %>',
	' */',
	''
].join('\n');



/**
 * 4: Astuteo 's adjustments to core configuration
 *
 * This exports the settings to the Blendid 4.x package to tailor
 * the settings based on our needs
 */
module.exports = {
	html: false,
	images: true,
	fonts: true,
	static: true,
	svgSprite: false,
	ghPages: false,
	stylesheets: true,
	javascripts: thisJs,
	browserSync: {
		proxy: {
			target: localConfigUrl
		},
		files: [thisTemplates.path],
		open: false,
		ghostMode: false,
	},
	production: {
		rev: true
	},
	/**
	 * 4 A: Custom Stylesheets Task
	 *
	 * We're overriding the default behavior of the core task
	 * so heavily that we're providing an alternate task. It's largely
	 * based on 4.x's core task with the addition of PostCSS config
	 * as part of the build process to load TailwindCSS where needed.
	 *
	 * See: https://github.com/vigetlabs/blendid/wiki/Configuration#alternatetask
	 */

	stylesheets: {
		alternateTask: function(gulp, PATH_CONFIG, TASK_CONFIG) {
			return function() {
				const pwd = process.env.PWD
				const paths = {
					src: path.resolve(
						pwd,
						PATH_CONFIG.src,
						PATH_CONFIG.stylesheets.src,
						'**/*.{css,sass,scss}'
					),
					dest: path.resolve(
						pwd,
						PATH_CONFIG.dest,
						PATH_CONFIG.stylesheets.dest
					)
				}
				if (TASK_CONFIG.stylesheets.sass && TASK_CONFIG.stylesheets.sass.includePaths) {
					TASK_CONFIG.stylesheets.sass.includePaths = TASK_CONFIG.stylesheets.sass.includePaths.map(function (includePath) {
						return projectPath(includePath)
					})
				}
				const cssnanoConfig = TASK_CONFIG.stylesheets.cssnano || {};
				cssnanoConfig.autoprefixer = false;

				let preprocess = !!TASK_CONFIG.stylesheets.sass;
				if (global.production) {
					postCssPlugins.push(purgecss(purgeCssConfig));
					postCssPlugins.push(cssnano(cssnanoConfig));
				}

				return gulp
					.src(paths.src)
					.pipe(gulpif(!global.production, sourcemaps.init()))
					.pipe(gulpif(preprocess, sass(TASK_CONFIG.stylesheets.sass)))
					.on('error', handleErrors)
					.pipe(postcss(postCssPlugins))
					.on('error', handleErrors)
					.pipe(gulpif(!global.production, sourcemaps.write()))
					.pipe(gulpif(global.production, header(banner, {
						pkg: thisInfo,
						date: date
					})))
					.pipe(gulp.dest(paths.dest))
					.pipe(browserSync.stream())
			}
		}
	},

	/**
	 * 5: Additional Tasks
	 *
	 * Blendid allows us to run additional at various times in the
	 * different build process. We're leveraging that to do things like
	 * build our to-dos, add a banner, compress images
	 */
	additionalTasks: {
		initialize(gulp, PATH_CONFIG, TASK_CONFIG) {
			/**
			 * 5A: Set Paths
			 *
			 * Setting paths so it's more readable for additional tasks.
			 * Note that as of 4.x these paths are relative from where the
			 * task is running (in the node_modules folder) so we need to resolve
			 * those slightly different than accessing our config directly.
			 */
			const pathSrc = PATH_CONFIG.src;
			const pathImage = PATH_CONFIG.images.src;

			const cssPaths = {
				src: path.resolve(pwd, pathSrc, PATH_CONFIG.stylesheets.src),
				dest: path.resolve(pwd, PATH_CONFIG.dest, PATH_CONFIG.stylesheets.dest)
			};
			const jsPaths = {
				src: path.resolve(process.env.PWD, pathSrc, PATH_CONFIG.javascripts.src),
				dest: path.resolve(process.env.PWD, PATH_CONFIG.dest, PATH_CONFIG.javascripts.dest)
			};
			const imgPaths = {
				src: path.resolve(process.env.PWD, pathSrc, PATH_CONFIG.images.src),
				dest: path.resolve(process.env.PWD, PATH_CONFIG.dest, PATH_CONFIG.images.dest)
			};

			/**
			 * Image Compression
			 * * 5B: Imagemin (local dev only)
			 * Should only be run local and replace the files
			 * in the src directory that you want to use
			 * https://www.npmjs.com/package/compress-images
			 */
			const compressPath = pwd + '/' + pathSrc + '/images-compressed/';
			gulp.task('compress_images', function() {
				const compressImages 	= require('compress-images');
				//[jpg+gif+png+svg] ---to---> [jpg(webp)+gif(gifsicle)+png(webp)+svg(svgo)]
				compressImages(imgPaths.src + '/**/*.{jpg,JPG,jpeg,JPEG,gif,png,svg}', compressPath, {compress_force: false, statistic: true, autoupdate: true}, false,
					{jpg: {engine: 'webp', command: false}},
					{png: {engine: 'webp', command: false}},
					{svg: {engine: 'svgo', command: false}},
					{gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}}, function(){
						//-------------------------------------------------
						//[jpg] ---to---> [jpg(jpegtran)] WARNING!!! autoupdate  - recommended to turn this off, it's not needed here - autoupdate: false
						compressImages(imgPaths.src + '/**/*.{jpg,JPG,jpeg,JPEG}', compressPath, {compress_force: false, statistic: true, autoupdate: false}, false,
							{jpg: {engine: 'mozjpeg', command: ['-quality', '80']}},
							{png: {engine: false, command: false}},
							{svg: {engine: false, command: false}},
							{gif: {engine: false, command: false}}, function(){
								//[png] ---to---> [png(pngquant)] WARNING!!! autoupdate  - recommended to turn this off, it's not needed here - autoupdate: false
								compressImages(imgPaths.src + '/**/*.png', compressPath, {compress_force: false, statistic: true, autoupdate: false}, false,
									{jpg: {engine: false, command: false}},
									{png: {engine: 'pngquant', command: ['--quality=30-60']}},
									{svg: {engine: false, command: false}},
									{gif: {engine: false, command: false}}, function(){
									});
							});
						//-------------------------------------------------
					})
				;
			}).on('error', handleErrors);

			/**
			 * 5C: TODO Creation
			 *
			 * Add various notes to the code that will then be pulled out into markdown
			 * files for later reference. This is run only during the initial watch process
			 *
			 * Accepted tags:
			 * @TODO
			 * @FIXME
			 * @NOTE
			 * @BACKLOG
			 * @CONTENT
			 *
			 * Generated Files:
			 * todo-styles.md
			 * todo-javascript.md
			 * todo-templates
			 */

			const addTags = ['NOTE','BACKLOG','CONTENT'];
			gulp.task('todo', function (cb) {
				gulpSequence('todo-styles', 'todo-js', 'todo-templates', cb)
			})
			gulp.task('todo-js', function () {
				gulp.src(jsPaths.src + '/**/*.js', {
					base: process.env.PWD
				})
					.pipe(todo({
						skipUnsupported: true,
						customTags: addTags,
						fileName: 'todo-javascript.md'
					}))
					.pipe(gulp.dest(process.env.PWD));
			})
			gulp.task('todo-styles', function () {
				gulp.src(cssPaths.src + '/**/*.scss', {
					base: process.env.PWD
				})
					.pipe(todo({
						skipUnsupported: true,
						customTags: addTags,
						fileName: 'todo-styles.md'
					}))
					.pipe(gulp.dest(process.env.PWD));
			})

			gulp.task('todo-templates', function () {
				gulp.src(process.env.PWD + '/templates/**/*.twig', {
					base: process.env.PWD
				})
					.pipe(todo({
						skipUnsupported: true,
						customTags: addTags,
						fileName: 'todo-templates.md'
					}))
					.pipe(gulp.dest(process.env.PWD));
			});




			/**
			 * 5E: Delete Build Assets(production only)
			 *
			 * Fixes a bug where occasionally the production build will fail
			 * to delete no longer existing files by preemptively clearing the
			 * folders before the prod task
			 */
			gulp.task('flush-assets', function(){
				del.sync([jsPaths.dest + '/**', cssPaths.dest + '/**', imgPaths.dest + '/**'], {
					force: true
				});
			});

			/**
			 * 5F: Copy Non - Revved Images(production only)
			 *
			 * This task is only needed to support images that are embedded
			 * directly into the templates and not updated according to the
			 * rev-manifest.json file
			 */
			gulp.task('copy-images', function () {
				gulp.src(imgPaths.src + '/**/*.**')
					.pipe(gulp.dest(imgPaths.dest));
			});

			/**
			 * 5G: Post Build Sequence
			 *
			 * Sequence of custom tasks to run after the production build
			 * process. NOTE: This doesn't always seem to run exactly at
			 * the end, particularly around knowing exactly where the files
			 * are in the file system. If you have a task that expects that
			 * you may run into issues.
			 */
			gulp.task('astuteoPostBuild', function (cb) {
				gulpSequence('copy-images', cb)
			});

		},

		/**
		 * 6: Task Hooks
		 *
		 * Timing hooks provided by Blendid to run our additional tasks at
		 * a specific time. NOTE: Postbuild doesn't always run exactly at the
		 * end particularly in regards to where the files live in the filesystem.
		 */
		development: {
			prebuild: ['todo'],
			postbuild: false
		},
		production: {
			prebuild: ['flush-assets'],
			postbuild: ['astuteoPostBuild']
		}
	}
};
