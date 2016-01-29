'use strict';

const Command 		= require('../models/command');
const Promise 		= require('bluebird');
const SilentError = require('silent-error');
const debug 			= require('debug')('rstc:commands/pwhashgen')

module.exports = Command.extend({
	name: 'pwhashgen',
	description: 'Generate a hash from the given string.',
  works: 'everywhere',
  anonymousOptions: [
    '<password>'
  ],

	run: function(commandOptions, rawArgs) {
		debug("rawArgs: ", rawArgs);

    if(commandOptions.help) {
      this.printDetailedHelp();
			return new Promise.resolve();
    } else if (rawArgs.length === 0) {
			this.printDetailedHelp();
			const message = 'Provide a password to hash.';
			return new Promise.reject(new SilentError(message));
		} else {
			commandOptions.password = rawArgs.shift();
			debug("password: ", commandOptions.password);

			const Task = this.availableTasks.Pwhashgen
			const task = new Task({
				ui: this.ui
			});

			return task.run({
				password: commandOptions.password
			});
		}
	},
});