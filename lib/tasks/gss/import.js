'use strict';

const Promise 		= require('bluebird');
const Task 				= require('../../models/task');
const debug 			= require('debug')('rstc:tasks/gss/import');
const SilentError = require('silent-error');

module.exports = Task.extend({
  run: function (options) {
    this.gss.on('importFile', function (file) {
      console.log('importing %s', file);
    });

    this.gss.on('response', function(res, file) {
			console.log('importing %s finished, response status code %s', file, res.statusCode);
		});

    return this.gss.import(options.path, options).then((res) => {
      var message = 'Finished importing "' + options.path + '".' +
                    (res.statusCode ? ('\nResponse status code: ' + res.statusCode) : '') +
                    (res.message ? ('\n' + res.message) : '');

      console.log(message);
      return message;
    }).catch((err) => {
      var message = 'Failed to import "' + options.path + '".' +
                    (err.statusCode ? ('\nResponse status code: ' + err.statusCode) : '') +
                    (err.message ? ('\n' + err.message) : '');

      return new Promise.reject(new SilentError(message));
    });
  }
});

