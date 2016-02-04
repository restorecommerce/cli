'use strict';

const Task 	= require('../../models/task');
const debug = require('debug')('rstc:tasks/oss/job')

module.exports = Task.extend({
	run: function(options) {
		const job = options.jobProcessor.start();

		job.on('progress', (task) => {
		  console.log('Progress...', task);
		});

		return job;
	}
});