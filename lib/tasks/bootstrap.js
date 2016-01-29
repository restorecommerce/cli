'use strict';

const Promise		= require('bluebird');
const Task 			= require('../models/task');
const debug 		= require('debug')('rstc:task/bootstrap')
const bootstrap = require('restore-bootstrap');

module.exports = Task.extend({
	run: function(options) {
		return new Promise(function(resolve, reject) {
			bootstrap.configure({
				directory: options.directory,
				endpoint: options.entry,
				apiKey: options.apiKey
			}, () => {
				// Run must return a promise.
				bootstrap.run();
				resolve();
			});
		});
	}
});