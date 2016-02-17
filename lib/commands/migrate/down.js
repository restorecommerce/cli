'use strict';

const Promise 			= require('bluebird');
const SilentError 	= require('silent-error');

const Command       = require('../../models/command');
const debug 				= require('debug')('rstc:commands/migrate/down')

// Sub-command of Migrate.
module.exports = Command.extend({
	name: 'down',
	description: 'Delete a migration resource.',
	works: 'everywhere',
	availableOptions: [
    { name: 'all', type: Boolean, default: false, aliases: [], description: 'Remove all migrations from the \'migrations\' resource.' },
  ],
	anonymousOptions: [
    '<migration-name>'
  ],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		if(!this.superCommand.migrate) {
			const message = 'System error: Either a Migrate instance was not' +
											' succesfully created in command "' + this.superCommand.name +
											'" or it wasn\'t passed down to command "' + this.name + '".';
			throw Error(message);
		}

		commandOptions.migration = rawArgs.shift();
		if(!commandOptions.migration && !commandOptions.all) {
    	this.printBasicHelp();
			const message = 'Please provide the name of the migration to delete from the \'migrations\' resource.';
			return Promise.reject(new SilentError(message));
		}

		const Task = this.availableTasks.Down
		const task = new Task({
      migrate: this.superCommand.migrate,
      settings: this.settings,
      cli: this.cli,
			ui: this.ui
		});

		return task.run(commandOptions);
	}
});