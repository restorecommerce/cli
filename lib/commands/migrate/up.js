'use strict';

const Promise 			= require('bluebird');
const SilentError 	= require('silent-error');

const Command       = require('../../models/command');
const debug 				= require('debug')('rstc:commands/migrate/up')

// Sub-command of Migrate.
module.exports = Command.extend({
	name: 'up',
	description: 'Fulfill a migration.',
	works: 'everywhere',
	availableOptions: [
		{ name: 'mode', type: String, default: 'prod', 	  aliases: ['m'], description: 'Either \'prod\' (production) (default) or \'dev\' (development). '                               },
    { name: 'base', type: String, default: undefined, aliases: ['b'],	description: 'Directory in which the migration resides. Defaults to \'migrations\' in project base directory.' },
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

    if(!commandOptions.base) {
      commandOptions.base = process.cwd() + '/migrations';
      debug('Migration directory not given, defaulting to: %s', commandOptions.base)
    }

		const Task = this.availableTasks.Up
		const task = new Task({
      migrate: this.superCommand.migrate,
      settings: this.settings,
      cli: this.cli,
			ui: this.ui
		});

		return task.run(commandOptions);
	}
});