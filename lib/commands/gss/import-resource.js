'use strict';

const Promise 			= require('bluebird');
const SilentError 	= require('silent-error');

const Command       = require('../../models/command');
const confirm       = require('../../utilities/confirm');
const debug 				= require('debug')('rstc:commands/gss/import-resource');

// Sub-command of Gss.
module.exports = Command.extend({
	name: 'import-resource',
	description: 'Import a single resource or a directory.',
	works: 'everywhere',

	anonymousOptions: [
    '<resource or directory> <resource>'
  ],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		if (!this.superCommand.gss) {
			const message = 'System error: Either a Graph Storage Service Client was not' +
											' succesfully created in command "' + this.superCommand.name +
											'" or it wasn\'t passed down to command "' + this.name + '".';
			throw Error(message);
		}

		commandOptions.path = rawArgs.shift();

   	if(!commandOptions.path) {
			this.printBasicHelp();
      const message = 'A resource or a directory to import must be given.';
      return Promise.reject(new SilentError(message));
   	}

   	commandOptions.resource = rawArgs.shift();

   	if (!commandOptions.resource) {
      this.printBasicHelp();
      const message = 'A resource to import to must be given.';
      return Promise.reject(new SilentError(message));
   	}

    return confirm.importing(commandOptions.path, commandOptions.entry).then(() => {
      const Task = this.availableTasks.ImportResource;
      const task = new Task({
        gss: this.superCommand.gss,
        cli: this.cli,
        ui: this.ui
      });

      return task.run(commandOptions);
    });
  }
});