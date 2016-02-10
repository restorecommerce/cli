'use strict';

const Promise     = require('bluebird');
const Task        = require('../../models/task');
const debug       = require('debug')('rstc:tasks/oss/list');
const SilentError = require('silent-error');

module.exports = Task.extend({
  run: function (options) {
    return this.oss.list(options.iri).then(res => {
      const iri = options.iri.replace(/[\/]/g, '');
      const list = res.body[iri];
      console.log(list);
    }).catch(err => {
      var message = 'Failed to retrieve resource "' + options.iri + '".' +
      	            (err.statusCode ? ('\nResponse status code: ' + err.statusCode) : '') +
                    (err.message ? ('\n' + err.message) : '');

      return Promise.reject(new SilentError(message));
    });
  }
});