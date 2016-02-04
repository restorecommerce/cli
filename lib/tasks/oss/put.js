'use strict';

const Promise     = require('bluebird');
const Task        = require('../../models/task');
const debug       = require('debug')('rstc:tasks/oss/put');
const SilentError = require('silent-error');

module.exports = Task.extend({
  run: function (options) {
    return this.oss.put(options.iri, options.source, options.metaData,
      options.accessControl, options.formOptions)
      .then((res) => {
        var message = 'Resource "' + options.iri + '" was succesfully created.' +
          (res.statusCode ? ('\nResponse status code: ' + res.statusCode) : '') +
          (res.message ? ('\n' + res.message) : '');

        console.log(message);
        return message;
      }).catch((err) => {
        var message = 'Failed to create resource "' + options.iri + '".' +
          (err.statusCode ? ('\nResponse status code: ' + err.statusCode) : '') +
          (err.message ? ('\n' + err.message) : '');

        return Promise.reject(new SilentError(message));
      });
  }
});