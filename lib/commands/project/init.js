'use strict';

const Command       = require('../../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/project/init')
const SilentError 	= require('silent-error');
const fs 						= require('fs');

// Sub-command of Project.
module.exports = Command.extend({
	name: 'init',
	description: 'This command creates project related configuration files in the base directory.',
	works: 'everywhere',
	availableOptions: [
		{ name: 'id',    	type: String, default: undefined, aliases: [],						description: 'Application\'s ID.'																															 },
		{ name: 'entry', 	type: String, default: undefined, aliases: ['e'],					description: 'Applicatio\'s entry point.'																								       },
		{ name: 'base',  	type: String, default: undefined, aliases: ['b'],					description: 'Directory to initialize the project to. Defaults to current working directory.'  },
		{ name: 'apikey',	type: String,	default: undefined, aliases: ['key', 'k'],	description: 'API key for the credentials file. Gets automatically generated if not provided.' }
	],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		if (!commandOptions.id || !commandOptions.entry) {
			this.printBasicHelp();
			const message = 'A project ID and endpoint must be specified.';
			return Promise.reject(new SilentError(message));
		}

		if (!commandOptions.base) {
      commandOptions.base = process.cwd();
    }

    const self = this;
		const getApiKey = new Promise(function(resolve, reject) {
			if (!commandOptions.apikey) {
				const Apikey = new self.commands.Apikey;
				Apikey.beforeRun(['gen']);
				Apikey.validateAndRun(['gen']).then(result => {
					resolve(result);
				});
			} else resolve(commandOptions.apikey);
		});

		return getApiKey.then(result => {
			commandOptions.apikey = result;

			const Task = self.availableTasks.Init;
			const task = new Task({
        settings: this.settings,
        cli: this.cli,
        ui: this.ui
      });

			return task.run(commandOptions);
		});
	}
});