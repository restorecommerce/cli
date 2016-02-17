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
	  { name: 'base', type: String, default: undefined, aliases: ['b'],	description: 'Directory to create the migration into. Defaults to \'migrations\' in project base directory.' },
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
		if(!commandOptions.migration) {
    	this.printBasicHelp();
			const message = 'Please provide a name for the migration.';
			return Promise.reject(new SilentError(message));
		}

    if(!commandOptions.base) {
      commandOptions.base = process.cwd() + '/migrations';
      debug('Migration directory not given, defaulting to: %s', commandOptions.base)
    }

		const Task = this.availableTasks.Create
		const task = new Task({
      migrate: this.superCommand.migrate,
      settings: this.settings,
      cli: this.cli,
			ui: this.ui
		});

		return task.run(commandOptions);
	}
});