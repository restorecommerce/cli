'use strict';

const Task 	= require('../../models/task');
const debug = require('debug')('rstc:tasks/oss/get')

module.exports = Task.extend({
	run: function(options) {
		return this.oss.get(options.iri).then((res) => {
			console.log(res.headers);
			console.log(res.body)
		});
	}
});