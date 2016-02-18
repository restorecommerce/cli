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

    commandOptions.url = this.superCommand.request.headers.Origin + 'reindex';

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