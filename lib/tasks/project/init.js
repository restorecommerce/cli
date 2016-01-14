'use strict';

const Promise 			= require('bluebird');
const Task 					= require('../../models/task');
const fs						= require('fs');
const jsonfile			= require('jsonfile')
const debug 				= require('debug')('rstc:tasks/init');
const SilentError 	= require('silent-error');

// https://www.npmjs.com/package/json-file is an option.

module.exports = Task.extend({
	run: function(options) {
		var that = this;
		return new Promise((resolve, reject) => {
			const path = options.base + '/.restore-commerce-project.json';
			debug('Path: %s', path);

			try {
				fs.stat(path, (err, stats) => {
					if (err) {
						var obj = {};

						obj[options.id] = {
							"entry": options.entry
						};

						jsonfile.writeFile(path, obj, (err) => {
							if (err) throw new SilentError(err);
							that.ui.writeLine('Initialized project "' + options.id + '" (' + options.entry + ') at: "' + options.base + '".');
						});

					} else if (stats.isFile()) {
						jsonfile.readFile(path, (err, obj) => {
							if (err) throw new SilentError(err);
							if (!obj.hasOwnProperty(options.id)) that.write(path, obj, options);
							else {
								const inquirer = require('inquirer');
								const question = {
									type: 'confirm',
									name: 'overwrite',
									message: 'Rewrite "' + options.id + '" project\'s current endpoint (' +
										obj[options.id] + ') with "' + options.entry + '"?'
								};

								inquirer.prompt([question], (answers) => {
									if (answers.overwrite) that.write(path, obj, options, obj[options.id]);
										else console.log("Aborted operation.");
								});
							}
						});
					} else throw new SilentError(err);

					resolve();
				});
			} catch (err) {
				return new Promise.reject(err);
			}
		});
	},

	write: function(path, obj, options, previousEndpoint) {
		jsonfile.writeFile(path, obj, (err) => {
			if (err) throw new new SilentError(err);

			obj[options.id] = {
				"entry": options.entry
			};
			
			var message;
			if (previousEndpoint) {
				message = 'Overwrote "' + options.id + '" project\'s entry point (' + previousEndpoint +
					' with ' + options.entry + 'at: "' + options.base + '".';
			} else {
				message = 'Added project\'s "' + options.id + '" entry point (' +
					options.entry + ' at: "' + options.base + '".';
			}

			this.ui.writeLine(message);
		});
	}
});