'use strict';

const Task 	= require('../../models/task');
const debug = require('debug')('rstc:tasks/oss/list')

module.exports = Task.extend({
	run: function(options) {
		return this.oss.list(options.iri).then((res) => {
			console.log(res.body);
			resolve();
		});
	}
});