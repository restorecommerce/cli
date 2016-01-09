'use strict';

const Promise 	= require('bluebird');
const Task 			= require('../models/task');

module.exports = Task.extend({
	run: function(options) {
		return new Promise(function(resolve, reject) {
			const endpoint = null;
			this.ui.writeInfoLine('Endpoint: ' + endpoint);
			resolve();
		}.bind(this));
	}
});