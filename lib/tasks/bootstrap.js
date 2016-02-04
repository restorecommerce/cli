'use strict';

const Task 			    = require('../models/task');
const debug         = require('debug')('rstc:task/bootstrap')
const Bootstrapper  = require('restore-bootstrap');

module.exports = Task.extend({
  run: function (options) {
    const bootstrapper = Bootstrapper({
      directory: options.directory,
      entry: options.entry,
      apiKey: options.apiKey
    });

    return bootstrapper.run().then((res) => {
      console.log(res);
    });
  }
});