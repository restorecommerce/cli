'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/merge')
const SilentError 	= require('silent-error');
const string        = require('../utilities/ext/string');
const path          = require('path');

module.exports = Command.extend({
	name: 'merge',
	description: '',
	works: 'insideProject',
	availableOptions: [
		{ name: 'host',		type: String,          default: undefined,  aliases: [],	  description: 'Application\'s host name to append to "resourceType".' },
		{ name: 'ignore', type: [String, Array], default: undefined,  aliases: ['i'], description: 'Resources to ignore from merging.'                     }
	],

	anonymousOptions: [
    '<data source> <data target>'
	],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: ', commandOptions);
		debug('rawArgs: ', rawArgs);

    commandOptions.source = rawArgs.shift();
    if(!commandOptions.source) {
			this.printBasicHelp();
			const message = 'A data source directory must be specified.';
			throw new SilentError(message);
		}

    commandOptions.target = rawArgs.shift();
    if(!commandOptions.target) {
			this.printBasicHelp();
			const message = 'A data target directory must be specified.';
			throw new SilentError(message);
		}

    if (!commandOptions.host) {
			//this.printBasicHelp();
			const message = 'Application host name for merging data not provided.';
			debug(message);
      //throw new SilentError(message);
		}

		const Task = this.availableTasks.Merge;
		const task = new Task({
      cli: this.cli,
			ui: this.ui
		});

		return task.run(commandOptions);
	}
});