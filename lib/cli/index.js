'use strict';

const path          = require('path');
const util          = require('util');
const SilentError   = require('silent-error');

const CLI           = require('./cli');
const UI            = require('./ui');
const requireAsHash = require('../utilities/ext/require-as-hash');

const Command       = require('../models/command');
const Task          = require('../models/task');
const commands      = requireAsHash('../commands/*.js', Command);
const tasks         = requireAsHash('../tasks/*.js', Task);

const pkg           = require('../../package.json');
const debug         = require('debug')('rstc:cli/index');

(function() {
  const cwd = process.cwd()
  const ui = new UI({
    inputStream:  process.stdin,
    outputStream: process.stdout,
    errorStream:  process.stderr,
    ci:           process.env.CI || /^(dumb|emacs)$/.test(process.env.TERM),
    writeLevel:   ~process.argv.indexOf('--silent') ? 'ERROR' : undefined
  });

  const Yam = require('yam');
  const project = new Yam('restore-commerce-project.json').getAll();

  debug('restore-commerce-project.json: %o', project);

  const credentials = new Yam('restore-commerce-credentials.json').getAll();

  debug('restore-commerce-credentials.json: %o', credentials);

  const cli = new CLI({
    name: 'rstc',
    npmPackage: 'restore-cli',
    version:  pkg.version,
    //pkg: pkg,
    root: path.resolve(__dirname, '..', '..'),
    ui: ui
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