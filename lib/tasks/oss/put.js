'use strict';

const Promise = require('bluebird');
const Task 		= require('../../models/task');
const debug 	= require('debug')('rstc:tasks/oss/put')


module.exports = Task.extend({
	run: function(options) {
		return new Promise(function(resolve, reject) {
			this.oss.put(options.iri, options.source, options.metaData,
									 options.accessControl, options.formOptions).
									then((res) => {
										console.log(res.body);
										resolve();
									});
		}.bind(this));
	}
});