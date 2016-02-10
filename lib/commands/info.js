'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/info')

module.exports = Command.extend({
	name: 'info',
	description: 'Print the information about a project or all project\'s in the current project\'s directory.',
	aliases: ['i'],
	works: 'everywhere',
	availableOptions: [
		{ name: 'base',   	type: String,   default: undefined, aliases: ['b'],   description: 'Defaults to current working project\'s directory.'  },
    { name: 'project',  type: String,   default: undefined, aliases: ['p']                                                              	      },
		{ name: 'all',      type: Boolean,  default: undefined, aliases: ['a'],   description: 'Display information about all projects.'            }
   ],

	run: function(commandOptions, rawArgs) {
		if (!commandOptions.base) {
      commandOptions.base = process.cwd();
    }

		debug('commandOptions: ', commandOptions);

		if (commandOptions.all || commandOptions.project) {
      const Task = this.availableTasks.Info;
			const task = new Task({
				ui: this.ui
			});
			return task.run(commandOptions);
		} else {
			this.printBasicHelp();
      console.log('Either specify a project whose information to display' +
                  'or run with the \'--all\' option to display all project information.')
			return Promise.resolve();
    }
	}
});