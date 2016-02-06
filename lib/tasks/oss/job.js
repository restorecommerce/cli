'use strict';

const Task        = require('../../models/task');
const debug       = require('debug')('rstc:tasks/oss/job')
const chalk       = require('chalk');
const SilentError = require('silent-error')

module.exports = Task.extend({
  run: function (options) {
    const job = options.jobProcessor.start();

    job.on('progress', (task) => {
      if (task.progress.value === 100) {
        if (task.difference === true) {
          console.log(chalk.yellow('Uploaded \'' + task.fullPath + '\''));
        } else {
          console.log(chalk.cyan('Skipped \'' + task.fullPath + '\' as the objects were detected to be identical'));
        }
      }
    });

    return job.then(res => {
      var message = 'Job finished succesfully.' +
                    (res ?
                      (
                        (res.statusCode ? ('\nResponse status code: ' + res.statusCode) : '') +
                        (res.message ? ('\n' + res.message) : '')
                      ) : ''
                    )
      console.log(message);
      return message;
    }).catch(err => {
      var message = 'Job failed".' +
                    (err ?
                      (
                        (err.statusCode ? ('\nResponse status code: ' + err.statusCode) : '') +
                        (err.message ? ('\n' + err.message) : '')
                      ) : ''
                    )

      return Promise.reject(new SilentError(message));
    });

  }
});