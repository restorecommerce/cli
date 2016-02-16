'use strict';

const Promise 			= require('bluebird');
const SilentError 	= require('silent-error');

const Command       = require('../../models/command');
const debug 				= require('debug')('rstc:commands/migrate/create')

// Sub-command of Migrate.
module.exports = Command.extend({
	name: 'create',
	description: 'Create a fixture migration.',
	works: 'everywhere',

	availableOptions: [

	],

	anonymousOptions: [
    '<migration-name>'
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

		commandOptions.migration = rawArgs.shift();
		if(!commandOptions.migration) {
    	this.printBasicHelp();
			const message = 'Please provide a name for the migration.';
			return Promise.reject(new SilentError(message));
		}

		const Task = this.availableTasks.Create
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