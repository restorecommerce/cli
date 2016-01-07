'use strict';

const Promise 	= require('bluebird');
const Task 			= require('../models/task');

module.exports = Task.extend({
	run: function(options) {
		return new Promise(function(resolve, reject) {
			this.ui.writeInfoLine('*Help*');
			resolve();
		}.bind(this));
	}
});