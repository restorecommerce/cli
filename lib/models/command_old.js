'use strict';

const Promise = require('bluebird');
const CoreObject = require('core-object');
const debug = require('debug')('rstc:cli/models/command')

module.exports = CoreObject.extend({
	run: function() {
		throw new Error('Command ' + this.name + 'doesn\'t have a "run()" method.');
	},

	validate: function() {
		debug('Validating')
		return Promise.resolve();
	},

	hook: function() {
		debug('Hooking onto')
		return Promise.resolve();
	},

	printBasicHelp: function() {
		this.ui.writeLine(this.description);
	},

	printDetailedHelp: this.printBasicHelp
});