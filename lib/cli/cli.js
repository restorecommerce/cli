#!/usr/bin/env node

const Liftoff 			= require('liftoff');
const Promise 			= require('bluebird')
const nopt 	    		= require('nopt');
const chalk 				= require('chalk');
const exit 					= require('exit');
const util 					= require('util');

const lookupCommand = require('./lookup-command');
const debug 				= require('debug')('rstc:cli/cli');

function RSTC(options) {
	this.name 			= options.name;
	this.npmPackage = options.npmPackage;
  //this.pkg        = options.pkg;
	this.version 		= options.version;
	this.root 			= options.root;
	this.ui 				= options.ui;
};

module.exports = RSTC;

RSTC.prototype.run = function(environment) {
	this.environment = environment;

  var args = this.environment.args.slice();
	this.commandName = args.shift();
	this.commandArgs = args;

  const options = {
    "debug":        Boolean,
    "verbose":      Boolean,
    "help":         Boolean,
    "cwd":          String,
    "configPath":   String,
    "require:":     [String, Array],
    "completion:":  Function
  };
  const shortHands = {
    "d": "--debug",
    "v": "--verbose",
    "h": "--help"
  };

	this.parsed = nopt(options, shortHands, this.environment.args, 0);

	this.liftoff = new Liftoff({
		name: 'rstc',
		moduleName: 'restore-cli',
		configName: 'restore-cli-configuration',
		processTitle: 'rstc',
		v8flags: ['--harmony']
	}).on('require', function(name, module) {
		console.log('Loading:' + name);
	}).on('requireFail', function(name, err) {
		console.log('Unable to load:' + name + err);
	}).on('respawn', function(flags, child) {
		console.log('Detected node flags:' + flags);
		console.log('Respawned to PID:' + child.pid);
	});

	this.liftoff.launch({
		cwd:        this.parsed.cwd,
		configPath: this.parsed.clifile,
		require:    this.parsed.require,
		completion: this.parsed.completion,
		verbose:    this.parsed.verbose
	}, this.handleArguments.bind(this));

	return Promise.resolve();
};

RSTC.prototype.handleArguments = function(env) {
  if (this.parsed.debug) {
    // TODO: display debug output when the flag is passed.
    // The 2 lines below doesn't seem to do the trick.
    process.env.NODE_ENV = 'development';
    process.env.DEBUG = "*";

    this.debug = true;
    spliceArray(this.commandArgs, '--debug', '-debug', '--d', '-d');

		console.log('LIFTOFF SETTINGS: ' + util.inspect(this.liftoff, false, null));
		console.log('RSTC OPTIONS: ' + util.inspect(this.parsed, false, null));
		console.log('CWD: ' + env.cwd); // cwd: the current working directory
		//console.log('LOCAL MODULES PRELOADED: ', env.require); // require: an array of modules that liftoff tried to pre-load
		//console.log('SEARCHING FOR: ' + env.configNameRegex); // configNameSearch: the config files searched for
		//console.log('FOUND CONFIG AT: ' + env.configPath); // configPath: the full path to your configuration file (if found)
		//console.log('CONFIG BASE DIR: ' + env.configBase); // configBase: the base directory of your configuration file (if found)
		console.log('YOUR LOCAL MODULE IS LOCATED: ' + env.modulePath); // modulePath: the full path to the local module your project relies on (if found)
		//console.log('LOCAL PACKAGE.JSON: ' + util.inspect(env.modulePackage, false, null)); // modulePackage: the contents of the local module's package.json (if found)
		//console.log('RSTC PACKAGE.JSON: '+ require('../package'));
  }

	if (this.parsed.verbose) {
    this.verbose = true;
    spliceArray(this.commandArgs, '--verbose', '-verbose', '--v', '-v');
	}

	if (process.cwd() !== env.cwd) {
		process.chdir(env.cwd);
		console.log(chalk.cyan('Working directory changed to:' + chalk.cyan(env.cwd)));
	}

	if (!env.modulePath) {
		console.log(chalk.red('Local ' + this.liftoff.moduleName + ' module not found in: ' + chalk.cyan(env.cwd)));
		exit(1);
	}

	// 'env.configPath' - path to a 'Hackerfile' (see Liftoff GIT).
  // It's the 'gulp-file' for gulp. Currently non-existant / not in use.
  /*
	if (env.configPath) {
		require(env.configPath);
	} else {
		console.log(chalk.red('No ' + this.liftoff.configName + ' found.'));;
	}
	*/

	const _command = lookupCommand(this.environment.commands, this.commandName, this.commandArgs, {
		project: this.environment.settings.project, // Not the 'this.settings' used like in ember-cli.
		ui: this.environment.ui
	});

	const options = {
		ui: this.ui,
		analytics: this.analytics,
		commands: this.environment.commands,
		tasks: this.environment.tasks,
		settings: this.environment.settings, // Not the 'this.settings' used like in ember-cli.
		testing: this.testing,
		cli: this
	}

	const command = new _command(options);

  command.beforeRun(this.commandArgs);

	return command.validateAndRun(this.commandArgs).then(function(result) {
		// If the help option was passed, call the help command.
		if (result === 'callHelp') {
      spliceArray(this.commandArgs, '--help', '-help', '--h', '-h');

      const helpOptions = {
				environment: this.environment,
				commandName: this.commandName,
				commandArgs: this.commandArgs
			};

			return this.callHelp(helpOptions);
		}

		return result;
	}.bind(this)).then(function(exitCode) {
		// Says the same on ember-cli:

		// TODO: fix this
		// Possibly this issue: https://github.com/joyent/node/issues/8329
		// Wait to resolve promise when running on windows.
		// This ensures that stdout is flushed so acceptance tests get full output

		var result = {
			exitCode: exitCode,
			ui: this.ui
		};

		return new Promise(function(resolve) {
			if (process.platform === 'win32') {
				setTimeout(resolve, 250, result);
			} else {
				resolve(result);
			}
		});
	}.bind(this)).catch(this.logError.bind(this));
};

RSTC.prototype.callHelp = function(options) {
	var environment = options.environment;
	var commandName = options.commandName;
	var commandArgs = options.commandArgs;

	var HelpCommand = lookupCommand(environment.commands, 'help', commandArgs, {
		project: environment.project,
		ui: this.ui
	});

	var help = new HelpCommand({
		ui: this.ui,
		analytics: this.analytics,
		commands: environment.commands,
		tasks: environment.tasks,
		project: environment.project,
		settings: environment.settings,
		testing: this.testing
	});

	commandArgs.unshift(commandName);

	return help.validateAndRun(commandArgs);
};

RSTC.prototype.logError = function (error) {
  if (error) {
    if (error.message) {
      console.error(chalk.red(error.message));
    }

    // Just for developing.
    if (error.stack) {
      console.error(chalk.red(error.stack));
    }
    // --> this.ui.writeError(error);
  }

  return 1;
};

function spliceArray(arr) {
  for(var i = 0; i < arguments.length; i++) {
    var index = arr.indexOf(arguments[i]);
    if(index !== -1) {
      arr.splice(index, 1);
    }
  }
}