'use strict';

const Promise 		= require('bluebird');
const SilentError = require('silent-error');

const Command     = require('../../models/command');
const debug 		  = require('debug')('rstc:commands/command/reindex')

// Sub-command of Command.
module.exports = Command.extend({
	name: 'reindex',
	description: 'Reindex Elastic.',
	availableOptions: [],
	anonymousOptions: [],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		if (!this.superCommand.request) {
			const message = 'System error: Either a request was not' +
											' succesfully created in command "' + this.superCommand.name +
											'" or it wasn\'t passed down to command "' + this.name + '".';
			throw Error(message);
		}

    commandOptions.url = commandOptions.headers.Origin + '/commands/reindex';

		const Task = this.availableTasks.Reindex;
		const task = new Task({
      request: this.superCommand.request,
      settings: this.settings,
      cli: this.cli,
			ui: this.ui
		});

		return task.run(commandOptions);
	}
});