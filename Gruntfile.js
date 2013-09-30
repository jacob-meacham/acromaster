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
                tasks: ['karma:dev:run']
            },
            mocha: {
                files: ['test/server/**/*.js', 'server/**/*.js'],
                tasks: ['mochaTest:dev']
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'test/**/*.js', 'config/**/*.js', 'app/**/*.js'],
            options: {
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
                options: {
                    file: 'server.js',
                    ignoredFiles: ['README.md', 'node_modules/**'],
                    watchedExtensions: ['js'],
                    debug: true,
                    delayTime: 1,
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
                browsers: ['Chrome'],
                plugins : ['karma-chrome-launcher'],
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
    });

    //Load NPM tasks 
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('mochaCoverage', 'Run server mocha coverage.', function () {
        var done = this.async();

        var path = './test/server/coverageRunner.js';

        var options = {
            cmd: 'node',
            grunt: false,
            args: [
                'node_modules/istanbul/lib/cli.js', // Have to pass in the actual cli, otherwise we assume a global istanbul.
                'cover',
                '--default-excludes',
                '-x', 'public/**',
                '--report', 'lcov',
                '--dir', './build/coverage/server',
                path
            ],
            opts: {
                // preserve colors for stdout in terminal
                stdio: 'inherit',
            },
        };

        function doneFunction(error, result, code) {
            if (result && result.stderr) {
                process.stderr.write(result.stderr);
            }

            if (result && result.stdout) {
                grunt.log.writeln(result.stdout);
            }

            // abort tasks in queue if there's an error
            done(error);
        }

        grunt.util.spawn(options, doneFunction);
    });

    //Default task(s).
    grunt.registerTask('default', ['jshint', 'compass:dev', 'karma:dev', 'concurrent']);

    //Test task.
    grunt.registerTask('test', ['mochaCoverage', 'karma:ci']);
};
