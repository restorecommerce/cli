'use strict';

const Command = require('../models/command');
const Promise = require('bluebird');

module.exports = Command.extend({
	name: 'genapikey',
	description: 'Generate an API key.',
  aliases: [],
  //works: 'insideProject',
  availableOptions: [

  ],

	run: function(options) {
		const Task = this.tasks.Genapikey;
		const task = new Task({
			ui: this.ui
		});
		
		return task.run();
	}
});