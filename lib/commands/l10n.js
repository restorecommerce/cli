'use strict';

const Promise			= require('bluebird');
const SilentError = require('silent-error');

const string      = require('../utilities/ext/string');
const Command 		= require('../models/command');
const debug 			= require('debug')('rstc:commands/l10n');

module.exports = Command.extend({
	name: 'l10n',
	description: 'Localization tools.',
	works: 'everywhere',
	anonymousOptions: [
    '<command>'
  ],

  run: function (commandOptions, rawArgs) {
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
			this.printBasicHelp();
			const message = 'Sub-command "' + cmdNameArg + '" is not registered with "' + this.name + '".';
			return Promise.reject(new SilentError(message));
		}

    const options = {
      commands: this.commands,
      settings: this.settings,
      tasks: this.tasks,
      superCommand: this,
      cli: this.cli,
      ui: this.ui,
    };

    const command = new this.availableCommands[commandName](options);

    command.beforeRun(commandOptions, rawArgs);

    return command.validateAndRun(rawArgs, commandOptions);
  }
});
