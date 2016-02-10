'use strict';

const Promise 	  = require('bluebird');
const SilentError = require('silent-error');

const Command     = require('../models/command');

const debug       = require('debug')('rstc:commands/pwhashgen')

module.exports = Command.extend({
  name: 'pwhashgen',
  description: 'Generate a hash from the given string.',
  works: 'everywhere',
  anonymousOptions: [
    '<password>'
  ],

  run: function (commandOptions, rawArgs) {
    debug('commandOptions: ', commandOptions);
    debug('rawArgs: ', rawArgs);

    commandOptions.password = rawArgs.shift();
    if (!commandOptions.password) {
      this.printDetailedHelp();
      return Promise.resolve();
    }

    const Task = this.availableTasks.Pwhashgen
    const task = new Task({
      ui: this.ui
    });

    return task.run({
      password: commandOptions.password
    });
  }
});