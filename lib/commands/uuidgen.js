'use strict';

const Command = require('../models/command');
const Promise = require('bluebird');
const debug 	= require('debug')('rstc:commands/uuidgen')

module.exports = Command.extend({
	name: 'uuidgen',
	description: 'Generate an ID.',
  //works: 'insideProject',
  
	run: function(options) {
		const Task = this.tasks.Uuidgen;
		const task = new Task({
			ui: this.ui
		});

		return task.run();
	},
});