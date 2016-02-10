'use strict';

const Promise 			= require('bluebird');
const SilentError 	= require('silent-error');

const string        = require('../utilities/ext/string');

const Command       = require('../models/command');
const debug 				= require('debug')('rstc:commands/project')

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