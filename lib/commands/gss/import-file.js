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
	name: 'import-file',
	description: 'Import only one resource. If path is a directory it will also be imported.',
	//works: 'insideProject',

	anonymousOptions: [
    '<file>'
  ],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		// Called from import-directory.
		if(commandOptions.importFile) 
			return this.importFile.bind(this)(commandOptions);

		if (!this.superCommand.gss) {
			this.printBasicHelp(commandOptions);
			const message = 'System error: Either an Graph Storage Service Client was not' +
											' succesfully created in command "' + this.superCommand.name +
											'" or it wasn\'t passed down to command "' + this.name + '".';
			return new Promise.reject(new SilentError(message));
		}

		commandOptions.file = rawArgs.shift();

   	if(!commandOptions.file) {
			this.printBasicHelp(commandOptions);
			const message = 'A path to the file to import must be given.';
			return new Promise.reject(new SilentError(message));
   	}

   	commandOptions.resource = rawArgs.shift();

   	if(!commandOptions.resource) {
			this.printBasicHelp(commandOptions);
			const message = 'A resource to import to must be given.';
			return new Promise.reject(new SilentError(message));
   	}

		return stat(commandOptions.file).then(function(stats) {
			if(stats.isDirectory()) {
				const question = {
					type: 'confirm',
					name: 'importDir',
					message: 'A directory ("' + commandOptions.file + '") instead of a file was provided. Import the whole directory?'
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

							const ImportDirectory = new this.superCommand.availableCommands.ImportDirectory(options);
							
							commandOptions.importDirectory = true;
							commandOptions.directory = commandOptions.file;
							ImportDirectory.beforeRun(commandOptions, rawArgs);
							ImportDirectory.run(commandOptions, rawArgs).then(() => {
								resolve();
							}).catch((e) => {
								reject(e);
							});
						} else console.log("Aborted operation.");
					});
				});
			} else if(stats.isFile()) {
				return this.importFile.bind(this)(commandOptions);
			}
		}.bind(this));
	},

	importFile: function(options) {
		try {
			jsonfile.readFileSync(options.file);
		} catch (e) {
			const message = '"' + options.file + '" contains invalid JSON:\n' + e.message;
			return new Promise.reject(new SilentError(message));
		}

		const Task = this.availableTasks.ImportFile;
		const task = new Task({
			gss: this.superCommand.gss,
			ui: this.ui
		});

		return task.run(options);
	}
});