'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/info')

module.exports = Command.extend({
	name: 'info',
	description: '',
	works: 'insideProject'
});