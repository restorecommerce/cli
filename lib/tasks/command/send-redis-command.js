'use strict';

const Promise 		= require('bluebird');
const SilentError = require('silent-error');

const Task 				= require('../../models/task');
const debug 			= require('debug')('rstc:tasks/command/send-redis-command');

module.exports = Task.extend({
  run: function (options) {
    if (this.cli.verbose) {

    }

    return this.request.post(options.url).then(res => {
      const message = `Redis command '` + options.path + ` succesfully sent.` +
        (res.statusCode ? (`\nResponse status code: ` + res.statusCode) : ``) +
        (res.message ? (`\n` + res.message) : ``);

      console.log(message);
    }).catch(err => {
      const message = `Failed to send Redis command '` + options.path + `.` +
        (err.statusCode ? (`\nResponse status code: ` + err.statusCode) : ``) +
        (err.message ? (`\n` + err.message) : ``);

      return Promise.reject(new SilentError(message));
    });
  }
});

