'use strict';

const path          = require('path');
const util          = require('util');

const SilentError   = require('silent-error');

const config        = require('./config');
const CLI           = require('./cli');
const UI            = require('./ui');
const pkg           = require('../../package.json');

const requireAsHash = require('../utilities/ext/require-as-hash');

const Command       = require('../models/command');
const Task          = require('../models/task');
const commands      = requireAsHash('../commands/*.js', Command);
const tasks         = requireAsHash('../tasks/*.js', Task);

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
  const projects = new Yam(config.projectsFileName).getAll();
  debug('%s: %o', config.projectsFileName, projects);
  const credentials = new Yam(config.credentialsFileName).getAll();
  debug('%s: %o', config.credentialsFileName, credentials);

  const cli = new CLI({
    name: config.name,
    npmPackage: pkg.name,
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
      config: config,
      projects: projects,
      credentials: credentials
    }
  };

  return cli.run(environment);
})();