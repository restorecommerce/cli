'use strict';

const Promise     = require('bluebird');
const Task        = require('../../models/task');
const debug       = require('debug')('rstc:tasks/oss/get');
const SilentError = require('silent-error');

module.exports = Task.extend({
	run: function(options) {
		return this.oss.get(options.iri).then(res => {
      console.log(res.body);
		}).catch(err => {
      var message = 'Failed to retrieve resource "' + options.iri + '".' +
                    (err.statusCode ? ('\nResponse status code: ' + err.statusCode) : '') +
                    (err.message ? ('\n'+err.message) : '');

      return Promise.reject(new SilentError(message));
    });
	}
});