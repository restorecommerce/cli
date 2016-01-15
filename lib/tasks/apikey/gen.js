'use strict';

const Promise 	= require('bluebird');
const Task 			= require('../../models/task');
const apiKeyGen = require('../../utilities/apiKeyGen');

module.exports = Task.extend({
	run: function(options) {
		return new Promise(function(resolve, reject) {
			const key = apiKeyGen.gen();
			this.ui.writeInfoLine('Generated API key: ' + key);
			resolve(key);
		}.bind(this));
	}
});