'use strict';

module.exports = function(grunt) {
    // Show elapsed time after tasks run
    require('time-grunt')(grunt);
    // Load all Grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        app: {
            source: '',
            dist: '',
            baseurl: ''
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    removeEmptyAttributes: true,
                    minifyJS: true,
                    minifyCSS: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= app.dist %>/<%= app.baseurl %>',
                    src: '**/*.html',
                    dest: '<%= app.dist %>/<%= app.baseurl %>'
                }]
            }
        },
        uncss: {
          dist: {
            files: [{
              src: '<%= app.dist %>/<%= app.baseurl %>/*.html',
              dest: '<%= app.dist %>/<%= app.baseurl %>/styles/main.css'
            }]
          }
        },
        autoprefixer: {
            options: {
                browsers: ['last 3 versions']
            },
            server: {
                files: [{
                    expand: true,
                    cwd: '<%= app.source %>/<%= app.baseurl %>/styles',
                    src: '**/*.css',
                    dest: '<%= app.source %>/<%= app.baseurl %>/styles'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= app.dist %>/<%= app.baseurl %>/styles',
                    src: '**/*.css',
                    dest: '<%= app.dist %>/<%= app.baseurl %>/styles'
                }]
            }
        },
        critical: {
            dist: {
                options: {
                    base: './',
                    css: [
                        '<%= app.dist %>/<%= app.baseurl %>/styles/main.css'
                    ],
                    minify: true,
                    width: 320,
                    height: 480
                },
                files: [{
                    expand: true,
                    cwd: '<%= app.dist %>/<%= app.baseurl %>',
                    src: ['**/*.html'],
                    dest: '<%= app.dist %>/<%= app.baseurl %>'
                }]
            }
        },
        cssmin: {
            dist: {
                options: {
                    keepSpecialComments: 0,
                    check: 'gzip'
                },
                files: [{
                    expand: true,
                    cwd: '<%= app.dist %>/<%= app.baseurl %>/styles',
                    src: ['*.css'],
                    dest: '<%= app.dist %>/<%= app.baseurl %>/styles'
                }]
            }
        },
        imagemin: {
            options: {
                progressive: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= app.dist %>/<%= app.baseurl %>/images',
                    src: '**/*.{jpg,jpeg,png,gif}',
                    dest: '<%= app.dist %>/<%= app.baseurl %>/images'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= app.dist %>/<%= app.baseurl %>/images',
                    src: '**/*.svg',
                    dest: '<%= app.dist %>/<%= app.baseurl %>/images'
                }]
            }
        }
    });

    // Define Tasks
    grunt.registerTask('server', function() {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve']);
    });

    grunt.registerTask('build', [
        'imagemin',
        'svgmin',
        'uncss',
        'autoprefixer',
        'cssmin',
        //needs config 'critical',
        //needs config 'htmlmin'
    ]);

    grunt.registerTask('default', [
        'serve'
    ]);
};
