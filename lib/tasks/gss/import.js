'use strict';

const Promise 		= require('bluebird');
const SilentError = require('silent-error');

const Task 				= require('../../models/task');
const debug 			= require('debug')('rstc:tasks/gss/import');

module.exports = Task.extend({
  run: function (options) {
    if (this.cli.verbose) {
      this.gss.on('importFile', file => {
        console.log('importing %s', file);
      });

      this.gss.on('response', (res, file) => {
        const message = `importing ${file} finished` +
                        (
                          res ? (
                            res.statusCode ? (`, response status code: ${res.statusCode}`) : ``
                          ) : ``
                        );
        console.log(message);
      });
    }

    this.gss.on('allImportsStarted', file => {
      console.log('All ' + file + ' resources have been read and they\'re being put on the server.');
    });

    return this.gss.import(options.path, options).then(res => {
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

