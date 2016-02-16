'use strict';

const Promise     = require('bluebird');

const Task        = require('../../models/task');
const debug       = require('debug')('rstc:tasks/migrate/down');
const SilentError = require('silent-error');

module.exports = Task.extend({
  run: function (options) {
    if (this.cli.verbose) {
      this.migrate.on('retrieveMigration', migration => {
        console.log('retrieved migration %s', migration);
      });

      this.migrate.on('downMigration', migration => {
        console.log('finished reverting migration %s', migration);
      });
    }

    return this.migrate.down(options.migration).then((res) => {
      const message = 'Migration \'' + options.migration+ '\' was succesfully reverted.';
      console.log(message);
    }).catch((err) => {
      const message = 'Failed to revert migration \'' + options.migration + '\'.\n'
      return Promise.reject(new SilentError(message + err));
    });
  }
});