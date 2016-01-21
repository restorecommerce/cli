'use strict';

const Promise 		= require('bluebird');
const Task 				= require('../../models/task');
const fs 					= require('fs');
const jsonfile 		= require('jsonfile')
const debug 			= require('debug')('rstc:tasks/gss/import-file');
const SilentError = require('silent-error');

module.exports = Task.extend({
	run: function(options) {
		return new Promise(function(resolve, reject) {
			this.gss.importFile(options.file, options.resource);

			this.gss.on('importFile', function(file) {
				console.log('importing %s', file);
			});

			this.gss.on('response', function(res, file) {
				console.log('importing %s finished, response status code %s', file, res.statusCode);
				resolve();
			});

			this.gss.on('error', function(res, file) {
				var message = 'importing ' + file + ' failed, ';
				if (res.statusCode) message += 'response status code ' + res.statusCode;
					else message += 'error - \n' + res;

				reject(new SilentError(message));
			});
			
		}.bind(this));
	}
});