'use strict';

const Command       = require('../../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/gss/import')
const SilentError 	= require('silent-error');
const fs						= require('fs');
const jsonfile			= require('jsonfile');
const chalk 				= require('chalk');

// Sub-command of Gss.
module.exports = Command.extend({
	name: 'import',
	description: 'Imports the resources defined in a file.',
	aliases: ['i'],
	//works: 'insideProject',

	availableOptions: [
		{ name: 'mode',						type: String,		default: 'prod',	aliases: ['m'],		description: 'Either "prod" or "dev".'					},
		{ name: 'only-modified',	type: Boolean,	default: false,		aliases: ['om'],	description: 'Import only modified resources.'	}
	],

	anonymousOptions: [
    '<file>'
  ],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		if (!this.superCommand.gss) {
			this.printBasicHelp(commandOptions);
			const message = 'System error: Either an Graph Storage Service Client was not' +
											' succesfully created in command "' + this.superCommand.name +
											'" or it wasn\'t passed down to command "' + this.name + '".';
			return new Promise.reject(new SilentError(message));
		}

		commandOptions.file = rawArgs.shift();

		const getImportFile = new Promise(function(resolve, reject) {
			if (commandOptions.file) {
				try {
					jsonfile.readFileSync(commandOptions.file);
					resolve(commandOptions.file);
				} catch (e) {
					reject(new SilentError(e));
				}
			} else {
				this.findImportFiles().then((result) => {
					resolve(result);
				}).catch((e) => {
					reject(new SilentError(e));
				});
			}
		}.bind(this));

		if(commandOptions.mode && commandOptions.mode != 'prod' && commandOptions.mode != 'dev') {
			this.printBasicHelp(commandOptions);
			const message = 'Invalid "--mode" option. Choose between "prod" and "dev".';
			return new Promise.reject(new SilentError(message));
		}

		return getImportFile.then(function(result) {
			commandOptions.file = result;

			const Task = this.availableTasks.Import;
			const task = new Task({
				gss: this.superCommand.gss,
				ui: this.ui
			});

			return task.run(commandOptions);
		}.bind(this));
	},

	findImportFiles: function() {
		return new Promise((resolve, reject) => {
			console.log('Import file not specified. Will try to look up all possbile import files.');
			var choices = [];
			var foundInCurrent = false;
			try {
				const currentDirectory = process.cwd() + '/import.json';
				jsonfile.readFileSync(currentDirectory);
				choices.push(currentDirectory);
				foundInCurrent = true;
			} catch (e) {}

			try {
				const baseDirectory = this.cli.root + '/import.json';
				jsonfile.readFileSync(baseDirectory);
				choices.push(baseDirectory);
			} catch (e) {}

			try {
				const homeDirectory = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/import.json';
				jsonfile.readFileSync(homeDirectory);
				choices.push(homeDirectory);
			} catch (e) {}

			if (!choices.length) {
				reject(new SilentError('No "import.json" file found in current, project base or home directory.'))
			} else {
				// 'Add a "None" option only if there's no "import.json" file in the cwd.
				if(!foundInCurrent) 
					choices.unshift('None');

				const inquirer = require('inquirer');
				const question = {
					type: 'list',
					name: 'file',
					message: 'Which "import.json" file to use?',
					choices: choices
				};

				inquirer.prompt([question], (answers) => {
					if(answers.file === 'None') reject(new SilentError('Aborted operation.'));
						else resolve(answers.file);
				});
			}
		});
	}
});

/*
	validateFile: function(path) {
		fs.statSync(path, (err, fs.stats) => {
			if (err) throw new SilentError('File ' + path + ' not found.'));
			jsonfile.readFile(options.file, (err, obj) => {
				if (err) throw new SilentError('Invalid JSON:\n' + err.message));

				if (!obj || !Object.keys(obj).length)
					throw new SilentError('Nothing to import, empty file.'));
		});
	});
*/