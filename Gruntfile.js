module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['jshint'],
                options: {
                    spawn: false,
                },
            },
        },

        clean: {
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
                    process: function(src, filepath) {
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
                dest: 'dev/js/game.js'
            }
        },

        copy: {
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
                    cwd: 'src/bin/html',
                    src: 'index.html',
                    dest: 'dev',
                    expand: true
                }]
            },
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
                    cwd: 'bin',
                    src: 'concat.js',
                    dest: 'prod/js',
                    rename: function(dest, src) {
                        return dest + '/' + 'game.js';
                    },
                    expand: true
                }, {
                    cwd: 'src/bin/html',
                    src: 'index.html',
                    dest: 'prod',
                    expand: true
                }]
            }
        },

        jshint: {
            options: {
                '-W030': true, // expr.: x && x()
                'asi': true, // Automatic Semicolon Insertion
                'maxstatements': 20, // Max statements per functions
                'es5': true,

            },
            prod: ['bin/concat.js'],
            dev: ['bin/concat.js']
        }
    });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('dev', ['clean:dev', 'concat', 'uglify', 'jshint:dev', 'copy:dev']);
    grunt.registerTask('default', ['concat', 'jshint:prod', 'clean:prod', 'copy:prod'])
    grunt.registerTask('trywatch', ['watch'])
};