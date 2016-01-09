'use strict';

const Command 		= require('../models/command');
const Promise 		= require('bluebird');
const SilentError = require('silent-error');
const debug 			= require('debug')('rstc:commands/pwhashgen')

module.exports = Command.extend({
	name: 'pwhashgen',
	description: 'Generate a hash from the given string.',
  works: 'everywhere',

	run: function(commandOptions, rawArgs) {
		debug("rawArgs: ", rawArgs);
    if (rawArgs.length === 0) {
    	console.log(this.printBasicHelp(commandOptions));
			const message = 'Provide a password to hash.';
			return new Promise.reject(new SilentError(message));
		} else {
			commandOptions.password = rawArgs.shift();
			debug("password: ", commandOptions.password);

			const Task = this.tasks.Hashpw
			const task = new Task({
				ui: this.ui
			});

			return task.run({
				password: commandOptions.password
			});
		}
	},
});