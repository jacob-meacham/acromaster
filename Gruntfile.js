'use strict';

module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            jade: {
                files: ['server/views/**'],
                options: {
                    livereload: true
                }
            },
            html: {
                files: ['public/partials/**'],
                options: {
                    livereload: true
                }
            },
            js: {
                files: ['Gruntfile.js', 'server.js', 'server/**/*.js', 'public/js/**', 'test/**/*.js'],
                tasks: ['jshint'],
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
                tasks: ['karma:dev:run']
            },
            mocha: {
                files: ['test/server/**/*.js', 'server/**/*.js'],
                tasks: ['mochaTest:dev']
            }
        },
        open: {
          server: {
            url: 'http://localhost:3000'
          }
        },
        jshint: {
            files: ['gruntfile.js', 'app.js', 'server.js', 'test/**/*.js', 'config/**/*.js', 'server/**/*.js', 'public/js/**/*.js'],
            options: {
                jshintrc: true,
                ignores: ['test/server/coverageRunner.js']
            }
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
                    cssDir: 'public/css',
                    debugInfo: true
                }
            }
        },
        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    ignore: ['README.md', 'node_modules/**', 'test/**'],
                    debug: true,
                    delay: 1,
                }
            }
        },
        concurrent: {
            tasks: ['nodemon:dev', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        },
        karma: {
            options: {
                files: ['test/client/**/*.js'],
            },
            dev: {
                background: true,
                browsers: ['PhantomJS'],
                reporters: ['dots, coverage'],
                coverageReporter: {
                    type: 'html',
                    dir: 'build/coverage/client'
                },
                preprocessors: {
                    'public/js/**/*.js' : 'coverage'
                }
            },
            ci: {
                reporters: ['dots'],
                browsers: ['PhantomJS'],
                background: false,
                singleRun: true
            }
        },
        mochaTest: {
            options: {
                globals: [
                    'should',
                    'sinon'
                ],
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'spec'
            },
            dev: {
                src: ['test/server/**/*.spec.js'],
            }
        },
        mocha_istanbul: {
            coverage: {
                src: 'test/server/**/*.spec.js',
                options: {
                    coverageFolder: 'build/coverage',
                    coverage: true,
                    reportFormats: ['lcov'],
                    check: {
                        lines: 59,
                        statements: 58
                    }
                }
            }
        },
    });

    grunt.event.on('coverage', function(lcov, done){
        require('coveralls').handleInput(lcov, function(err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    //Load NPM tasks 
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-mocha-istanbul');

    //Default task(s).
    grunt.registerTask('default', ['jshint', 'compass:dev', 'karma:dev', 'concurrent']);

    //Test task.
    grunt.registerTask('test', ['mocha_istanbul:coverage'/*, 'karma:ci'*/]);
};
