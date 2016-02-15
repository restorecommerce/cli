'use strict';

const Promise     = require('bluebird');
const SilentError = require('silent-error');

const Task        = require('../../models/task');
const debug       = require('debug')('rstc:tasks/oss/delete');

module.exports = Task.extend({
  run: function (options) {
    return this.oss.delete(options.iri).then(res => {
      var message = 'Resource "' + options.iri + '" was succesfully removed.' +
                    (res.statusCode ? ('\nResponse status code: ' + res.statusCode) : '') +
                    (res.message ? ('\n' + res.message) : '');

      console.log(message);
    }).catch(err => {
      var message = 'Failed to remove resource "' + options.iri + '".' +
                    (err.statusCode ? ('\nResponse status code: ' + err.statusCode) : '') +
                    (err.message ? ('\n' + err.message) : '');

      return Promise.reject(new SilentError(message));
    });
  }
});