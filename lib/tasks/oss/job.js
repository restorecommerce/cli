'use strict';

const Task 	= require('../../models/task');
const debug = require('debug')('rstc:tasks/oss/job')

module.exports = Task.extend({
	run: function(options) {
		const job = options.jobProcessor.start();

		job.on('progress', (task) => {
		  console.log('Progress...', task);
		});

		return job.then((res) => {
      var message = 'Job finished succesfully.' +
        (res ?
          (
            (res.statusCode ? ('\nResponse status code: ' + res.statusCode) : '') +
            (res.message ? ('\n' + res.message) : '')
          ) : ''
        )
      console.log(message);
      return message;
		}).catch((err) => {
      var message = 'Job failed".' +
                    (err ?
                      (
                        (err.statusCode ? ('\nResponse status code: ' + err.statusCode) : '') +
                        (err.message ? ('\n'+err.message) : '')
                      ) : ''
                    )

      return Promise.reject(new SilentError(message));
    });
	}
});