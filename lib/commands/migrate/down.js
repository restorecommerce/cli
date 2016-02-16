'use strict';

const Promise 			= require('bluebird');
const SilentError 	= require('silent-error');

const Command       = require('../../models/command');
const debug 				= require('debug')('rstc:commands/migrate/down')

// Sub-command of Migrate.
module.exports = Command.extend({
	name: 'down',
	description: 'Revert a migration.',
	works: 'everywhere',

	availableOptions: [

	],

	anonymousOptions: [
    '<migration-directory>'
  ],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		if(!this.superCommand.gss) {
			const message = 'System error: Either a Graph Storage Service Client was not' +
											' succesfully created in command "' + this.superCommand.name +
											'" or it wasn\'t passed down to command "' + this.name + '".';
			throw Error(message);
		}

		if(!this.superCommand.migrate) {
			const message = 'System error: Either a Migrate instance was not' +
											' succesfully created in command "' + this.superCommand.name +
											'" or it wasn\'t passed down to command "' + this.name + '".';
			throw Error(message);
		}

		commandOptions.name = rawArgs.shift();
		if(!commandOptions.name) {
    	this.printBasicHelp();
			const message = 'Please provide the name of the migration to revert.';
			return Promise.reject(new SilentError(message));
		}

		const Task = this.availableTasks.Down
		const task = new Task({
      migrate: this.superCommand.migrate,
			gss: this.superCommand.gss,
      settings: this.settings,
      cli: this.cli,
			ui: this.ui
		});

		return task.run(commandOptions);
	}
});