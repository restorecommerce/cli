'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/migrate')
const SilentError 	= require('silent-error');
const string        = require('../utilities/ext/string');

module.exports = Command.extend({
	name: 'merge',
	description: '',
	works: 'insideProject',

	availableOptions: [
		{ name: 'host',		type: String,          default: undefined, aliases: ['h'],	description: 'Application\'s host name.'},
		{ name: 'filter', type: [String, Array], default: undefined,	aliases: ['f'], description: 'Resources to filter out.' }
	],

	anonymousOptions: [
    '<target - defaults to current project>'
	],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: ', commandOptions);
		debug('rawArgs: ', rawArgs);

    commandOptions.target = rawArgs.shift();
    if(!commandOptions.target) {
      commandOptions.target = process.cwd();
      debug('Merge data target directory not provided.' +
            'Using current project (' + commandOptions.target + ' as target.')
    }

    // Don't think this is used anymore.
		/*
    if (!commandOptions.host)
			this.printBasicHelp();
			const message = 'Application host name not provided.';
			return Promise.reject(new SilentError(message));
		}
    */

		const Task = this.availableTasks.Merge;
		const task = new Task({
			ui: this.ui
		});

		return task.run(commandOptions);
	}
});