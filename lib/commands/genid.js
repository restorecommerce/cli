'use strict';

const Command = require('../models/command');
const Promise = require('bluebird');
const debug 	= require('debug')('rstc:lib/cli/commands/genid')

module.exports = Command.extend({
	name: 'genid',
	description: 'Generate an ID.',
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