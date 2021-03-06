module.exports = function (grunt) {
 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        connect: {
            server: {
                options: {
                    port: 8000,
                    hostname: 'localhost',
                    keepalive: true
                }
            }
        },
 
        clean: {
            all: ['dist', '.tmp'],
            tmp: ['.tmp']
        },

        html2js: {
            options: {
                base: 'app',
                module: 'nglist-templates',
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                }
            },
            main: {
                src: ['app/partials/ListEditor.html'],
                dest: '.tmp/templates.js'
            }
        },

        concat: {
            options: {
                separator: ';',
                process: function(src, filepath) {
                    return src.replace(/[/*<%]{4}.*[%>*/]{4}/g, '"nglist-templates",');
                }
            },

            dist: {
                src: ['.tmp/templates.js', 'app/js/nglist-editor.js'],
                dest: 'dist/nglist-editor.js'
            }
        },

        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                files: {
                   'dist/nglist-editor.min.js': ['dist/nglist-editor.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-concat');    
    grunt.loadNpmTasks('grunt-contrib-uglify');
 
    // Tell Grunt what to do when we type "grunt" into the terminal
    grunt.registerTask('build', [
        'clean:all', 'html2js', 'concat', 'uglify', 'clean:tmp'
    ]);

    grunt.registerTask('default', [
        'connect'
    ]);
};