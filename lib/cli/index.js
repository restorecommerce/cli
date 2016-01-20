'use strict';

const requireAsHash = require('../utilities/ext/require-as-hash');
const path          = require('path');
const pkg           = require('../../package.json');
const CLI           = require('./cli');
const UI            = require('./ui');
const SilentError   = require('silent-error');
const debug         = require('debug')('rstc:cli/index');
const util          = require('util');
const Command       = require('../models/command');
const Task          = require('../models/task');

const commands = requireAsHash('../commands/*.js', Command);
const tasks    = requireAsHash('../tasks/*.js', Task);

(function() {
  const cwd = process.cwd()
  const ui = new UI({
    inputStream:  process.stdin,
    outputStream: process.stdout,
    errorStream:  process.stderr,
    ci:           process.env.CI || /^(dumb|emacs)$/.test(process.env.TERM),
    writeLevel:   ~process.argv.indexOf('--silent') ? 'ERROR' : undefined
  });

  const Yam           = require('yam');
  const project = new Yam('restore-commerce-project.json').getAll();

  debug('restore-commerce-project.json: %o', project);

  const credentials = new Yam('restore-commerce-credentials.json').getAll();

  debug('restore-commerce-credentials.json: %o', credentials);

  const cli = new CLI({
    name: 'rstc',
    npmPackage: 'restore-cli',
    pkg: pkg,
    root: path.resolve(__dirname, '..', '..'),
    ui: ui,
    analytics: null, // leek,
    testing: true // Should remember to set this to false for release mode.
  });

  const environment = {
    commands: commands,
    tasks: tasks,
    args: process.argv.slice(2),
    settings: { // Not the 'this.settings' used like in ember-cli.
      project: project,
      credentials: credentials
    }
  };

  return cli.run(environment);
})();