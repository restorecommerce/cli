'use strict';

const Command = require('../models/command');
const Promise = require('bluebird');
const debug = require('debug')('rstc:commands/bootstrap')

module.exports = Command.extend({
	name: 'bootstrap',
	description: 'Application bootstrapping.',
	aliases: ['b', 'boot'],
	//works: 'everywhere',

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		commandOptions.directory = rawArgs.shift();
		if (!commandOptions.directory) {
			console.log(this.printBasicHelp(commandOptions));
			const message = 'A directory which contains the bootstrap data must be given.';
			return new Promise.reject(new SilentError(message));
		}

		/*
		const Task = this.availableTasks.Bootstrap
		const task = new Task({
			ui: this.ui
		});

		return task.run(commandOptions);
		*/
	}
});