'use strict';

const Command       = require('../../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/gss/import')
const SilentError 	= require('silent-error');
const stat 					= Promise.promisify(require("fs").stat);
const jsonfile			= require('jsonfile');
const chalk 				= require('chalk');
const inquirer 			= require('inquirer');

// Sub-command of Gss.
module.exports = Command.extend({
	name: 'import-directory',
	description: 'Import a directory. If path is a file it will also be imported.',
	aliases: ['import-dir'],
	//works: 'insideProject',

	anonymousOptions: [
    '<directory>'
  ],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		// Called from import-file.
		if(commandOptions.importDirectory)
			return this.importDirectory.bind(this)(commandOptions);

		if (!this.superCommand.gss) {
			this.printBasicHelp(commandOptions);
			const message = 'System error: Either an Graph Storage Service Client was not' +
											' succesfully created in command "' + this.superCommand.name +
											'" or it wasn\'t passed down to command "' + this.name + '".';
			return new Promise.reject(new SilentError(message));
		}

		commandOptions.directory = rawArgs.shift();

   	if(!commandOptions.directory) {
			this.printBasicHelp(commandOptions);
			const message = 'A directory to import must be given.';
			return new Promise.reject(new SilentError(message));
   	}

   	commandOptions.resource = rawArgs.shift();

   	if(!commandOptions.resource) {
			this.printBasicHelp(commandOptions);
			const message = 'A resource to import to must be given.';
			return new Promise.reject(new SilentError(message));
   	}

		return stat(commandOptions.directory).then(function(stats) {
			if(stats.isFile()) {
				const question = {
					type: 'confirm',
					name: 'importFile',
					message: 'A file ("' + commandOptions.directory + '") instead of a directory was provided. Import the file?'
				};

				return new Promise((resolve, reject) => {
					inquirer.prompt([question], (answers) => {
						if (answers.importDir) {
							const options = {
								superCommand: this.superCommand,

								ui: this.ui,
								analytics: this.analytics,
								commands: this.commands,
								tasks: this.tasks,
								project: this.project,
								settings: this.settings,
								testing: this.testing,
								cli: this.cli
							};

							const ImportFile = new this.superCommand.availableCommands.ImportFile(options);
							
							commandOptions.importFile = true;
							commandOptions.file = commandOptions.directory;
							ImportFile.beforeRun(commandOptions, rawArgs);
							ImportFile.run(commandOptions, rawArgs).then(() => {
								resolve();
							}).catch((e) => {
								reject(e);
							});
						} else console.log("Aborted operation.");
					});
				});
			} else if(stats.isDirectory()) {
				return this.importDirectory.bind(this)(commandOptions);
			}	
		}.bind(this));
	},

	importDirectory: function(options) {
		const Task = this.availableTasks.ImportDirectory;
		const task = new Task({
			gss: this.superCommand.gss,
			ui: this.ui
		});

		return task.run(options);
	}
});