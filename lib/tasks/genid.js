'use strict';

const Promise = require('bluebird');
const Task 		= require('../models/task');
const idGen 	= require('../utilities/idGen');
const debug 	= require('debug')('rstc:lib/cli/tasks/genid')

module.exports = Task.extend({
	run: function(options) {
		return new Promise(function(resolve, reject) {
			const id = idGen.gen();
			this.ui.writeInfoLine('Generated ID: ' + id);
			resolve();
		}.bind(this));
	}
});