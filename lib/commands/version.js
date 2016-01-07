'use strict';

const Command 		= require('../models/command');
const debug 			= require('debug')('rstc:commands/version')

module.exports = Command.extend({
  name: 'version',
  description: 'Outputs restore-cli version.',
  aliases: ['v', '--version', '-v'],
  works: 'everywhere',

  availableOptions: [
    { name: 'verbose', type: Boolean, default: false }
  ],

  run: function(commandOptions, rawArgs) {
    var versions = process.versions;
    versions['npm'] = require('npm').version;
    versions['os'] = process.platform + ' ' + process.arch;

    var alwaysPrint = ['node', 'npm', 'os'];

    for (var module in versions) {
      if (options.verbose || alwaysPrint.indexOf(module) > -1) {
        this.printVersion(module, versions[module]);
      }
    }
  },

  printVersion: function(module, version) {
    this.ui.writeLine(module + ': ' + version);
  }
});

