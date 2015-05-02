'use strict';
module.exports = function (grunt) {

	require('time-grunt')(grunt);
	require('load-grunt-tasks')(grunt, {
		pattern: ['grunt-*', '!grunt-template-jasmine-istanbul']
	});

	var options = {
				jsGen: grunt.option('jsGen') || 'gen/',
				cssGen: grunt.option('cssGen') || 'www/css/',
				dev: grunt.option('dev'),
				output: grunt.option('output') || 'out/',
				tmp: grunt.option('temp') || 'temp/'
			},
			path = {
				js: 'www/js/',
				scss: 'www/scss/',
				test: 'www/test/',
				html: 'www/html/',
				vendor: 'www/vendor/'
			};

	if (options.dev) {
		grunt.log.subhead('Running Grunt in development mode');
	} else {
		grunt.log.subhead('Running Grunt in production mode');
	}

	grunt
			.initConfig
	(
			{
				/**
				 * clean up
				 */
				/* Clean files and folders */
				clean: {
					js: [options.jsGen],
					css: [options.cssGen],
					gen: [options.jsGen, options.cssGen],
					vendor: [path.vendor],
					output: [options.output],
					afterBuild: [options.tmp]
				},

				/**
				 * development tasks
				 */
				/* Starts a http server that can be called to run Grunt tasks and serve files. */
				serve: {
					options: {
						port: 9000,
						silently: false
					}
				},

				/* Run predefined tasks whenever watched file patterns are added, changed or deleted. */
				watch: {
					js: {
						files: [path.js + "**/*.js", path.test + '**/*spec.js'],
						tasks: ['frontend:js:test']
					},
					css: {
						files: [path.scss + '**/*.scss'],
						tasks: ['frontend:css:compile']
					}
				},

				/**
				 * compile javascript files
				 */
				/* Add, remove and rebuild AngularJS dependency injection annotations. Based on ng-annotate. */
				ngAnnotate: {
					options: {
						singleQuotes: true,
						remove: true,
						add: true,
						sourceMap: options.dev || false
					},
					js: {
						files: [
							{
								expand: true,
								cwd: path.js,
								src: ['**/*.js'],
								dest: options.tmp
							}
						]
					}
				},

				/* Minify files with UglifyJS. */
				uglify: {
					options: {
						preserveComments: false,
						compress: true,
						beautify: options.dev || false,
						sourceMap: options.dev || false
					},
					js: {
						files: [
							{
								expand: true,
								cwd: options.tmp,
								src: ['**/*.js'],
								dest: options.jsGen
							}
						]
					}
				},

				/**
				 * javascript testing
				 */
				/*Validate files with JSHint.*/
				jshint: {
					options: {
						force: true
					},
					console: {
						options: {
							reporter: require('jshint-stylish')
						},
						files: {
							src: [path.js + '/**/*.js']
						}
					},
					html: {
						options: {
							reporter: require('jshint-html-reporter'),
							reporterOutput: options.output + 'jshint.html'
						},
						files: {
							src: [path.js + '/**/*.js']
						}
					}
				},

				jasmine: {
					coverage: {
						src: [path.js + '/**/*.js'],
						options: {
							keepRunner: true,
							specs: path.test + '/**/*.js',
							vendor: [
								/*'<%= meta.src.main.vendor %>/angular-scenario/angular-scenario.js'*/
								path.vendor + 'angular/angular.js',
								path.vendor + 'angular-route/angular-route.js',
								path.vendor + 'angular-mocks/angular-mocks.js'
							],
							template: require('grunt-template-jasmine-istanbul'),
							templateOptions: {
								/*                        template: require('grunt-template-jasmine-teamcity'),
								 templateOptions: {
								 output: '<%= meta.bin.coverage %>/html/jasmine.teamcity.log'
								 },*/
								coverage: options.output + 'coverage.json',
								report: [
									{
										type: 'html',
										options: {
											dir: options.output + 'html'
										}
									},
									{
										type: 'cobertura',
										options: {
											dir: options.output + 'cobertura'
										}
									},
									{
										type: 'text-summary'
									}
								]
							}
						}
					}
				},

				/**
				 * compile css files
				 */
				/*Compile Sass to CSS*/
				sass: {
					options: {
						debugInfo: options.dev || false,
						update: options.dev || false,
						trace: options.dev || false,
						style: (options.dev) ? 'expanded' : 'nested'
					},
					build: {
						files: [
							{
								expand: true,
								cwd: path.scss,
								src: ['**/*.scss'],
								dest: options.cssGen,
								ext: '.css'
							}
						]
					}
				},

				/*Minify CSS*/
				cssmin: {
					options: {
						compatibility: 'ie8',
						keepSpecialComments: '*',
						advanced: false,
						sourceMap: options.dev || false
					},
					minifyCore: {
						src: options.cssGen + 'opscenter.css',
						dest: options.cssGen + 'opscenter.min.css'
					}
				},

				/**
				 * create vendor files
				 */
				/*Install Bower packages. Smartly.*/
				bower: {
					all: {
						options: {
							production: !options.dev || false,     // Do not install project devDependencies
							cleanTargetDir: false,
							cleanBowerDir: true,
							install: true,
							copy: true,
							verbose: options.dev || false,
							layout: 'byComponent',
							targetDir: path.vendor
						}
					}
				},
				connect: {
					server: {
						options: {
							port: 9001,
							base: 'www',
							keepalive: true
						}
					}
				}

			});

	//#### ------------ Custom Tasks------------ ####//
	grunt.registerTask('build:watch', ['serve']);                                                     // serves changed files on page reload
	grunt.registerTask('frontend', ['frontend:clean', 'frontend:css', 'frontend:js']);
	grunt.registerTask('frontend:clean', ['clean']);

	grunt.registerTask('frontend:js',
			['frontend:js:clean', 'frontend:js:test', 'frontend:js:compile', 'frontend:js:cleanup']);                   // complete task for js creation
	grunt.registerTask('frontend:js:clean', ['clean:js', 'clean:vendor']);
	grunt.registerTask('frontend:js:cleanup', ['clean:afterBuild']);
	grunt.registerTask('frontend:js:generate', ['ngAnnotate']);
	grunt.registerTask('frontend:js:minify', ['uglify:js']);                                          // concat & uglify js
	grunt.registerTask('frontend:js:compile', ['frontend:js:generate', 'frontend:js:minify']);        // js tasks for building
	grunt.registerTask('frontend:js:test', ['frontend:vendor', 'jshint', 'jasmine']);
	grunt.registerTask('frontend:js:watch', ['watch:js']);                                            // watch for changes in js files
	//grunt.registerTask('frontend:js:test', ['bower:build', 'jshint', 'jasmine', 'protactor']);      // runs all js tests

	grunt.registerTask('frontend:css', ['frontend:css:clean', 'frontend:css:compile']);
	grunt.registerTask('frontend:css:clean', ['clean:css']);
	grunt.registerTask('frontend:css:generate', ['frontend:vendor', 'sass']);                                            // create css
	grunt.registerTask('frontend:css:minify', ['cssmin']);                                            // minify css
	grunt.registerTask('frontend:css:compile', ['frontend:css:generate', 'frontend:css:minify']);     // create css & minify
	grunt.registerTask('frontend:css:watch', ['watch:css']);                                          // watch for changes in css files

	grunt.registerTask('frontend:vendor', ['bower']);

	grunt.registerTask('servecss', ['frontend:css:generate']);                                        // grunt serve task for sass & cssmin
	grunt.registerTask('servejs', ['frontend:js:compile']);                                           // grunt serve task for js

	//#### ------------ Default ------------ ####//
	grunt.registerTask('default', ['frontend']);
};