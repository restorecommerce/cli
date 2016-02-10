'use strict';

const Command       = require('../../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/oss/list')
const SilentError 	= require('silent-error');

// Sub-command of Oss.
module.exports = Command.extend({
	name: 'list',
	description: 'List resources in a OSS resource with a given IRI.',
	works: 'everywhere',
	anonymousOptions: [
    '<iri>'
  ],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		if(!this.superCommand.oss) {
			const message = 'System error: Either a Object Storage Service Client was not' +
											' succesfully created in command "' + this.superCommand.name +
											'" or it wasn\'t passed down to command "' + this.name + '".';
			throw Error(message);
		}

		commandOptions.iri = rawArgs.shift();
		if(!commandOptions.iri) {
    	this.printBasicHelp();
			const message = 'An IRI must be given.';
			return Promise.reject(new SilentError(message));
		}

		const Task = this.availableTasks.List;
		const task = new Task({
			oss: this.superCommand.oss,
			ui: this.ui
		});

		return task.run(commandOptions).then(function(result) {
			//
		});
	}
});
