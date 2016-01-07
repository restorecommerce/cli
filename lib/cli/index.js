'use strict';

const Command       = require('../models/command');
const commands      = require('../commands');
const Task          = require('../models/task');
const tasks         = require('../tasks/');
const pkg           = require('../../package.json');
const CLI           = require('./cli');
const UI            = require('./ui');

(function() {
  const ui = new UI({
    inputStream: process.stdin,
    outputStream: process.stdout,
    errorStream: process.stderr
  });

  const cli = new CLI({
    name: 'rstc',
    version: pkg.version,
    npmPackage: 'restore-cli',
    ui: ui
    //analytics: leek,
    //testing: testing,
    //root: path.resolve(__dirname, '..', '..')
  });
  
  const environment = {
    commands: commands,
    tasks: tasks,
    args: process.argv.slice(2),
    project: null, 
    settings: null
  };

  return cli.run(environment);
})();