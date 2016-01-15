'use strict';

const Command = require('../../models/command');
const Promise = require('bluebird');
const debug 	= require('debug')('rstc:commands/apikey/gen');

// Sub-command of Apikey.
module.exports = Command.extend({
	name: 'gen',
	description: 'Generate a random API key. This will not create the API key in the API.',
  //works: 'insideProject', ?
  
	run: function(commandOptions, rawArgs) {
		const Task = this.availableTasks.Gen;
		const task = new Task({
			ui: this.ui
		});
		
		return task.run();
	}
});