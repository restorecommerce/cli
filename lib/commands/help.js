'use strict';

const Command = require('../models/command');
const Promise = require('bluebird');

module.exports = Command.extend({
	name: 'help',
	description: 'Print all the available commands and what they\'re used for.',
	aliases: ['h'],
	//works: 'everywhere',
  availableOptions: [

  ],

	run: function(options) {
		const Task = this.tasks.Help
		const task = new Task({
			ui: this.ui
		});
		
		return task.run();
	},
});