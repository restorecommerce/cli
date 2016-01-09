'use strict';

const Promise = require('bluebird');
const Task 		= require('../models/task');
const uuidGen 	= require('../utilities/uuidgen');
const debug 	= require('debug')('rstc:tasks/uuidgen')

module.exports = Task.extend({
	run: function(options) {
		return new Promise(function(resolve, reject) {
			const id = uuidGen.gen();
			this.ui.writeInfoLine('Generated ID: ' + id);
			resolve();
		}.bind(this));
	}
});