module.exports = function(grunt) {
    'use strict';
    require('load-grunt-tasks')(grunt); // Load all Grunt tasks from package.json

    // Project configuration.
    grunt.initConfig({
        config: {
            clientlib: './src/main/content/jcr_root/etc/designs/cedarssinai/clientlib-site',
            feddist: './src/main/content/jcr_root/etc/designs/cedarssinai/fed-build',
        },

        pkg: grunt.file.readJSON('package.json'),

        eslint: {
            // http://eslint.org/docs/rules/
            target: ['<%= config.clientlib %>/**/*.js']
        },

        sasslint: {
            // https://github.com/sasstools/sass-lint/tree/master/docs/rules
            target: ['<%= config.clientlib %>/**/*.scss']
        },

        clean: [
            '<%= config.clientlib %>/.tmp',
            '<%= config.feddist %>'
        ],

        sass: {
            options: {
                style: 'expanded',
                sourceMap: true,
                includePaths: [
                    '<%= config.clientlib %>/scss/',
                    './node_modules/'
                ]
            },
            build: {
                files: { // 'destination': 'source'
                    '<%= config.feddist %>/main.css': '<%= config.clientlib %>/scss/main.scss',
                }
            }
        },

        postcss: {
            options: {
                map: true,
                processors: [
                    require('autoprefixer')({browsers: ['last 2 versions']})
                ]
            },
            dist: {
                src: '<%= config.feddist %>/main.css'
            }
        },

        copy: {
            assets: {
                files: [{
                    expand: true,
                    cwd: '<%= config.clientlib %>/',
                    src: ['{fonts,images}/**/*'],
                    dest: '<%= config.feddist %>/'
                }]
            },

            js: {
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: '<%= config.clientlib %>/js/',
                    src: ['**/*'],
                    dest: '<%= config.feddist %>/'
                }]
            },

            vendor: {
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: './node_modules/',
                    src: [
                        'jquery/dist/jquery.min.js'
                    ],
                    dest: '<%= config.feddist %>/'
                }]
            },

            aemCss: {
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: '<%= config.feddist %>/',
                    src: ['main.css', 'main.css.map'],
                    dest: '<%= config.clientlib %>/css/'
                }]
            }
        },

        assemble: {
            options: {
                assets: '<%= config.feddist %>',
                data: '<%= config.clientlib %>/json/*.json',
                flatten: true,
                layout: 'default.hbs',
                layoutdir: '<%= config.clientlib %>/templates/layouts',
                partials: '<%= config.clientlib %>/templates/partials/**/*.hbs'
            },

            build: {
                files: [{'<%= config.feddist %>/': ['<%= config.clientlib %>/templates/*.hbs']}]
            }
        },

        watch: {
            images: {
                files: '<%= config.clientlib %>/images/**/*',
                tasks: ['copy:assets']
            },
            scss: {
                files: '<%= config.clientlib %>/**/*.scss',
                tasks: ['concurrent:scssWatch']
            },
            js: {
                files: '<%= config.clientlib %>/**/*.{json,js}',
                tasks: ['concurrent:jsWatch']
            },
            assemble: {
                files: '<%= config.clientlib %>/templates/**/**/*.hbs',
                tasks: ['assemble:build']
            }
        },

        concurrent: {
            scssWatch: ['sasslint', ['sass:build', 'postcss']],
            jsWatch: ['eslint', ['copy:js']]
        },

        browserSync: {
            serve: {
                bsFiles: { src: [ '<%= config.feddist %>/**.*' ] },
                options: {
                    watchTask: true,
                    server: '<%= config.feddist %>',
                    browser: ["google chrome"],
                    // tunnel: true,
                    open: 'local',
                    notify: false,
                    ghostMode: {
                        clicks: true,
                        forms: true,
                        scroll: true
                    }
                }
            }
        }
    });

    // Task definitions
    grunt.registerTask('lint', ['sasslint', 'eslint']);
    grunt.registerTask('copyFed', ['copy:assets', 'copy:js', 'copy:vendor']);
    grunt.registerTask('build', ['clean', 'copyFed', 'sass', 'postcss', 'assemble']);
    grunt.registerTask('serve', ['lint', 'build', 'browserSync', 'watch']);

    grunt.registerTask('aemBuild', ['build', 'copy:aemCss']); // 'lint',
    grunt.registerTask('default', ['aemBuild']);
};
