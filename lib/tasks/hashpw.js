'use strict';

const Promise  = require('bluebird');
const Task 		 = require('../models/task');
const password = require('../utilities/password');

module.exports = Task.extend({
	run: function(options) {
		return new Promise(function(resolve, reject) {
			const hashedPassword = password.hash(options.password);
			this.ui.writeInfoLine('Hashed password: ' + hashedPassword);
			resolve();
		}.bind(this));
	}
});