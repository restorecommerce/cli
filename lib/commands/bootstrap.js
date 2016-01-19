'use strict';

const Command = require('../models/command');
const Promise = require('bluebird');
const debug = require('debug')('rstc:commands/bootstrap')

module.exports = Command.extend({
	name: 'bootstrap',
	description: 'Application bootstrapping.',
	aliases: ['b', 'boot'],
	//works: 'everywhere',
	availableOptions: [
		{ name: 'project',	type: String, default: undefined 																																																						},
		{ name: 'entry',		type: String, default: undefined, aliases: ['e'],					description: 'Applicaton endpoint.'																								},
		/*{ name: 'base',  		type: String, default: undefined, aliases: ['b'],					description: 'Defaults to current working directory.'															},*/
		{ name: 'apikey',		type: String,	default: undefined, aliases: ['key', 'k'],	description: 'API key to use for the application.'																}
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

		// No --project option specified, look for entry and apikey.
		if (!commandOptions.project) {
			if (!commandOptions.entry && !commandOptions.apikey) {
				this.printAvailableCommands(options);
				const message = 'Either a project or an endpoint and api key must be specified.';
				throw new SilentError(message);
			}
		// --project option is specified, look for an overriding entry and apikey.
		} else {
			if (!this.settings.project[commandOptions.project] ||
				!this.settings.project[commandOptions.project].entry) {
				const message = 'Specified project\'s "' + commandOptions.project +
												'" endpoint ("entry") could not be located in the' +
												'".restore-commerce-project.json" file.';
				throw new SilentError(message);
			}

			var entry = this.settings.project[commandOptions.project].entry;

			if (!this.settings.credentials[commandOptions.project] ||
				!this.settings.credentials[commandOptions.project].apiKey) {
				const message = 'Specified project\'s "' + commandOptions.project +
												'" API key ("apiKey") could not be located in the' +
												'".restore-commerce-credentials.json" file.'
				throw new SilentError(message);
			}

			var apikey = this.settings.credentials[commandOptions.project].apiKey;

			if (commandOptions.entry) {
				const message = 'Overriding default endpoint ("' + entry +
												'") with "' + commandOptions.entry + '".';
				console.log(message);
			} else {
				commandOptions.entry = entry;
			}

			if (commandOptions.apikey) {
				const message = 'Overriding default API key ("' + apikey +
												'") with "' + commandOptions.apikey + '".';
				console.log(message);
			} else {
				commandOptions.apikey = apikey;
			}
		}
		
		commandOptions.directory = __dirname;

		const Task = this.availableTasks.Bootstrap
		const task = new Task({
			ui: this.ui
		});

		return task.run(commandOptions);
	}
});