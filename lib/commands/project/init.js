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

		const options = {
			ui: this.ui,
			analytics: this.analytics,
			commands: this.commands,
			tasks: this.tasks,
			project: this.project,
			settings: this.settings,
			testing: this.testing,
			cli: this.cli
		};

		if (!commandOptions.id || !commandOptions.entry) {
			this.printBasicHelp(commandOptions);
			const message = 'A project ID and endpoint must be specified.';
			return new Promise.reject(new SilentError(message));
		}

		if (!commandOptions.base) commandOptions.base = process.cwd();

		const getApiKey = new Promise(function(resolve, reject) {
			if (!commandOptions.apikey) {
				const Apikey = new this.commands.Apikey(options);
				Apikey.beforeRun(['gen']);
				Apikey.validateAndRun(['gen']).then((result) => {
					resolve(result);
				});
			} else resolve(commandOptions.apikey);
		}.bind(this));

		return getApiKey.then(function (result) {
			commandOptions.apikey = result;

			const Task = this.availableTasks.Init;
			const task = new Task({
				ui: this.ui
			});

			return task.run(commandOptions);
		}.bind(this));
	}
});