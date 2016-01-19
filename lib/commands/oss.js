'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/oss')
const OssClient 		= require('../oss-client/client');
const SilentError 	= require('silent-error');
const string        = require('../utilities/ext/string');

module.exports = Command.extend({
	name: 'oss',
	description: '',
	//works: 'insideProject',

	availableOptions: [
		{ name: 'project',		type: String, 	default: undefined, aliases: ['p']																																							},
		{ name: 'entry', 			type: String, 	default: undefined,	aliases: ['e'],					description: 'Defaults to resolved specified project\'s endpoint.' 	},		
		{ name: 'apikey',			type: String,		default: undefined, aliases: ['key', 'k'],	description: 'Defaults to resolved specified project\'s API key.'	 	}
	],

	anonymousOptions: [
    '<command (Default: help)>'
	],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: ', commandOptions);
		debug('rawArgs: ', rawArgs);

		const options = {
			superCommand: this,

			ui: this.ui,
			analytics: this.analytics,
			commands: this.commands,
			tasks: this.tasks,
			project: this.project,
			settings: this.settings,
			testing: this.testing,
			cli: this.cli
		};

		if (rawArgs.length === 0) {
			this.printAvailableCommands(options);
			//const message = ""
			return new Promise.reject(); // new SilentError(message)
		}

		const _commandName = rawArgs.shift();
		debug(this.name + ' received command: %s', _commandName)
		const commandName = string.classify(_commandName);

		if (!this.availableCommands[commandName]) {
			this.printAvailableCommands(options);
			const message = 'Sub-command "' + _commandName + '" is not registered with "' + this.name + '".';
			return new Promise.reject(new SilentError(message));
		}

		if (commandName !== 'Job') {
			try {
				this.parseCommandOptions.bind(this)(options, commandOptions)
			} catch(e) {
				return new Promise.reject(e);
			}

			console.log('Initializing OSS Client -\n' +
									'Endpoint: ' + commandOptions.entry + '\n' +
									'API key: ' + commandOptions.apikey + '\n');

			this.oss = new OssClient({
				entry: commandOptions.entry,
				apiKey: commandOptions.apikey
			})
		}

		const command = new this.availableCommands[commandName](options);

		command.beforeRun(commandOptions, rawArgs);

		return command.validateAndRun(rawArgs);
	},

	parseCommandOptions: function(options, commandOptions) {
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
	}
});