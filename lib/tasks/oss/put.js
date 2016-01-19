'use strict';

const Task = require('../../models/task');
const debug = require('debug')('rstc:tasks/oss/head')

module.exports = Task.extend({
	run: function(options) {
		return this.oss.put(options.iri, options.source, options.metaData,
												options.accessControl, options.formOptions)
						.then((res) => {
							if(res.statusCode == 201) {
								console.log('Resource succesfully created.');
								console.log(res);
							} else {
								console.log(chalk.red('Resource not created:'));
								console.log(chalk.red(res));
							}
						});
	}
});