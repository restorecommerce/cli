'use strict';

const requireAsHash = require('../utilities/ext/require-as-hash');
const Command 			= require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/apikey')
const string 				= require('../utilities/ext/string');
const SilentError 	= require('silent-error');

module.exports = Command.extend({
	name: 'init',
	description: 'This command creates project related config files in the base directory.',
	//works: 'insideProject', ?

	initialize: function() {
		//this.superCommand = project;
		this.availableTasks = this.lookupAvailableCommands();
	},

	run: function(commandOptions, rawArgs) {
		this.initialize();

		if (rawArgs.length === 0) {
			//const message = ""
			return new Promise.reject(/*new SilentError(message)*/);
		}

		const Task = this.availableTasks.Init;
		const task = new Task({
			ui: this.ui
		});
		
		return task.run();
	}
});
