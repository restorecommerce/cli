'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/info')

module.exports = Command.extend({
	name: 'info',
	description: 'Print information about the current project. For example, the current API entry point.',
	aliases: ['i'],
	//works: 'insideProject',

	availableOptions: [
		{ name: 'all',			type: String,	default: undefined, aliases: ['a'] },
		{ name: 'project',	type: String, default: undefined, aliases: ['p'] },
	],

	anonymousOptions: [
    '<option (Default: --all)>'
	],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: ', commandOptions);
		debug('rawArgs: ', rawArgs);

		if (commandOptions.all || !Object.keys(commandOptions).length) {
			// Print everything.
		} else {

		}
	}
});