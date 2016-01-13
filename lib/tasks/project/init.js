'use strict';

const Promise 	= require('bluebird');
const Task 			= require('../../models/task');

module.exports = Task.extend({
	run: function(options) {
		return new Promise(function(resolve, reject) {
			// TO DO: Initialize project at options.base
			this.ui.writeLine('Initialized project "'+options.id+'" ('+options.entry+') at: '+options.base+'.');
			resolve();
		}.bind(this));
	}
});