'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/oss')

module.exports = Command.extend({
	name: 'oss',
	description: '',
	works: 'insideProject'
});