'use strict';

const Command = require('../models/command');
const Promise = require('bluebird');
const debug 	= require('debug')('rstc:commands/key')

module.exports = Command.extend({
	name: 'key',
	description: 'The API key to use.',
	aliases: [],
	//works: 'insideProject',
  availableOptions: [

  ],
  
	run: function(options) {
		debug('Running')
		const Task = this.tasks[this.name];
		const task = new Task({
			ui: this.ui
		});

		return task.run();
	},
});