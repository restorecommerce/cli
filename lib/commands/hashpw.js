'use strict';

const Command 		= require('../models/command');
const Promise 		= require('bluebird');
const SilentError = require('silent-error');
const debug 			= require('debug')('rstc:commands/hashpw')

module.exports = Command.extend({
	name: 'hashpw',
	description: 'Hash a password.',
	aliases: [],
	//works: 'everywhere',
  availableOptions: [

  ],	

	run: function(commandOptions, rawArgs) {
		//debug("commandOptions: ", commandOptions);
		debug("rawArgs: ", rawArgs);
		commandOptions.password = rawArgs.shift();
		debug("password: ", commandOptions.password);
		if (!commandOptions.password) {
			const message = 'Provide a password to hash.';
			return Promise.reject(new SilentError(message));
		} else {
			const Task = this.tasks[this.name];
			const task = new Task({
				ui: this.ui
			});

			return task.run({
				password: commandOptions.password
			});
		}
	},
});