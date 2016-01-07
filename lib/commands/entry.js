'use strict';

const Command = require('../models/command');
const Promise = require('bluebird');

module.exports = Command.extend({
	name: 'entry',
	description: 'The API endpoint to use.',
  aliases: [],
  works: 'insideProject',
  availableOptions: [

  ],

	run: function(options) {
		const Task = this.tasks[this.name];
		const task = new Task({
			ui: this.ui
		});
		
		return task.run();
	}
});