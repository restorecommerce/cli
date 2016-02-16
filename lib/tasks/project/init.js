'use strict';

const fs          = require('fs');
const path        = require('path');

const Promise     = require('bluebird');
const jsonfile    = require('jsonfile')
const SilentError = require('silent-error');

const Task 	      = require('../../models/task');
const debug       = require('debug')('rstc:tasks/init');

/*
	  When fixing this.ui.writeLine -> it's that.ui.writeLine where that is defined.
*/

module.exports = Task.extend({
	run: function(options) {
		try {
			fs.stat(options.base, (err, stats) => {
				if (err || !stats.isDirectory()) {
					const message = 'Directory "' + options.base + '" doesn\'t exist.'
					return Promise.reject(new SilentError(message));
				}
			});
		} catch (err) {
			return Promise.reject(err);
		}

		const projectsPath = path.normalize(options.base + '/.' + this.settings.config.projectsFileName);
		const credentialsPath = path.normalize(options.base + '/.' + this.settings.config.credentialsFileName);

		debug('projectsPath: (%s)', projectsPath);
		debug('credentialsPath (%s)', credentialsPath);

		return this.initProjectFile(projectsPath, options).then(() => {
			return this.initCredentialsFile(credentialsPath, options);
		});
	},

	initProjectFile: function(projectsPath, options) {
		const that = this;
		return new Promise((resolve, reject) => {
			fs.stat(projectsPath, (err, stats) => {
				if (err) {
					var obj = {};

					obj[options.id] = {
						"entry": options.entry
					};

					jsonfile.writeFile(projectsPath, obj, (err) => {
						if (err) return reject(new SilentError(err));

						console.log('Initialized project\'s "' + options.id + '" entry point (' +
								        options.entry + ') at: "' + projectsPath + '".');
						resolve();
					});

				} else {
					jsonfile.readFile(projectsPath, (err, obj) => {
						obj = obj || {};

						if (!obj.hasOwnProperty(options.id)) {
							that.writeProjectFile(projectsPath, obj, options).then(() => {
								resolve();
							}).catch((e) => {
								reject(e);
							});
						} else {
							const inquirer = require('inquirer');
							const question = {
								type: 'confirm',
								name: 'overwrite',
								message: 'Overwrite "' + options.id + '" project\'s current entry point (' +
										     obj[options.id].entry + ') with "' + options.entry + '"?'
							};

							inquirer.prompt([question], (answers) => {
								if (answers.overwrite) {
									that.writeProjectFile(projectsPath, obj, options, obj[options.id].entry).then(() => {
										resolve();
									}).catch((e) => {
										reject(e);
									});
								} else resolve();
							});
						}
					});
				}
			});
		});
	},

	initCredentialsFile: function(credentialsPath, options) {
		const that = this;
		return new Promise((resolve, reject) => {
			fs.stat(credentialsPath, (err, stats) => {
				if (err) {
					var obj = {};

					obj[options.id] = {
						"apiKey": options.apikey
					};

					jsonfile.writeFile(credentialsPath, obj, (err) => {
						if (err) return reject(new SilentError(err));

						console.log('Initialized project\'s "' + options.id + '" API key (' +
								        options.apikey + ') at: "' + credentialsPath + '".');
						resolve();
					});

				} else {
					jsonfile.readFile(credentialsPath, (err, obj) => {
						obj = obj || {};

						if (!obj.hasOwnProperty(options.id)) {
							that.writeCredentialsFile(credentialsPath, obj, options).then(() => {
								resolve();
							}).catch((e) => {
								reject(e);
							});
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
									that.writeCredentialsFile(credentialsPath, obj, options, obj[options.id].apiKey).then(() => {
										resolve();
									}).catch((e) => {
										reject(e);
									});
								} else resolve();
							});
						}
					});
				}
			});
		});
	},

	writeProjectFile: function(projectsPath, obj, options, previousEndpoint) {
		return new Promise((resolve, reject) => {
			obj[options.id] = {
				"entry": options.entry
			};

			jsonfile.writeFile(projectsPath, obj, (err) => {
				if (err) return reject(new SilentError(err));

				var message;
				if (previousEndpoint) {
					message = 'Overwrote "' + options.id + '" project\'s entry point (' + previousEndpoint +
							      ') with "' + options.entry + '" at: "' + projectsPath + '".';
				} else {
					message = 'Added project\'s "' + options.id + '" entry point (' +
						        options.entry + ') at: "' + projectsPath + '".';
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
				if (err) return reject(new SilentError(err));

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