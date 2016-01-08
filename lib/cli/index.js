'use strict';

const requireAsHash = require('../utilities/require-as-hash');
const Command       = require('../models/command');
const commands      = requireAsHash('../commands/*.js', Command);
const Task          = require('../models/task');
const tasks         = requireAsHash('../tasks/*.js', Task);
const pkg           = require('../../package.json');
const CLI           = require('./cli');
const UI            = require('./ui');
const Yam           = require('yam');
const SilentError   = require('silent-error');
const debug         = require('debug')('rstc:cli/index');
const util          = require('util');
const path          = require('path');

(function() {
  const cwd = process.cwd()
  const ui = new UI({
    inputStream:  process.stdin,
    outputStream: process.stdout,
    errorStream:  process.stderr,
    ci:           process.env.CI || /^(dumb|emacs)$/.test(process.env.TERM),
    writeLevel:   ~process.argv.indexOf('--silent') ? 'ERROR' : undefined
  });

  const project = new Yam('restore-commerce-project.json').getAll();

  debug('restore-commerce-project.json:')
  debug(util.inspect(project, false, null))

  if(!Object.keys(project).length) {
    throw new SilentError('No "restore-commerce-project.json" file found.\n' +
                          'It must either be located in the current working directory: ' +
                          cwd +
                          '\nOr in your current user\'s home directory.');
  }

  const credentials = new Yam('restore-commerce-credentials.json').getAll();

  debug('restore-commerce-credentials.json:')
  debug(util.inspect(credentials, false, null))

  if(!Object.keys(credentials).length) {
    throw new SilentError('No "restore-commerce-credentials.json" file found.\n' +
                          'It must either be located in the current working directory ' +
                          cwd +
                          '\nOr in your current user\'s home directory.');
  }

  const cli = new CLI({
    name: 'rstc',
    version: pkg.version,
    npmPackage: 'restore-cli',
    ui: ui,
    //root: path.resolve(__dirname, '..', '..'),
    //analytics: leek
  });

  const environment = {
    commands: commands,
    tasks: tasks,
    args: process.argv.slice(2),
    project: project,
    credentials: credentials
  };

  return cli.run(environment);
})();