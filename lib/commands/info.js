'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/info')

module.exports = Command.extend({
	name: 'info',
	description: 'Print the information about a project.',
	aliases: ['i'],
	works: 'everywhere',

	availableOptions: [
		{ name: 'base',   	type: String,   default: undefined, aliases: ['b'],   description: 'Defaults to current working directory.' },
		{ name: 'all',      type: Boolean,  default: undefined, aliases: ['a'] },
		{ name: 'project',  type: String,   default: undefined, aliases: ['p'] }
   ],

	run: function(commandOptions, rawArgs) {
		if (!commandOptions.base) commandOptions.base = process.cwd();
		debug('commandOptions: ', commandOptions);

		if (commandOptions.all || commandOptions.project) {
      const Task = this.availableTasks.Info;
			const task = new Task({
				ui: this.ui
			});
			return task.run(commandOptions);
		} else {
			this.printDetailedHelp();
      console.log('Either specify a project who\'s information to display' +
                  'or the \'--all\' option to display all project information.')
			return Promise.resolve();
    }
	}
});