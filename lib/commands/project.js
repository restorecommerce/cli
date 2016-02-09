'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/project');
const string        = require('../utilities/ext/string');
const SilentError 	= require('silent-error');

module.exports = Command.extend({
	name: 'project',
	description: 'Project related commands.',
	works: 'everywhere',
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
			this.printDetailedHelp(options, true);
			return new Promise.resolve();
		}

		const _commandName = rawArgs.shift();
		debug(this.name + ' received command: %s', _commandName)
		const commandName = string.classify(_commandName);

		if (!this.availableCommands[commandName]) {
			this.printDetailedHelp(options, true);
			const message = 'Sub-command "' + _commandName + '" is not registered with "' + this.name + '".';
			return new Promise.reject(new SilentError(message));
		}

		const command = new this.availableCommands[commandName](options);

		command.beforeRun(commandOptions, rawArgs);

		return command.validateAndRun(rawArgs, commandOptions);
	}
});