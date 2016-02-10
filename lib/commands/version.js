'use strict';

const Command = require('../models/command');
const debug   = require('debug')('rstc:commands/version')
const Promise = require('bluebird');

module.exports = Command.extend({
  name: 'version',
  description: 'Outputs restore-cli version.',
  aliases: ['v', '--version', '-v'],
	works: 'everywhere',

  run: function() {
    console.log(this.cli.version);
    return Promise.resolve();
  }
});


