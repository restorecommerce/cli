'use strict';

const Command 		= require('../models/command');
const Promise			= require('bluebird');
const debug 			= require('debug')('rstc:commands/bootstrap');
const SilentError = require('silent-error');

module.exports = Command.extend({
	name: 'bootstrap',
	description: 'Used to bootstrap the application\'s API.',
	aliases: ['b', 'boot'],
	//works: 'everywhere',
	availableOptions: [
		{ name: 'project',	type: String, default: undefined, 												description: 'Which project\'s configuration to use (can be overrided).'	},
		{ name: 'entry',		type: String, default: undefined, aliases: ['e'],					description: 'Defaults to specified project\'s entry point.'							},
		{ name: 'apikey',		type: String,	default: undefined, aliases: ['key', 'k'],	description: 'Defaults to specified project\'s api key.'									}
	],

	anonymousOptions: [
    '<directory - defaults to current working directory>'
  ],

	run: function(commandOptions, rawArgs) {
    commandOptions.apiKey = commandOptions.apikey;
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

    if(commandOptions.help) {
			this.printDetailedHelp();
			return new Promise.resolve();
    }
    // No --project option specified, look for entry and apikey.
    if (!commandOptions.project) {
			if (!commandOptions.entry && !commandOptions.apikey) {
				this.printDetailedHelp();
				const message = 'Either a project or an endpoint and api key must be specified.';
				return new Promise.reject(new SilentError(message));
			}
		// --project option is specified, look for an overriding entry and apikey.
		} else {
			if (!Object.keys(this.settings.project).length) {
				const message = 'No endpoint entries were found in the ' +
												'"restore-commerce-project.json" file or it was not found.';
				return new Promise.reject(new SilentError(message));
			} else if(!this.settings.project[commandOptions.project] ||
				!this.settings.project[commandOptions.project].entry) {
				const message = 'Specified project\'s "' + commandOptions.project +
												'" endpoint ("entry") could not be located in the' +
												'".restore-commerce-project.json" file.';
				return new Promise.reject(new SilentError(message));
			}

			var entry = this.settings.project[commandOptions.project].entry;

			if (!Object.keys(this.settings.credentials).length) {
				const message = 'No credential entries were found in the' +
												'"restore-commerce-credentials.json" file or it was not found.';
				return new Promise.reject(new SilentError(message));
			} else if (!this.settings.credentials[commandOptions.project] ||
				!this.settings.credentials[commandOptions.project].apiKey) {
				const message = 'Specified project\'s "' + commandOptions.project +
												'" API key ("apiKey") could not be located in the' +
												'".restore-commerce-credentials.json" file.'
				return new Promise.reject(new SilentError(message));
			}

			var apiKey = this.settings.credentials[commandOptions.project].apiKey;

			if (commandOptions.entry) {
				const message = 'Overriding default endpoint ("' + entry +
												'") with "' + commandOptions.entry + '".';
				console.log(message);
			} else {
				commandOptions.entry = entry;
			}

			if (commandOptions.apiKey) {
				const message = 'Overriding default API key ("' + apiKey +
												'") with "' + commandOptions.apiKey + '".';
				console.log(message);
			} else {
				commandOptions.apiKey = apiKey;
			}
		}

		commandOptions.directory = rawArgs.shift();
		if(!commandOptions.directory) commandOptions.directory = process.cwd();

		debug('bootstrap options:');
		debug(commandOptions);

		const Task = this.availableTasks.Bootstrap
		const task = new Task({
			ui: this.ui
		});

		return task.run(commandOptions);
	}
});