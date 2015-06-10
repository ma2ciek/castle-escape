/* global module */
module.exports = function (grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            scripts: {
                files: ['src/**/*', 'Gruntfile.js', 'tests/unit/*'],
                tasks: ['jscs', 'concat', 'jshint:dev', 'clean:dev', 'copy:dev'],
                options: {
                    spawn: false
                }
            }
        },

        jscs: {
            src: ['src/**/*.js', 'Gruntfile.js'],
            options: {
                config: ".jscsrc",
                esnext: true,
                fix: true,
                requireSpacesInConditionalExpression: true
                //verbose: true, 
                //requireCurlyBraces: ["if"]
            }
        },

        qunit: {
            all: ['tests/unit/*.html']
        },

        clean: {
            all: [
               'bin'
            ],
            dev: [
                'dev'
            ],
            prod: [
                'prod'
            ]
        },

        concat: {
            all: {
                options: {
                    process: function (src, filepath) {
                        return '\n//#### ' + filepath + '\n' + src;
                    }
                },
                src: ['src/js/main.js', 'src/js/lib/*.js', 'src/js/classes/*.js'],
                dest: 'bin/concat.js'
            },
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'bin/concat.js',
                dest: 'prod/js/game.js'
            }
        },

        copy: {
            prod: {
                files: [{
                    cwd: 'src/img',
                    src: '**/*',
                    dest: 'prod/img',
                    expand: true
                }, {
                        cwd: 'src/audio',
                        src: '**/*',
                        dest: 'prod/audio',
                        expand: true
                    }, {
                        cwd: 'src/data',
                        src: '**/*',
                        dest: 'prod/data',
                        expand: true
                    }, {
                        cwd: 'src/style',
                        src: '**/*',
                        dest: 'prod/style',
                        expand: true
                    }, {
                        cwd: 'src/bin/html',
                        src: 'index.html',
                        dest: 'prod',
                        expand: true
                    }]
            },
            dev: {
                files: [{
                    cwd: 'src/img',
                    src: '**/*',
                    dest: 'dev/img',
                    expand: true
                }, {
                        cwd: 'src/audio',
                        src: '**/*',
                        dest: 'dev/audio',
                        expand: true
                    }, {
                        cwd: 'src/data',
                        src: '**/*',
                        dest: 'dev/data',
                        expand: true
                    }, {
                        cwd: 'src/style',
                        src: '**/*',
                        dest: 'dev/style',
                        expand: true
                    }, {
                        cwd: 'src/html',
                        src: '**/*',
                        dest: 'dev/html',
                        expand: true
                    }, {
                        cwd: 'bin',
                        src: 'concat.js',
                        dest: 'dev/js',
                        rename: function (dest) {
                            return dest + '/' + 'game.js';
                        },
                        expand: true
                    }, {
                        cwd: 'src/bin/html',
                        src: 'index.html',
                        dest: 'dev',
                        expand: true
                    }]
            }
        },

        jshint: {
            options: {
                browser: true,

                // Allow expressions such as "x && x()""
                expr: true, 

                // Automatic Semicolon Insertion
                asi: true,

                maxstatements: 15,

                maxdepth: 4,

                maxcomplexity: 10, 

                // Prohibits arguments.callee && caller
                noarg: true,

                loopfunc: true,

                unused: true,

                undef: true
            },
            prod: ['bin/concat.js'],
            dev: ['bin/concat.js', 'Gruntfile.js']
        }
    });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks("grunt-jscs");

    grunt.registerTask('prod', ['clean:prod', 'concat', 'uglify', 'jshint:prod', 'copy:prod']);
    grunt.registerTask('default', ['concat', 'jshint:dev', 'clean:dev', 'copy:dev']);
    grunt.registerTask('test', ['concat', 'qunit']);

};