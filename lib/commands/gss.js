'use strict';

const Promise 			= require('bluebird');
const SilentError 	= require('silent-error');

const string        = require('../utilities/ext/string');
const validate      = require('../utilities/validate');

const Command       = require('../models/command');
const GssClient 		= require('restore-gss-client').Client;
const debug 				= require('debug')('rstc:commands/gss')

module.exports = Command.extend({
	name: 'gss',
	description: 'Graph Storage Service Client related commands.',
	works: 'everywhere',
	availableOptions: [
		{ name: 'project',		type: String, 	default: undefined, aliases: ['p'],					description: 'Which project\'s configuration to use (can be overridden).'	},
		{ name: 'entry', 			type: String, 	default: undefined,	aliases: ['e'],					description: 'Defaults to specified project\'s entry point.' 							},
		{ name: 'apikey',			type: String,		default: undefined, aliases: ['key', 'k'],	description: 'Defaults to specified project\'s API key.'	 								},
		{ name: 'protocol',		type: String,		default: 'http',	  aliases: [],						/* description: 'Defaults to "http".' */ 																	}
	],

	anonymousOptions: [
    '<command>'
	],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: ', commandOptions);
		debug('rawArgs: ', rawArgs);

    const cmdNameArg = rawArgs.shift();
    if (!cmdNameArg) {
      this.printDetailedHelp();
      return Promise.resolve();
    }

    debug(this.name + ' received command: %s', cmdNameArg)
    const commandName = string.classify(cmdNameArg);

		if (!this.availableCommands[commandName]) {
			this.printDetailedHelp();
			const message = 'Sub-command "' + cmdNameArg + '" is not registered with "' + this.name + '".';
			return Promise.reject(new SilentError(message));
		}

		try {
			commandOptions = validate.applicationOptions(this, commandOptions, this.settings);
		} catch (e) {
			return Promise.reject(e);
		}

		console.log('Initializing GSS Client -\n' +
				        'Entry point: ' + commandOptions.entry + '\n' +
			          'API key: ' + commandOptions.apikey + '\n');

		this.gss = GssClient({
			entry: commandOptions.entry,
			apiKey: commandOptions.apikey,
			protocol: commandOptions.protocol
		})

		const options = {
			superCommand: this,
			ui: this.ui,
			commands: this.commands,
			tasks: this.tasks,
			settings: this.settings,
			cli: this.cli
		};

		const command = new this.availableCommands[commandName](options);

		command.beforeRun(commandOptions, rawArgs);

		return command.validateAndRun(rawArgs, commandOptions);
	}
});