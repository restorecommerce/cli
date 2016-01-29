'use strict';

const Promise     = require('bluebird');
const Task        = require('../../models/task');
const debug       = require('debug')('rstc:tasks/gss/import-file');
const SilentError = require('silent-error');

module.exports = Task.extend({
  run: function (options) {
    this.gss.on('importFile', function (file) {
      console.log('Importing: "%s"', file);
    });

    return this.gss.importFile(options.path, options.resource).then((res) => {
      var message = 'Finished importing "' + options.path + '".' +
                     (res.statusCode ? ('\nResponse status code: ' + res.statusCode) : '') +
                     (res.message ? ('\n' + res.message) : '');

      console.log(message);
      return message;
    }).catch((err) => {
      var message = 'Failed to import "' + options.path + '".' +
                    (err.statusCode ? ('\nResponse status code: ' + err.statusCode) : '') +
                    (err.message ? ('\n'+err.message) : '');

      return new Promise.reject(new SilentError(message));
    });
  }
});