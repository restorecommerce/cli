'use strict';

const Command       = require('../../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/oss/get')
const SilentError 	= require('silent-error');

// Sub-command of Oss.
module.exports = Command.extend({
	name: 'get',
	description: 'Get a resource with a given IRI.',
	works: 'everywhere',
	availableOptions: [
		{ name: 'meta', type: Boolean, default: false },
	],
	anonymousOptions: [
    '<iri>'
  ],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		if(!this.superCommand.oss) {
    	this.printBasicHelp(commandOptions);
			const message = 'System error: Either an Object Storage Service Client was not' +
											' succesfully created in command "' + this.superCommand.name +
											' " or it wasn\'t passed down to command "' + this.name + '".';
			return new Promise.reject(new SilentError(message));
		}

		if(rawArgs.length < 1) {
    	this.printBasicHelp(commandOptions);
			const message = 'An IRI must be given.';
			return new Promise.reject(new SilentError(message));
		}

		commandOptions.iri = rawArgs.shift();

		const Task = this.availableTasks.Get;
		const task = new Task({
			oss: this.superCommand.oss,
			ui: this.ui
		});

		return task.run(commandOptions).then(function(result) {
			//
		});
	}
});
