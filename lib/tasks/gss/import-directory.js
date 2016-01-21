'use strict';

const Promise 		= require('bluebird');
const Task 				= require('../../models/task');
const debug 			= require('debug')('rstc:tasks/gss/import-directory');
const SilentError = require('silent-error');

module.exports = Task.extend({
	run: function(options) {
		return new Promise(function(resolve, reject) {
			this.gss.importDir(options.directory, options.resource);

			this.gss.on('importFile', function(file) {
				console.log('importing %s', file);
			});

			this.gss.on('response', function(res, file) {
				console.log('importing %s finished, response status code %s', file, res.statusCode);
			});

			this.gss.on('error', function(res, file) {
				var message = 'importing ' + file + ' failed, ';
				if (res.statusCode) message += 'response status code ' + res.statusCode;
					else message += 'error - \n' + res;

				reject(new SilentError(message));
			});
			
			resolve(); // How to tell when all files have been imported?
		}.bind(this));
	}
});