'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/apikey')

module.exports = Command.extend({
	name: 'apikey',
	description: 'API key related commands.',
	works: 'insideProject',

  anonymousOptions: [
    '<api-key>'
  ]
});