'use strict';

const Task = require('../../models/task');
const debug = require('debug')('rstc:tasks/oss/head')

module.exports = Task.extend({
	run: function(options) {
		return this.oss.head(options.iri).then((res) => {
			console.log(res.headers);
		});
	}
});