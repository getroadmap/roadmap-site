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





/* ==========================================================================
   § Gulp Tools
   ========================================================================== */

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var reload = browserSync.reload;
var path = require('path');





/* ==========================================================================
   § Gulp Variables
   ========================================================================== */

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





/* ==========================================================================
   § Assets
   ========================================================================== */

gulp.task('assets' ,function () {
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
        // for mobile
        /video, embed, object, img, picture/,
        /img/,
        // application styles
        /.app-bar.open/,
        /.ibutton-*/,
        /#header/,

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
    // Output Files
    .pipe(gulp.dest('.tmp'))
    .pipe($.size({title: 'html'}));
});


/*
   §§ Assets - Inline
   ========================================================================== */

gulp.task('assets:inline', function () {
    return gulp.src('./.tmp/**/*.html')
        .pipe($.inlineSource('./app'))
        .pipe(gulp.dest('./dist'));
});





/* ==========================================================================
   § Bump Versions
   ========================================================================== */

/*
   §§ Bump Major
   ========================================================================== */

gulp.task('bump:major', function () {
  gulp.src(['./package.json'])
    .pipe($.bump({type:'major'}))
    .pipe(gulp.dest('./'));
});


/*
   §§ Bump Minor
   ========================================================================== */

gulp.task('bump:minor', function () {
  gulp.src(['./bower.json', './package.json'])
    .pipe($.bump({type:'minor'}))
    .pipe(gulp.dest('./'));
});


/*
   §§ Bump Patch
   ========================================================================== */

gulp.task('bump:patch', function () {
  gulp.src(['./bower.json', './package.json'])
    .pipe($.bump({type:'patch'}))
    .pipe(gulp.dest('./'));
});





/* ==========================================================================
   § Clean
   ========================================================================== */

gulp.task('clean', del.bind(null, ['.tmp', 'dist/*', '!dist/.git', 'gh-pages/*', '!gh-pages/.git']));





/* ==========================================================================
   § Copy
   ========================================================================== */

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





/* ==========================================================================
   § Fonts
   ========================================================================== */

gulp.task('fonts', function () {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size({title: 'fonts'}));
});





/* ==========================================================================
   § Hologram
   ========================================================================== */

gulp.task('hologram', function () {
  gulp.src('hologram/hologram_config.yml')
    .pipe($.hologram({bundler:true, logging:true}));
});





/* ==========================================================================
   § Images
   ========================================================================== */

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('.tmp/images'))
    .pipe($.size({title: 'images'}));
});





/* ==========================================================================
   § Jekyll
   ========================================================================== */

gulp.task('jekyll', function () {
  gulp.src(['./app/index.html', './app/_layouts/*.html', './app/_posts/*.{markdown,md}', './app/_customers/*.{markdown,md}'])
    .pipe($.plumber())
    .pipe($.jekyll({
        source: './app',
        destination: './.tmp/',
        config: '_config.yml',
        bundleExec: true
    }))
    .on('error', console.error.bind(console))
});





/* ==========================================================================
   § JSHINT
   ========================================================================== */

gulp.task('jshint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});





/* ==========================================================================
   § Pagespeed
     Run PageSpeed Insights
     Update `url` below to the public URL for your site
   ========================================================================== */

gulp.task('pagespeed', pagespeed.bind(null, {
  // By default, we use the PageSpeed Insights
  // free (no API key) tier. You can use a Google
  // Developer API key if you have one. See
  // http://goo.gl/RkN0vE for info key: 'YOUR_API_KEY'
  url: 'http://getroadmap.github.io/roadmap-site/',
  strategy: 'mobile'
}));





/* ==========================================================================
   § Rev
   ========================================================================== */

/*
   §§ Rev - Default
   ========================================================================== */

gulp.task('rev', function () {
  return gulp.src(['.tmp/**', ])
    .pipe($.revAll({
      base: '.tmp/',
      ignore: [
        /^\/favicon.ico$/g,
        '.html',
        '.php'
      ],
    }))
    .pipe(gulp.dest('dist'));
});


/*
   §§ Rev - GH-Pages
   ========================================================================== */
gulp.task('rev:gh-pages', function () {
  return gulp.src(['.tmp/**', ])
    .pipe($.revAll({
        ignore: [
          /^\/favicon.ico$/g,
          '.html',
          '.php'
        ],
        transformFilename: function (file, hash) {
          var ext = path.extname(file.path);
          return path.basename(file.path, ext) + ext; // no transform
        },
        prefix: '/roadmap-site/'
    }))
    .pipe(gulp.dest('gh-pages'));
});




/* ==========================================================================
   § Styles
   ========================================================================== */

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





/*
   §§ Styles - Combine Media Queries
   ========================================================================== */

gulp.task('styles:cmq', function () {
  gulp.src('./dist/styles/*.css')
    .pipe($.combineMediaQueries({
          log: true
    }))
    // Concatenate And Minify Styles
    .pipe($.csso())
    .pipe(gulp.dest('dist/styles'))
    .pipe($.size({title: 'Media Queries'}));
});





/* ==========================================================================
   § Serve
   ========================================================================== */

/*
   §§ Serve - Default
   ========================================================================== */
gulp.task('serve', ['jekyll', 'styles'], function () {
  browserSync({
    notify: false,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', 'app']
  });
});

/*
   §§ Serve - Dist
   ========================================================================== */
gulp.task('serve:dist', ['build'], function () {
  browserSync({
    notify: false,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['dist']
  });
});





/* ==========================================================================
   § Watch
   ========================================================================== */

/*
   §§ Watch - Default
   ========================================================================== */
gulp.task('watch', ['serve','jekyll','styles'], function () {
  gulp.watch(['app/**/*.html'], ['jekyll', 'styles']);
  gulp.watch(['app/**/*.{html,md,markdown}'], ['jekyll', 'styles']);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles']);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['hologram']);
  gulp.watch(['app/scripts/**/*.js'], ['jshint']);
  gulp.watch(['app/images/**/*'], reload);
  gulp.watch(['.tmp/**'], reload);
});


/*
   §§ Watch - Hologram
   ========================================================================== */

gulp.task('watch:hologram', ['serve', 'styles', 'hologram'], function () {
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles']);
  gulp.watch(['.tmp/styles/**/*.{scss,css}'], ['hologram']);
});





/* ==========================================================================
   § Build
   ========================================================================== */

/*
   §§ Build - Default
   ========================================================================== */
gulp.task('build', ['clean'], function (cb) {
  runSequence('jekyll','styles', 'styles:cmq', 'hologram', ['jshint', 'images', 'fonts', 'copy'], 'assets', 'assets:inline', 'rev', cb);
});


/*
   §§ Build - GH-Pages
   ========================================================================== */
gulp.task('build:gh-pages', ['clean'], function (cb) {
  runSequence('jekyll','styles', 'styles:cmq', 'hologram', ['jshint', 'images', 'fonts', 'copy'], 'assets', 'assets:inline', 'rev:gh-pages', cb);
});





/* ==========================================================================
   § Default
   ========================================================================== */

gulp.task('default', ['clean'], function () {
  gulp.start('watch');
});





// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}
