'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/migrate')
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
    '<data source> <data target> -  both directories default to current project\'s directory'
	],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: ', commandOptions);
		debug('rawArgs: ', rawArgs);

    commandOptions.source = rawArgs.shift();
    if(!commandOptions.source) {
      commandOptions.source = path.normalize(process.cwd() + '/');
      debug('Merge data source directory not provided. ' +
            'Using current project (' + commandOptions.source + ' as source.')
    }

    commandOptions.target = rawArgs.shift();
    if(!commandOptions.target) {
      commandOptions.target = path.normalize(process.cwd() + '/');
      debug('Merge data target directory not provided. ' +
            'Using current project (' + commandOptions.target + ' as target.')
    }

    // Don't think this is used anymore.
    if (!commandOptions.host) {
			//this.printBasicHelp();
			const message = 'Application host name for merging data not provided.';
			debug(message);
      //return Promise.reject(new SilentError(message));
		}

		const Task = this.availableTasks.Merge;
		const task = new Task({
			ui: this.ui
		});

		return task.run(commandOptions);
	}
});