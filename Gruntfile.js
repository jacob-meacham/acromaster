'use strict';

var paths = {
  js: ['Gruntfile.js', 'server.js', 'test/**/*.js', 'config/**/*.js', 'server/**/*.js', 'public/js/**/*.js', '!public/js/client.min.js'],
  css: ['public/css/*.css', '!public/css/client.min.css']
};

module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        assets: grunt.file.readJSON('server/config/assets.json'),
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
                files: paths.js,
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            sass: {
                files: ['public/sass/**'],
                tasks: ['compass:dev'],
                options: {
                    livereload: true,
                    force: true
                }
            },
            css: {
                files: paths.css,
                tasks: ['csslint'],
                options: {
                    livereload: true
                }
            },
            mocha: {
                files: ['test/server/**/*.js', 'server/**/*.js'],
                tasks: ['env:test', 'mochaTest:dev']
            },
            
            karma: {
                files: ['test/client/**/*.spec.js', 'public/js/**/*.js'],
                tasks: ['karma:dev:run']
            }
        },

        env : {
            test : {
              NODE_ENV : 'test'
            }
        },

        open: {
          dev: {
            path: 'http://localhost:3000'
          }
        },

        jshint: {
            files: paths.js,
            options: {
                jshintrc: true
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
                    cssDir: 'public/css'
                }
            }
        },

        cssmin: {
            options: {},
            production: {
                files: ['<%= assets.client.css %>']
            }
        },

        uglify: {
            options: {},
            production: {
                files: ['<%= assets.client.js %>']
            }
        },

        csslint: {
            options: {
              csslintrc: '.csslintrc'
            },
            src: paths.css
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
                files: [
                    'public/lib/angular/angular.js',
                    'public/js/*.js',
                    'public/js/**/*.js',
                    'test/client/**/*spec.js'
                ],
                frameworks: ['mocha', 'sinon-chai'],
                browsers: ['PhantomJS'],
                reporters: ['mocha', 'coverage'],
                coverageReporter: {
                    type: 'lcov',
                    dir: 'build/coverage/client'
                },
                preprocessors: {
                    'public/js/*.js' : 'coverage',
                    'public/js/**/*.js' : 'coverage'
                },
                autoWatch: false
            },
            dev: {
                background: true,
                singleRun: false
            },
            ci: {
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
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-mocha-istanbul');

    //Default task(s).
    grunt.registerTask('default', ['jshint', 'csslint', 'karma:dev', 'concurrent', 'open:dev']);

    //Test task.
    grunt.registerTask('test', ['env:test', 'mocha_istanbul:coverage', 'karma:ci']);

    grunt.registerTask('heroku:production', ['cssmin:production', 'uglify:production']);
};
