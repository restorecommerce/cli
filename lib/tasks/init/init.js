'use strict';

const Promise 	= require('bluebird');
const Task 			= require('../../models/task');

module.exports = Task.extend({
	run: function(options) {
		return new Promise(function(resolve, reject) {
			const key = apiKeyGen.gen();
			this.ui.writeInfoLine('Initialized project in: ' + 'baseDir');
			resolve();
		}.bind(this));
	}
});