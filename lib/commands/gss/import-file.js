'use strict';

const Command       = require('../../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/gss/import')
const SilentError 	= require('silent-error');
const stat 					= Promise.promisify(require("fs").stat);
const jsonfile			= require('jsonfile');
const chalk 				= require('chalk');
const inquirer 			= require('inquirer');
const path          = require('path');

// Sub-command of Gss.
module.exports = Command.extend({
	name: 'import-file',
	description: 'Import only one resource. If path is a directory it will also be imported.',
	//works: 'insideProject',

	anonymousOptions: [
    '<file> <resource>'
  ],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		// Called from import-directory.
		if(commandOptions.path)
			return this.importFile.bind(this)(commandOptions);

		if (!this.superCommand.gss) {
			this.printBasicHelp(commandOptions);
			const message = 'System error: Either an Graph Storage Service Client was not' +
											' succesfully created in command "' + this.superCommand.name +
											'" or it wasn\'t passed down to command "' + this.name + '".';
			return Promise.reject(new SilentError(message));
		}

		commandOptions.path = rawArgs.shift();

   	if(!commandOptions.path) {
			this.printBasicHelp(commandOptions);
			const message = 'A path to the file to import must be given.';
			return Promise.reject(new SilentError(message));
   	}

    var resource = rawArgs.shift();

    if(!resource) {
			this.printBasicHelp(commandOptions);
			const message = 'A resource to import to must be given.';
			return Promise.reject(new SilentError(message));
   	}

    if(resource[0] !== '/' || resource[0] !== '\\') {
      // Have to test if, for example, '/classes'
      // gets 'normalized' to '\classes' on Windows.
      resource  = path.normalize('/' + resource);
    }

    commandOptions.resource = resource;

		return stat(commandOptions.path).then(function(stats) {
			if(stats.isDirectory()) {
				const question = {
					type: 'confirm',
					name: 'importDir',
					message: 'A directory ("' + commandOptions.path + '") instead of a file was provided. Import the whole directory?'
				};

				return Promise((resolve, reject) => {
					inquirer.prompt([question], (answers) => {
            debug(answers)
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

							ImportDirectory.beforeRun(commandOptions, rawArgs);
							ImportDirectory.run(commandOptions, rawArgs).then(() => {
								resolve();
							}).catch((e) => {
								reject(e);
							});
						} else console.log("Aborted operation.");
					});
				});
      } else if (stats.isFile()) {
        return this.importFile.bind(this)(commandOptions);
			}
		}.bind(this));
	},

	importFile: function(options) {
		try {
			jsonfile.readFileSync(options.path);
		} catch (e) {
			const message = '"' + options.path + '" contains invalid JSON:\n' + e.message;
			return Promise.reject(new SilentError(message));
		}

		const Task = this.availableTasks.ImportFile;
		const task = new Task({
			gss: this.superCommand.gss,
			ui: this.ui
		});

		return task.run(options);
	}
});