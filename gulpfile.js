/**
 *
 *  Web Starter Kit
 *  Copyright 2014 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var reload = browserSync.reload;

var AUTOPREFIXER_BROWSERS = [
  'ie >= 8',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// Optimize Images
gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'images'}));
});

// Copy All Files At The Root Level (app)
gulp.task('copy', function () {
  return gulp.src([
    '.tmp/*',
    '!.tmp/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}));
});

// Copy Web Fonts To Dist
gulp.task('fonts', function () {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size({title: 'fonts'}));
});


// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function () {
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
      'app/styles/*.scss',
      'app/styles/**/*.css'
    ])
    .pipe($.plumber())
    .pipe($.changed('styles', {extension: '.scss'}))
    .pipe($.rubySass({
        style: 'expanded',
        precision: 10,
        compass: true
      })
      .on('error', console.error.bind(console))
    )
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe($.size({title: 'styles'}));
});


gulp.task('cmq', function () {
  gulp.src('./dist/styles/*.css')
    .pipe($.combineMediaQueries({
          log: true
    }))
    // Concatenate And Minify Styles
    .pipe($.csso())
    .pipe(gulp.dest('dist/styles'))
    .pipe($.size({title: 'Media Queries'}));
});


// Scan Your HTML For Assets & Optimize Them

gulp.task('html' ,function () {
  var assets = $.useref.assets({searchPath: '.tmp'});

  return gulp.src('.tmp/**/*.html')
    .pipe(assets)
    // Concatenate And Minify JavaScript
    .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
    // Remove Any Unused CSS
    // Note: If not using the Style Guide, you can delete it from
    // the next line to only include styles your project uses.
    .pipe($.if('*.css', $.uncss({
      html: [
        '.tmp/index.html',
        '.tmp/sign-up/index.html',
        '.tmp/privacy-policy/index.html',
        '.tmp/plans-pricing/index.html',
        '.tmp/terms-of-service/index.html'
      ],
      // CSS Selectors for UnCSS to ignore
      ignore: [
        /.navdrawer-container.open/,
        /.app-bar.open/,
        /.ibutton-*/,
        /#header/
      ]
    })))
    // Concatenate And Minify Styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    // Update Production Style Guide Paths
    //.pipe($.replace('components/components.css', 'components/main.min.css'))
    // Minify Any HTML
    .pipe($.if('*.html', $.minifyHtml()))
    // Output Files
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'html'}));
});


gulp.task('html:inline', function () {
    return gulp.src('./.tmp/**/*.html')
        .pipe($.inlineSource('./app'))
        .pipe(gulp.dest('./dist'));
});


gulp.task('html:jekyll', function () {
    gulp.src(['./app/index.html', './app/_layouts/*.html', './app/_posts/*.{markdown,md}', './app/_customers/*.{markdown,md}'])
        .pipe($.plumber())
        .pipe($.jekyll({
            source: './app',
            destination: './.tmp/',
            config: '_config.yml',
            bundleExec: true
        }))
        .on('error', console.error.bind(console))
        .pipe(gulp.dest('./dist/'));
});


// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist/*', '!dist/.git']));

gulp.task('serve', function () {
  browserSync({
    notify: false,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', 'app']
  });
});

// Watch Files For Changes & Reload
gulp.task('watch', ['serve','html:jekyll','styles'], function () {



  gulp.watch(['app/**/*.html'], ['html:jekyll', 'styles']);
  gulp.watch(['app/**/*.{html,md,markdown}'], ['html:jekyll', 'styles']);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles']);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['hologram']);
  gulp.watch(['app/scripts/**/*.js'], ['jshint']);
  gulp.watch(['app/images/**/*'], reload);
  gulp.watch(['.tmp/**'], reload({once: true}));
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
  browserSync({
    notify: false,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist'
  });
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  runSequence('html:jekyll','styles', 'hologram',['html', 'jshint', 'images', 'fonts', 'copy'], 'html:inline', 'cmq', cb);
});

// Run PageSpeed Insights
// Update `url` below to the public URL for your site
gulp.task('pagespeed', pagespeed.bind(null, {
  // By default, we use the PageSpeed Insights
  // free (no API key) tier. You can use a Google
  // Developer API key if you have one. See
  // http://goo.gl/RkN0vE for info key: 'YOUR_API_KEY'
  url: 'http://getroadmap.github.io/roadmap-site/',
  strategy: 'mobile'
}));

gulp.task('bump:major', function () {
  gulp.src(['./package.json'])
    .pipe($.bump({type:'major'}))
    .pipe(gulp.dest('./'));
});

gulp.task('bump:minor', function () {
  gulp.src(['./bower.json', './package.json'])
    .pipe($.bump({type:'minor'}))
    .pipe(gulp.dest('./'));
});

gulp.task('bump:patch', function () {
  gulp.src(['./bower.json', './package.json'])
    .pipe($.bump({type:'patch'}))
    .pipe(gulp.dest('./'));
});

gulp.task('hologram', function () {
  gulp.src('hologram/hologram_config.yml')
    .pipe($.hologram({bundler:true, logging:true}));
});

gulp.task('watch:hologram', ['serve', 'styles', 'hologram'], function () {
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles']);
  gulp.watch(['.tmp/styles/**/*.{scss,css}'], ['hologram']);
});

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}
