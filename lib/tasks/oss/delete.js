'use strict';

const Task 	= require('../../models/task');
const debug = require('debug')('rstc:tasks/oss/delete')

module.exports = Task.extend({
	run: function(options) {
		return this.oss.delete(options.iri).then((res) => {
			console.log(res.body);
		});
	}
});