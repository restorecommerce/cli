'use strict';

const Promise     = require('bluebird');
const Task        = require('../../models/task');
const debug       = require('debug')('rstc:tasks/migrate/create');
const SilentError = require('silent-error');

module.exports = Task.extend({
  run: function (options) {
    return this.migrate.create(options.base, options.migration).then(res => {
      const message = 'Migration \'' + options.migration + '\' was succesfully created.';
      console.log(message);
    }).catch(err => {
      const message = 'Failed to create migration \'' + options.migration + '\'.\n'
      return Promise.reject(new SilentError(message + err));
    });
  }
});