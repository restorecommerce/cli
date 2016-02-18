'use strict';

const Promise 		= require('bluebird');
const SilentError = require('silent-error');

const Task 				= require('../../models/task');
const debug 			= require('debug')('rstc:tasks/command/reindex');

module.exports = Task.extend({
  run: function (options) {
    if (this.cli.verbose) {

    }

    return this.request.post(options.url).then(res => {
      const message = `Succesfully reindexed Elastic.` +
        (res.statusCode ? (`\nResponse status code: ` + res.statusCode) : ``) +
        (res.message ? (`\n` + res.message) : ``);

      console.log(message);
    }).catch(err => {
      const message = `Failed to reindex Elastic.` +
        (err.statusCode ? (`\nResponse status code: ` + err.statusCode) : ``) +
        (err.message ? (`\n` + err.message) : ``);

      return Promise.reject(new SilentError(message));
    });
  }
});

