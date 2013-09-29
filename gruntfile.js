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
            all: ['Gruntfile.js', 'test/**/*.js', 'config/**/*.js', 'app/**/*.js']
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
                    watchedFolders: ['server', 'config'],
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
            options: {
                files: ['test/client/**/*.js'],
            },
            dev: {
                background: true,

                browsers: ['Chrome'],

                plugins : ['karma-chrome-launcher']
            },
            ci: {
                singleRun: true
            }
        },
        mochaTest: {
            dev: {
                src: ['test/server/**/*.js'],
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
    grunt.registerTask('default', ['jshint', 'compass:dev', 'karma:dev', 'concurrent']);

    //Test task.
    grunt.registerTask('test', ['mochaTest:dev', 'karma:ci']);
};
