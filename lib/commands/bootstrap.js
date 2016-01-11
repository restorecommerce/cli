'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/bootstrap')

module.exports = Command.extend({
	name: 'bootstrap',
	description: ' ',
	works: 'everywhere'
});