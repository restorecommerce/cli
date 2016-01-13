'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/project')

module.exports = Command.extend({
	name: 'project',
	description: 'Project related commands.',
	works: 'insideProject',

	anonymousOptions: [
    '<command-name>'
  ]
});