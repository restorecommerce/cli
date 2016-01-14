'use strict';

const Task = require('../../models/task');
const debug = require('debug')('rstc:tasks/oss/head')

module.exports = Task.extend({
	run: function(options) {
		return this.oss.put(options.iri, options.source, options.metaData,
									options.accessControl, options.formOptions)
						.then((res) => {
							console.log(res.headers);
						});
	}
});