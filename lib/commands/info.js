'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/info')

module.exports = Command.extend({
	name: 'oss',
	description: '',
	//works: 'insideProject',
/*
	availableOptions: [
		{ name: 'project',		type: String, 	default: undefined, aliases: ['p']																																							},
	],
*/
	anonymousOptions: [
    '<command (Default: help)>'
	],
});