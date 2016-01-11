'use strict';

const requireAsHash = require('../../utilities/ext/require-as-hash');
const Command       = require('../../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/project/init')
const string 				= require('../../utilities/ext/string');
const SilentError 	= require('silent-error');

// Sub-command of Project.
module.exports = Command.extend({
	name: 'init',
	description: 'This command creates project related config files in the base directory.',
	//works: 'insideProject', ?
	availableOptions: [
		{ name: 'id',    type: String, default: false 				},
		{ name: 'entry', type: String, default: false 				},
		{ name: 'base',  type: String, default: process.cwd() }
	],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		if(!commandOptions.id || !commandOptions.entry) {
    	console.log(this.printBasicHelp(commandOptions));
			const message = 'A project ID and endpoint must be specified.';
			return new Promise.reject(new SilentError(message));
		}

		const Task = this.availableTasks.Init;
		const task = new Task({
			ui: this.ui
		});
		
		return task.run(commandOptions);
	}
});
