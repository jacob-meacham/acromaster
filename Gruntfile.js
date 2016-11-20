'use strict';

var paths = {
  js: ['Gruntfile.js', 'server.js', 'test/**/*.js', 'config/**/*.js', 'server/**/*.js', 'public/app/**/*.js', '!public/app/client.min.js'],
  css: ['public/assets/css/*.css', '!public/assets/css/client.min.css']
};

var testConfig = require('./server/config/config').test;

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
                files: ['public/app/**/*.html'],
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
                files: ['public/assets/sass/**'],
                tasks: ['compass:dev'],
                options: {
                    livereload: true
                }
            },
            css: {
                files: paths.css,
                tasks: ['postcss', 'csslint']
            },
            express: {
                files: ['server.js', 'server/**/*.js'],
                tasks: ['express:dev', 'env:test', 'mochaTest:dev'],
                options: {
                    spawn: false
                }
            },
            mocha: {
                files: ['test/server/**/*.js', 'server/**/*.js'],
                tasks: ['env:test', 'mochaTest:dev']
            },

            karma: {
                files: ['test/client/**/*.spec.js', 'public/app/**/*.js'],
                tasks: ['karma:dev:run']
            }
        },

        env : {
            test: {
              NODE_ENV: 'test'
            },
            dev: {
              NODE_ENV: 'development'
            }
        },

        jshint: {
            files: paths.js,
            options: {
                reporter: require('jshint-stylish'),
                jshintrc: true
            }
        },

        compass: {
            dist: {
                options: {
                    sassDir: 'public/assets/sass',
                    cssDir: 'public/assets/css',
                    environment: 'production'
                }
            },
            dev: {
                options: {
                    sassDir: 'public/assets/sass',
                    cssDir: 'public/assets/css'
                }
            }
        },

        postcss: {
            options: {
              processors: [
                require('autoprefixer')({browsers: 'last 1 version'}), // add vendor prefixes
              ]
            },
            dist: {
              src: paths.css
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

        express: {
            dev: {
                options: {
                    script: 'server.js',
                    debug: true
                }
            },

            ci: {
                options: {
                    script: 'server.js',
                    debug: false
                }
            }
        },

        karma: {
            options: {
                configFile: 'karma.conf.js'
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
                    'sinon',
                    'fieldName' /* Spurious mockgoose issue */
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

        lcovMerge: {
            options: {
                emitters: ['file', 'event'],
                outputFile: 'build/coverage/merged/lcov-merged.info'
            },
            files: ['build/coverage/client/**/*.info', 'build/coverage/server/**/*.info']
        },

        mocha_istanbul: {
            coverage: {
                src: 'test/server/**/*.spec.js',
                options: {
                    timeout: 3000,
                    coverageFolder: 'build/coverage/server',
                    reportFormats: ['lcov'],
                    check: {
                        lines: 80,
                        statements: 80
                    }
                }
            }
        },

        mochaProtractor: {
            options: {
              browsers: ['PhantomJS'],
              baseUrl: 'http://localhost:3000',
              args: '--ignore-certificate-errors',
              slow: 4000,
              timeout: 20000,
              suiteTimeout: 90000
            },
            files: ['test/e2e/**/*.spec.js']
        },

        mongoimport: {
            options: {
                db : testConfig.dbName,
                stopOnError : false,
                collections : [{
                    name : 'moves',
                    type :'json',
                    file : 'test/e2e/fixtures/db/moves.json',
                    jsonArray : true,
                    upsert : true,
                    drop : true
                  },
                  {
                    name : 'flows',
                    type : 'json',
                    file : 'test/e2e/fixtures/db/flows.json',
                    jsonArray : true,
                    upsert : true,
                    drop : true
                }]
            }
        }
    });

    grunt.event.on('coverage', function(lcov, done) {
        // Coveralls uses argv to set the basePath
        var oldArgv = process.argv[2];
        process.argv[2] = '';
        require('coveralls').handleInput(lcov, function(err) {
            process.argv[2] = oldArgv;
            if (err) {
                return done(err);
            }
            done();
        });
    });

    grunt.registerTask('mongodrop', 'drop the database', function() {
        var mongoose = require('mongoose');
        var done = this.async();
        mongoose.connect(testConfig.dbUrl, function() {
            mongoose.connection.db.dropDatabase(function(err) {
                if(err) {
                    grunt.fail.warn(err);
                } else {
                    grunt.log.ok('Successfully dropped db');
                }
                mongoose.connection.close(done);
            });
        });
    });

    // Load NPM tasks
    require('load-grunt-tasks')(grunt);

    grunt.registerTask('lint', ['jshint', 'csslint']);
    grunt.registerTask('default', ['lint', 'env:dev', 'karma:dev:start', 'express:dev', 'watch']);
    grunt.registerTask('protractor', ['env:test', 'selenium_start', 'mongoimport', 'express:ci', 'mochaProtractor']);
    grunt.registerTask('test', ['lint', 'env:test', 'mongodrop', 'mocha_istanbul:coverage', 'karma:ci', 'protractor', 'lcovMerge']);
    grunt.registerTask('build', ['compass:dist', 'postcss', 'test']);
    grunt.registerTask('heroku:production', ['cssmin:production', 'uglify:production']);
};
