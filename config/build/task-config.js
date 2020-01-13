/**
 * CORE ASTUTEO BUILD SYSTEM
 * Version 3.1 | Updated: 1/2020
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
 *    |- 5B: Imagemin (production only)
 *    |- 5C: TODO Creation
 *    |- 5E: Delete Build Assets (production only)
 *    |- 5F: Copy Non-Revved Images (production only)
 *    |- 5G: Post Build Sequence
 *    |- 5H: Clear Image Compress Cache
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
const cache             = require('gulp-cache');
const del               = require('del');

// image optimizations
const imagemin          = require('gulp-imagemin');
const imageminPngquant  = require('imagemin-pngquant');
const imageminZopfli    = require('imagemin-zopfli');
const imageminMozjpeg   = require('imagemin-mozjpeg'); //need to run 'brew install libpng'
const imageminGiflossy  = require('imagemin-giflossy');

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
const whitelist         = require(pwd + '/config/build/whitelist-selectors');
// Load and configure plugins
let postCssPlugins = [
	tailwindcss(pwd + "/" + project.tailwindconfig),
	autoprefixer({
		grid: "autoplace"
	}),
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
	extractors: [
		{
			extractor: TailwindExtractor,
			extensions: ['twig','js','html','vue']
		}
	]
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
 * 3: Imagemin Config
 *
 * Optimized settings for image compression task. The settings
 * are more intensive than our previous build systems so the first
 * run will take awhile but is later cached locally by the task.
 */
const imageMinConfig = [
	//png
	imageminPngquant({
		speed: 1,
		quality: 98 //lossy settings
	}),
	imageminZopfli({
		more: true
		// iterations: 50 // very slow but more effective
	}),
	//gif
	imageminGiflossy({
		optimizationLevel: 3,
		optimize: 3, //keep-empty: Preserve empty transparent frames
		lossy: 2
	}),
	//svg
	imagemin.svgo({
		plugins: [{
			removeViewBox: false
		}]
	}),
	//jpg lossless
	imagemin.jpegtran({
		progressive: true
	}),
	//jpg very light lossy, use vs jpegtran
	imageminMozjpeg({
		quality: 90
	})
];

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
	static: false,
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
					postCssPlugins.push(cssnano(cssnanoConfig));
					postCssPlugins.push(purgecss(purgeCssConfig));
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
			const paths = {
				src: path.resolve(process.env.PWD, PATH_CONFIG.dest, PATH_CONFIG.images.dest),
				dest: path.resolve(process.env.PWD, PATH_CONFIG.dest, PATH_CONFIG.images.dest)
			};
			const cssPaths = {
				src: path.resolve(pwd, PATH_CONFIG.src, PATH_CONFIG.stylesheets.src),
				dest: path.resolve(pwd, PATH_CONFIG.dest, PATH_CONFIG.stylesheets.dest)
			};
			const jsPaths = {
				src: path.resolve(process.env.PWD, PATH_CONFIG.src, PATH_CONFIG.javascripts.src),
				dest: path.resolve(process.env.PWD, PATH_CONFIG.dest, PATH_CONFIG.javascripts.dest)
			};
			const imgPaths = {
				src: path.resolve(process.env.PWD, PATH_CONFIG.src, PATH_CONFIG.images.src),
				dest: path.resolve(process.env.PWD, PATH_CONFIG.dest, PATH_CONFIG.images.dest)
			};

			/**
			 * 5B: Imagemin(production only)
			 *
			 * The task that compresses all the images in the public assets folder.
			 * The configuration for this task can be found in section 3. Compared to
			 * past image tasks this one is much more thorough and the initial run may
			 * take a few minutes. We're additionally loading the cache module that should
			 * make subsequent runs much faster.
			 */
			gulp.task('image-min', function () {
				console.log('IF YOU ARE running this uncached it may take a few minutes');
				gulp.src(paths.src + '/**/*.{gif,png,jpg,svg}')
					.pipe(cache(imagemin(imageMinConfig)))
					.pipe(gulp.dest(paths.dest));
			})

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
			 * 5G: Post Build Sequence
			 *
			 * Sequence of custom tasks to run after the production build
			 * process. NOTE: This doesn't always seem to run exactly at
			 * the end, particularly around knowing exactly where the files
			 * are in the file system. If you have a task that expects that
			 * you may run into issues.
			 */
			gulp.task('astuteoPostBuild', function (cb) {
				gulpSequence('stylesheets', cb)
			});

			/**
			 * 5H: Clear Image Compress Cache
			 *
			 * A helper task to run directly in the scenario that you're
			 * running into oddities with production image compression
			 * NOTE: Once you run this you can expect the image compression
			 * task to take a long time on the next prod run.
			 */
			gulp.task('clear', function (cb) {
				cache.clearAll()
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
			postbuild: false
		}
	}
};
