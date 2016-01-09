'use strict';

const Command = require('../../models/command');
const Promise = require('bluebird');

module.exports = Command.extend({
	name: 'gen',
	description: 'Generate a random API key. This will not create the API key in the API.',
  //works: 'insideProject', ?

  initialize: function() {
  	//this.superCommand = apikey;
		this.availableTasks = this.lookupAvailableTasks();
  },

	run: function(commandOptions, rawArgs) {
		this.initialize();

		const Task = this.availableTasks.Gen;
		const task = new Task({
			ui: this.ui
		});
		
		return task.run();
	}
});