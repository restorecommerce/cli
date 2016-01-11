'use strict';

const Command 		= require('../models/command');
const SilentError = require('silent-error');
const chalk 			= require('chalk');

module.exports = Command.extend({
  skipHelp: true,

  printBasicHelp: function() {
    this.ui.writeLine(chalk.red('No help entry for \'' + this.commandName + '\''));
  },

  validateAndRun: function() {
    throw new SilentError('The specified command "' + this.commandName +
                          '" is invalid. For available options, see "rstc help".');
  }
});
