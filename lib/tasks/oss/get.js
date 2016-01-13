'use strict';

const Promise = require('bluebird');
const Task 		= require('../../models/task');
const debug 	= require('debug')('rstc:tasks/oss/get')


module.exports = Task.extend({
	run: function(options) {
		return new Promise(function(resolve, reject) {
			this.oss.get(options.iri, options.meta).then((res) => {
				console.log(res.body);
				resolve();
			});
		}.bind(this));
	}
});