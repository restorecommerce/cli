'use strict';

const Promise 		= require('bluebird');
const SilentError = require('silent-error');

const Task 				= require('../../models/task');
const debug 			= require('debug')('rstc:tasks/gss/import-resource');

module.exports = Task.extend({
  run: function (options) {
    if (this.cli.verbose) {
      this.gss.on('importFile', file => {
        console.log('importing %s', file);
      });

      this.gss.on('response', (res, file) => {
        console.log('importing %s finished, response status code %s', file, res.statusCode);
      });
    }

    return this.gss.importResource(options.path, options.resource).then(res => {
      const message = 'Finished importing "' + options.path + '".' +
                      (
                        res ? (
                          (res.statusCode ? ('\nResponse status code: ' + res.statusCode) : '') +
                          (res.message ? ('\n' + res.message) : '')
                        ) : ''
                      );

      console.log(message);
    }).catch(err => {
      const message = 'Failed to import "' + options.path + '".' +
                      (err.statusCode ? ('\nResponse status code: ' + err.statusCode) : '') +
                      (err.message ? ('\n' + err.message) : '');

      return Promise.reject(new SilentError(message));
    });
  }
});