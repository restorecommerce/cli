'use strict';

const Promise     = require('bluebird');

const Task        = require('../../models/task');
const debug       = require('debug')('rstc:tasks/migrate/up');
const SilentError = require('silent-error');

module.exports = Task.extend({
  run: function (options) {
    if (this.cli.verbose) {
      this.migrate.on('retrieveMigration', migrations => {
        console.log('retrieved migrations: \n', migrations);
      });

      this.migrate.on('runMigration', migration => {
        console.log('finished running migration %s tasks', migration);
      });

      this.migrate.on('commitMigration', migration => {
        console.log('uploaded migration %s to the server', migration);
      });

      this.migrate.on('upMigration', migration => {
        console.log('finished migration %s', migration);
      });
    }

    return this.migrate.up(options.base, options.mode).then(() => {
      const message = 'Migration \'' + options.base + '\' was succesfully fulfilled.';
      console.log(message);
    }).catch(err => {
      const message = 'Failed to fulfill migration \'' + options.base + '\'.\n'
      return Promise.reject(new SilentError(message + err));
    });
  }
});

