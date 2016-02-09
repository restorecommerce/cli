'use strict';

const Command 		= require('../models/command');
const Promise			= require('bluebird');
const debug 			= require('debug')('rstc:commands/translate');
const SilentError = require('silent-error');

module.exports = Command.extend({
	name: 'translate',
	description: 'Converts localized text resources in YAML format to JSON-LD resources of type "/classes/Text".',
	aliases: ['t'],
	works: 'everywhere',
	availableOptions: [
		{ name: 'project',	type: String, default: undefined, 												description: 'Which project\'s configuration to use (can be overridden).'	},
		{ name: 'entry',		type: String, default: undefined, aliases: ['e'],					description: 'Defaults to specified project\'s entry point.'							},
		{ name: 'apikey',		type: String,	default: undefined, aliases: ['key', 'k'],	description: 'Defaults to specified project\'s api key.'									}
	],

	anonymousOptions: [
    '<directory - defaults to current working directory>'
  ],

	run: function(commandOptions, rawArgs) {

		debug(commandOptions);

		const Task = this.availableTasks.Translate
		const task = new Task({
			ui: this.ui
		});

		return task.run(commandOptions);
	}
});
