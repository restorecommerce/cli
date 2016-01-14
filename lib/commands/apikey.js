'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/apikey');
const string        = require('../utilities/ext/string');

module.exports = Command.extend({
	name: 'apikey',
	description: 'API key related commands.',
	works: 'insideProject',

	anonymousOptions: [
		'<api-key>'
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

		const command = new this.availableCommands[commandName](options);

		command.beforeRun(commandOptions, rawArgs);

		return command.validateAndRun(rawArgs);
	}
});