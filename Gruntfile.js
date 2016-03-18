/*global module*/
module.exports = function (grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.initConfig({
        connect: {
            server: {
                options: {
                    directory: '.',
                    keepalive: true
                }
            }
        },
        jasmine_node: {
            projectRoot: 'lib/',
            specFolders: [
                'tests/'
            ]
        },
        jslint: {
            all: {
                src: [
                    'Gruntfile.js',
                    'lib/**/*.js',
                    'package.json',
                    'tests/**/*.js'
                ],
                options: {
                    errorsOnly: true
                }
            }
        }
    });

    grunt.registerTask("default", [
        "jslint"
    ]);
    grunt.registerTask("test", [
        "default",
        "jasmine_node"
    ]);
};
