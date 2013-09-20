module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            jade: {
                files: ['app/views/**'],
                options: {
                    livereload: true
                }
            },
            html: {
                files: ['public/views/**'],
                options: {
                    livereload: true
                }
            },
            js: {
                files: ['public/js/**'],
                options: {
                    livereload: true
                }
            },
            css: {
                files: ['public/sass/**'],
                tasks: ['compass:dev'],
                options: {
                    livereload: true,
                    force: true
                }
            },
            karma: {
                files: ['public/lib/angular/angular.js', 'public/lib/angular/angular-*.js', 'test/lib/angular/angular-mocks.js','test/unit/**/*.js'],
                tasks: ['karma:unit:run']
            },
            mocha: {
                files: ['test/**/*.js'],
                tasks: ['mocha:dev']
            }
        },
        jshint: {
            all: ['gruntfile.js']
        },
        compass: {
            dist: {
                options: {
                    sassDir: 'public/sass',
                    cssDir: 'public/css',
                    environment: 'production'
                }
            },
            dev: {
                options: {
                    sassDir: 'public/sass',
                    cssDir: 'public/css'
                }
            }
        },
        nodemon: {
            dev: {
                options: {
                    file: 'server.js',
                    args: [],
                    ignoredFiles: ['README.md', 'node_modules/**', '.DS_Store'],
                    watchedExtensions: ['js'],
                    watchedFolders: ['app', 'config'],
                    debug: true,
                    delayTime: 1,
                    env: {
                        PORT: 3000
                    },
                    cwd: __dirname
                }
            }
        },
        concurrent: {
            tasks: ['nodemon', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        },
        karma: {
            unit: {
                background: true,
                files: [
                  'public/lib/angular/angular.js',
                  'public/lib/angular/angular-*.js',
                  'test/lib/angular/angular-mocks.js',
                  'public/js/**/*.js',
                ],

                frameworks: ['mocha'],
                browsers: ['Chrome'],

                plugins : [
                    'karma-junit-reporter',
                    'karma-chrome-launcher',
                    'karma-mocha'
                    ],

                junitReporter : {
                    outputFile: 'build/test-out/unit.xml',
                    suite: 'unit'
                }
            }
        },
        mocha: {
            dev: {
                src: ['test/**/*.js'],
                options: {
                    reporter: 'spec',
                    slow: 200,
                    timeout: 1000
                }
            }
        },
    });

    //Load NPM tasks 
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-karma');
    

    //Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    //Default task(s).
    grunt.registerTask('default', ['jshint', 'compass:dev', 'karma:unit', 'concurrent']);

    //Test task.
    grunt.registerTask('test', ['mocha:dev']);
};
