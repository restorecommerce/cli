'use strict';

const Promise = require('bluebird');
const Task = require('../../models/task');
const fs = require('fs');
const jsonfile = require('jsonfile')
const debug = require('debug')('rstc:tasks/init');
const SilentError = require('silent-error');

/*
When fixing this.ui.writeLine -> it's that.ui.writeLine where that is defined.
*/

module.exports = Task.extend({
	run: function(options) {
		const projectPath = options.base + '/.restore-commerce-project.json';
		const credentialsPath = options.base + '/.restore-commerce-credentials.json';
		debug('projectPath (%s) credentialsPath (%s)', projectPath, credentialsPath);

		return this.initProjectFile(projectPath, options).then(() => {
			return this.initCredentialsFile(credentialsPath, options);
		});
	},

	initProjectFile: function(projectPath, options) {
		const that = this;
		fs.stat(projectPath, (err, stats) => {
			if (err) {
				var obj = {};

				obj[options.id] = {
					"entry": options.entry
				};

				return new Promise((resolve, reject) => {
					jsonfile.writeFile(projectPath, obj, (err) => {
						if (err) reject(new SilentError(err));

						console.log('Initialized project\'s "' + options.id + '" endpoint (' +
												options.entry + ') at: "' + options.base + '".');
						resolve();
					});
				});

			} else {
				jsonfile.readFile(projectPath, (err, obj) => {
					if (err) return new Promise.reject(new SilentError(err));

					obj = obj || {};
					if (!obj.hasOwnProperty(options.id)) {
						return that.writeProjectFile(projectPath, obj, options);
					} else {
						const inquirer = require('inquirer');
						const question = {
							type: 'confirm',
							name: 'overwrite',
							message: 'Overwrite "' + options.id + '" project\'s current endpoint (' +
								obj[options.id].entry + ') with "' + options.entry + '"?'
						};

						inquirer.prompt([question], (answers) => {
							if (answers.overwrite) {
								that.writeProjectFile(projectPath, obj, options, obj[options.id].entry);
							} else console.log("Aborted operation.");
						});
					}
				});
			}
		});
	},

	initCredentialsFile: function(credentialsPath, options) {
		const that = this;
		fs.stat(credentialsPath, (err, stats) => {
			if (err) {
				var obj = {};

				obj[options.id] = {
					"apiKey": options.apikey
				};
				return new Promise((resolve, reject) => {
					jsonfile.writeFile(credentialsPath, obj, (err) => {
						if (err) reject(new SilentError(err));

						console.log('Initialized project\'s "' + options.id + '" API key (' +
												options.apikey + ') at: "' + options.base + '".');
						resolve();
					});
				});

			} else {
				jsonfile.readFile(credentialsPath, (err, obj) => {
					if (err) return new Promise.reject(new SilentError(err));

					obj = obj || {};
					if (!obj.hasOwnProperty(options.id)) {
						return that.writeCredentialsFile(credentialsPath, obj, options);
					} else {
						const inquirer = require('inquirer');
						const question = {
							type: 'confirm',
							name: 'overwrite',
							message: 'Overwrite "' + options.id + '" project\'s current API key (' +
								obj[options.id].apiKey + ') with "' + options.apikey + '"?'
						};

						inquirer.prompt([question], (answers) => {
							if (answers.overwrite) {
								return that.writeCredentialsFile(credentialsPath, obj, options, obj[options.id].apiKey);
							} else console.log("Aborted operation.");
						});
					}
				});
			}
		});
	},

	writeProjectFile: function(projectPath, obj, options, previousEndpoint) {
		return new Promise((resolve, reject) => {
			obj[options.id] = {
				"entry": options.entry
			};

			jsonfile.writeFile(projectPath, obj, (err) => {
				if (err) reject(new SilentError(err));

				var message;
				if (previousEndpoint) {
					message = 'Overwrote "' + options.id + '" project\'s entry point (' + previousEndpoint +
						') with "' + options.entry + '" at: "' + projectPath + '".';
				} else {
					message = 'Added project\'s "' + options.id + '" entry point (' +
						options.entry + ') at: "' + projectPath + '".';
				}

				console.log(message);
				resolve();
			});
		});
	},

	writeCredentialsFile: function(credentialsPath, obj, options, previousApiKey) {
		return new Promise((resolve, reject) => {
			obj[options.id] = {
				"apiKey": options.apikey
			};

			jsonfile.writeFile(credentialsPath, obj, (err) => {
				if (err) reject(new SilentError(err));

				var message;
				if (previousApiKey) {
					message = 'Overwrote "' + options.id + '" project\'s API key (' + previousApiKey +
										') with "' + options.apikey + '" at: "' + credentialsPath + '".';
				} else {
					message = 'Added project\'s "' + options.id + '" API key (' +
										options.apikey + ') at: "' + credentialsPath + '".';
				}

				console.log(message);
				resolve();
			})
		});
	}
});