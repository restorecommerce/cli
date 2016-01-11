'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/job')

module.exports = Command.extend({
	name: 'job',
	description: '',
	works: 'insideProject'
});