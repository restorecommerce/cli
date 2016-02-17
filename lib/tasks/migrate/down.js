'use strict';

const Promise     = require('bluebird');

const Task        = require('../../models/task');
const debug       = require('debug')('rstc:tasks/migrate/down');
const SilentError = require('silent-error');

module.exports = Task.extend({
  run: function (options) {
    if (this.cli.verbose) {
      this.migrate.on('retrieveMigration', migrations => {
        console.log('retrieved migrations: \n%s', migrations);
      });

      this.migrate.on('downMigration', migration => {
        console.log('removed migration %s', migration);
      });
    }

    return this.migrate.down(options.all, options.migration).then(() => {
      const message = options.all ? 'All migrations were sucessfully removed from the resource.' :
                      'Migration \'' + options.migration + '\' was succesfully removed from the resource.';
      console.log(message);
    }).catch(err => {
      const message = options.all ? 'Failed to remove all migrations from the resource.' :
                      'Failed to remove migration \'' + options.migration + '\' from the resource.';
      return Promise.reject(new SilentError(message + err));
    });
  }
});