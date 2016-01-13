'use strict';

const Promise = require('bluebird');
const Task 		= require('../../models/task');
const debug 	= require('debug')('rstc:tasks/oss/list')


module.exports = Task.extend({
	run: function(options) {
		return new Promise(function(resolve, reject) {
			this.oss.list(options.iri).then((res) => {
				console.log(res.body);
				resolve();
			});
		}.bind(this));
	}
});