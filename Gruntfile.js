/*jshint node:true, quotmark:single */
'use strict';

module.exports = function (grunt) {

    grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		qunit: {
			all: 'test/test.html'
		},
		jshint: {
			options: {
				jshintrc: true
			},
			grunt: 'Gruntfile.js',
			source: 'src/**/*.js',
			tests: 'test/**/*.js'
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> v<%= pkg.version %> | <%= pkg.license %> */\n'
			},
			build: {
				files: {
					'build/jquery.rest-<%= pkg.version %>.min.js': 'src/jquery.rest.js'
				}
			}
		},
		compare_size: {
			files: [
				'build/jquery.rest-<%= pkg.version %>.min.js',
				'src/jquery.rest.js'
			],
			options: {
				compress: {
					gz: function (fileContents) {
						return require('gzip-js').zip(fileContents, {}).length;
					}
				}
			}
		},
		connect: {
			saucelabs: {
				options: {
					port: 8980,
					base: ['.', 'test']
				}
			},
			tests: {
				options: {
					port: 8981,
					base: ['.', 'test'],
					open: 'http://127.0.0.1:8981',
					keepalive: true,
					livereload: true
				}
			}
		}
    });
    
    // Loading dependencies
	for (var key in grunt.file.readJSON('package.json').devDependencies) {
		if (key !== 'grunt' && key.indexOf('grunt') === 0) {
			grunt.loadNpmTasks(key);
		}
	}
    
    grunt.registerTask('default', ['jshint', 'qunit', 'uglify', 'compare_size']);
};