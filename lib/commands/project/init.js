'use strict';

const Command       = require('../../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/project/init')
const SilentError 	= require('silent-error');
const fs 						= require('fs');

// Sub-command of Project.
module.exports = Command.extend({
	name: 'init',
	description: 'This command creates project related configuration files in the base directory.',
	//works: 'insideProject', ?
	availableOptions: [
		{ name: 'id',    type: String, default: undefined 																												},
		{ name: 'entry', type: String, default: undefined 																												},
		{ name: 'base',  type: String, default: undefined, description: 'Defaults to current working directory.' 	}
	],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		if (!commandOptions.id || !commandOptions.entry) {
			console.log(this.printBasicHelp(commandOptions));
			const message = 'A project ID and endpoint must be specified.';
			return new Promise.reject(new SilentError(message));
		}

		// TO DO: Validate commandOptions.entry.

		if (!commandOptions.base) commandOptions.base = process.cwd();
		else {
			try {
				fs.stat(commandOptions.base, (err, stats) => {
					if (err || !stats.isDirectory()) {
						const message = 'Directory "' + commandOptions.base + '" doesn\'t exist.'
						throw new SilentError(message)
					}
				});
			} catch (err) {
				return new Promise.reject(err);
			}
		}

		const Task = this.availableTasks.Init;
		const task = new Task({
			ui: this.ui
		});

		return task.run(commandOptions);
	}
});