'use strict';

const Promise			= require('bluebird');
const SilentError = require('silent-error');

const validate    = require('../utilities/validate');

const Command 		= require('../models/command');
const debug 			= require('debug')('rstc:commands/bootstrap');

module.exports = Command.extend({
	name: 'bootstrap',
	description: 'Used to bootstrap the application\'s API.',
	aliases: ['b', 'boot'],
	works: 'insideProject',
	availableOptions: [
		{ name: 'project',	type: String, default: undefined, 												description: 'Which project\'s configuration to use (can be overridden).'	},
		{ name: 'entry',		type: String, default: undefined, aliases: ['e'],					description: 'Defaults to specified project\'s entry point.'							},
		{ name: 'apikey',		type: String,	default: undefined, aliases: ['key', 'k'],	description: 'Defaults to specified project\'s api key.'									},
	  { name: 'protocol',	type: String,	default: 'http',	  aliases: [],				 	  /* description: 'Defaults to "http".' */ 															    }
  ],

	anonymousOptions: [
    '<directory - defaults to current working project\'s directory>'
  ],

	run: function(commandOptions, rawArgs) {
    commandOptions.apiKey = commandOptions.apikey;
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		try {
			commandOptions = validate.applicationOptions(this, commandOptions, this.settings);
		} catch (e) {
			return Promise.reject(e);
		}

    commandOptions.apiKey = commandOptions.apikey;
    delete commandOptions.apikey;

		commandOptions.directory = rawArgs.shift();
		if(!commandOptions.directory) {
      commandOptions.directory = process.cwd();
    }

		debug('Bootstrapping with options: %o', commandOptions);

		const Task = this.availableTasks.Bootstrap
		const task = new Task({
			ui: this.ui
		});

		return task.run(commandOptions);
	}
});