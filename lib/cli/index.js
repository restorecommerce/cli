'use strict';

const requireAsHash = require('../utilities/ext/require-as-hash');
const path          = require('path');
const pkg           = require('../../package.json');
const CLI           = require('./cli');
const UI            = require('./ui');
const Yam           = require('yam');
const SilentError   = require('silent-error');
const debug         = require('debug')('rstc:cli/index');
const util          = require('util');
const Command       = require('../models/command');
const Task          = require('../models/task');

const PATH_TO_COMMANDS        = path.normalize(__dirname+'/../commands/')
const PATH_TO_TASKS           = path.normalize(__dirname+'/../tasks/')
// ^ Goes into 'settings'.
const relativePathToCommands  = path.relative(__dirname, PATH_TO_COMMANDS)+'/*.js';
const relativePathToTasks     = path.relative(__dirname, PATH_TO_TASKS)+'/*.js';
// ^ Only used for the 2 'require's below.
debug("PATH_TO_COMMANDS: "          + PATH_TO_COMMANDS);
debug("PATH_TO_TASKS: "             + PATH_TO_TASKS);
debug("Relative path to commands: " + relativePathToCommands);
debug("Relative path to tasks: "    + relativePathToTasks);

const commands = requireAsHash(relativePathToCommands, Command);
const tasks    = requireAsHash(relativePathToTasks, Task);

(function() {
  const cwd = process.cwd()
  const ui = new UI({
    inputStream:  process.stdin,
    outputStream: process.stdout,
    errorStream:  process.stderr,
    ci:           process.env.CI || /^(dumb|emacs)$/.test(process.env.TERM),
    writeLevel:   ~process.argv.indexOf('--silent') ? 'ERROR' : undefined
  });

  // TO DO: Take the Project model from ember-cli or create own,
  // as in the ember-cli it has it's own use.
  const project = new Yam('restore-commerce-project.json').getAll();

  debug('restore-commerce-project.json: %o', project);

  if(!Object.keys(project).length) {
    throw new SilentError('No "restore-commerce-project.json" file found.\n' +
                          'It must either be located in the current working directory: ' +
                          cwd +
                          '\nOr in your current user\'s home directory.');
  }

  const credentials = new Yam('restore-commerce-credentials.json').getAll();

  debug('restore-commerce-credentials.json: %o', credentials);

  if(!Object.keys(credentials).length) {
    throw new SilentError('No "restore-commerce-credentials.json" file found.\n' +
                          'It must either be located in the current working directory ' +
                          cwd +
                          '\nOr in your current user\'s home directory.');
  }

  const cli = new CLI({
    name: 'rstc',
    npmPackage: 'restore-cli',
    pkg: pkg,
    root: path.resolve(__dirname, '..', '..'),
    ui: ui,
    analytics: null, //leek,
    testing: true // Should remember to set this to false for release mode.
  });

  const environment = {
    commands: commands,
    tasks: tasks,
    args: process.argv.slice(2),
    settings: {
      project: project,
      credentials: credentials,
      pathToCommands: PATH_TO_COMMANDS,
      pathToTasks: PATH_TO_TASKS
    }
  };

  return cli.run(environment);
})();