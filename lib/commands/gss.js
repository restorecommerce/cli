'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/gss')
const Gss 					= require('../gss-client').GraphStorage;
const SilentError 	= require('silent-error');
const string        = require('../utilities/ext/string');

module.exports = Command.extend({
	name: 'gss',
	description: 'Graph Storage Service Client related commands.',
	//works: 'insideProject',

	availableOptions: [
		{ name: 'project',		type: String, 	default: undefined, aliases: ['p'],					description: 'Which project\'s configuration to use (can be overrided).'	},
		{ name: 'entry', 			type: String, 	default: undefined,	aliases: ['e'],					description: 'Defaults to specified project\'s endpoint.' 								},		
		{ name: 'apikey',			type: String,		default: undefined, aliases: ['key', 'k'],	description: 'Defaults to specified project\'s API key.'	 								},
		{ name: 'protocol',		type: String,		default: 'http',	  aliases: [],						/*description: 'Defaults to "http".'*/ 																		},
		{ name: 'help',				type: Boolean,	default: undefined,	aliases: ['h'] 																																										}
	],

	anonymousOptions: [
    '<command>'
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

		if (rawArgs.length === 0 || commandOptions.help) {
			this.printBasicHelp(options);
			//const message = ""
			return new Promise.reject(); // new SilentError(message)
		}

		const _commandName = rawArgs.shift();
		debug(this.name + ' received command: %s', _commandName)
		const commandName = string.classify(_commandName);

		if (!this.availableCommands[commandName]) {
			this.printBasicHelp(options);
			const message = 'Sub-command "' + _commandName + '" is not registered with "' + this.name + '".';
			return new Promise.reject(new SilentError(message));
		}

		try {
			this.parseCommandOptions.bind(this)(options, commandOptions)
		} catch (e) {
			return new Promise.reject(e);
		}

		console.log('Initializing GSS Client -\n' +
			'Endpoint: ' + commandOptions.entry + '\n' +
			'API key: ' + commandOptions.apikey + '\n');

		this.gss = new Gss({
			entry: commandOptions.entry,
			key: commandOptions.apikey,
			protocol: commandOptions.protocol
		})
		
		const command = new this.availableCommands[commandName](options);

		command.beforeRun(commandOptions, rawArgs);

		return command.validateAndRun(rawArgs);
	},

	parseCommandOptions: function(options, commandOptions) {
		// No --project option specified, look for entry and apikey.
		if (!commandOptions.project) {
			if (!commandOptions.entry && !commandOptions.apikey) {
				this.printBasicHelp(options);
				const message = 'Either a project or an endpoint and api key must be specified.';
				throw new SilentError(message);
			}
		// --project option is specified, look for an overriding entry and apikey.
		} else {
			this.checkConfigurationFiles();
			
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
	},

	checkConfigurationFiles: function() {
		if (!Object.keys(this.settings.project).length) {
			throw new SilentError('No endpoint entries were found in the "restore-commerce-project.json" file.');
		}

		if (!Object.keys(this.settings.credentials).length) {
			throw new SilentError('No credential entries were found in the "restore-commerce-credentials.json" file.');
		}
	}
});