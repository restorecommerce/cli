'use strict';

const Promise			= require('bluebird');
const SilentError = require('silent-error');

const Command 		= require('../../models/command');
const debug 			= require('debug')('rstc:commands/transform');

module.exports = Command.extend({
	name: 'transform',
	description: 'Converts localized text resources in YAML format to JSON-LD resources of type \'/classes/Text\'.\n' +
               'Translated resource destination defaults to a temporary file.',
	works: 'everywhere',
	anonymousOptions: [
    '<yml directory> <destination>'
  ],

  run: function (commandOptions, rawArgs) {
    commandOptions.src = rawArgs.shift();
    if (!commandOptions.src) {
      this.printBasicHelp();
      const message = 'Path to the directory containing \'.yml\' files must be provided.';
      return Promise.reject(new SilentError(message));
    }

    commandOptions.dest = rawArgs.shift();
    if (!commandOptions.dest) {
      const tmp = require('tmp');
      commandOptions.dest = tmp.tmpNameSync();
      const message = 'Destination directory not specified. Defaulting to \'' + commandOptions.dest + '\'.';
      console.log(message);
    }

    const Task = this.availableTasks.Transform
    const task = new Task({
      settings: this.settings,
			cli: this.cli,
      ui: this.ui
    });

    return task.run(commandOptions);
  }
});
