'use strict';

var Command 		= require('../models/command');
var Promise			= require('bluebird');
var SilentError = require('silent-error');
var chalk 			= require('chalk');

module.exports = Command.extend({
	name: null, // Passed in on creation.
	description: 'Command not found.',

	printBasicHelp: function() {
		this.ui.writeError(chalk.red('No help entry for \'' + this.name + '\''));
	},

	validate: function() {
		throw new SilentError('The specified command ' + this.name +
			' is invalid. For available options, see \'rstc help\'.');
	}
});