'use strict';

const Promise			= require('bluebird');
const SilentError = require('silent-error');

const Command 		= require('../models/command');
const debug 			= require('debug')('rstc:commands/translate');
const tmp 	      = require('tmp');

const i18nTmpDir = tmp.tmpNameSync();

module.exports = Command.extend({
	name: 'translate',
	description: 'Converts localized text resources in YAML format to JSON-LD resources of type \'/classes/Text\'.\n' +
               'Translated resource destination directory defaults to a temporary directory.',
	aliases: ['t'],
	works: 'everywhere',
	anonymousOptions: [
    '<i18n manifest> <i18n directory> <destination directory>'
  ],

  run: function (commandOptions, rawArgs) {
    commandOptions.manifest = rawArgs.shift();
    if (!commandOptions.manifest) {
      this.printBasicHelp();
      const message = 'Path to the i18n manifest file must be provided.';
      return Promise.reject(new SilentError(message));
    }

    commandOptions.src = rawArgs.shift();
    if (!commandOptions.src) {
      this.printBasicHelp();
      const message = 'Path to the i18n directory to be used must be provided.';
      return Promise.reject(new SilentError(message));
    }

    commandOptions.dest = rawArgs.shift();
    if (!commandOptions.dest) {
      commandOptions.dest = i18nTmpDir;
      const message = 'Destination directory not specified. Defaulting to \'' + i18nTmpDir + '\'.';
      console.log(message);
    }

    const Task = this.availableTasks.Translate
    const task = new Task({
      settings: this.settings,
			cli: this.cli,
      ui: this.ui
    });

    return task.run(commandOptions);
  }
});
