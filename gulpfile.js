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
var autoprefixer = require('autoprefixer-core');
var cp = require('child_process');
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


var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};


var processors = [
  autoprefixer(AUTOPREFIXER_BROWSERS)
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
        '.tmp/terms-of-service/index.html',
        '.tmp/updates/index.html',
        '.tmp/updates/chrome-extension-for-basecamp.html',
        '.tmp/customers/cr-studios/index.html',
        '.tmp/integrations/jira/index.html'
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
        .pipe($.inlineSource())
        .pipe(gulp.dest('./.tmp'));
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

gulp.task('clean', del.bind(null, ['.tmp', 'dist/*', '!dist/.git']));
gulp.task('clean:gh-pages', del.bind(null, ['.tmp', 'gh-pages/*', '!gh-pages/.git']));





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
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('app/jekyll/images'))
    .pipe(gulp.dest('.tmp/images'))
    .pipe($.size({title: 'images'}));
});





/* ==========================================================================
   § Jekyll
   ========================================================================== */

gulp.task('jekyll', function (done) {
  browserSync.notify(messages.jekyllBuild);
  return cp.spawn('jekyll', ['build', '--config', '_config.yml,_config_dev.yml'], {stdio: 'inherit'})
          .on('close', done);
});


gulp.task('jekyll:production', function (done) {
  browserSync.notify(messages.jekyllBuild);
  return cp.spawn('jekyll', ['build', '--config', '_config.yml'], {stdio: 'inherit'})
          .on('close', done);
});


gulp.task('jekyll:gh-pages', function (done) {
  browserSync.notify(messages.jekyllBuild);
  return cp.spawn('jekyll', ['build', '--config', '_config.yml,_config_ghpages.yml'], {stdio: 'inherit'})
          .on('close', done);
});


gulp.task('jekyll:rebuild', ['jekyll'], function () {
    reload();
});





/* ==========================================================================
   § JSHINT
   ========================================================================== */

gulp.task('jshint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe(gulp.dest('.tmp/scripts'))
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
        '.php',
        /^\/roadmap-jira-addon\/(.*)/g
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
          '.php',
          /^\/roadmap-jira-addon\/(.*)/g
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
  return gulp.src('app/sass/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: [
        'bower_components'
      ]
    }))
    .pipe($.postcss(processors))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream:true}))
    .pipe(gulp.dest('app/jekyll/styles'))
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
    server: {
      baseDir: ['.tmp'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
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


/*
   §§ Serve - GH-Pages
   ========================================================================== */
gulp.task('serve:gh-pages', ['build:gh-pages'], function () {
  browserSync({
    notify: false,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: ['gh-pages'],
      routes: {
        '/roadmap-site': '.'
      }
    }
  });
});





/* ==========================================================================
   § Watch
   ========================================================================== */

/*
   §§ Watch - Default
   ========================================================================== */
gulp.task('watch', ['serve','jekyll','styles'], function () {
  gulp.watch(['app/jekyll/**/*.{html,md,markdown}'], ['jekyll:rebuild']);
  gulp.watch(['app/sass/**/*.{scss,css}'], ['styles']);
  gulp.watch(['app/scripts/**/*.js'], ['jshint']);
  gulp.watch(['app/images/**/*'], ['images']);
  gulp.watch(['.tmp/**'], reload({once: true}));
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
  runSequence('jekyll:production','styles', 'styles:cmq', ['jshint', 'images', 'fonts', 'copy'], 'assets', 'assets:inline', 'rev', cb);
});


/*
   §§ Build - GH-Pages
   ========================================================================== */
gulp.task('build:gh-pages', ['clean:gh-pages'], function (cb) {
  runSequence('jekyll:gh-pages',
              'styles',
              'styles:cmq',
              ['jshint', 'images', 'fonts', 'copy'],
              'assets',
              'assets:inline',
              'rev:gh-pages', cb);
});





/* ==========================================================================
   § Default
   ========================================================================== */

gulp.task('default', ['clean'], function () {
  gulp.start('watch');
});





// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}
