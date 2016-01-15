#!/usr/bin/env node

const Liftoff 			= require('liftoff');
const Promise 			= require('bluebird')
const minimist 			= require('minimist');
const chalk 				= require('chalk');
const exit 					= require('exit');
const lookupCommand = require('./lookup-command');
const debug 				= require('debug')('rstc:cli/cli');
const util 					= require('util');

function RSTC(options) {
	this.name 			= options.name,
	this.npmPackage = options.npmPackage,
	this.version 		= options.version,
	this.root 			= options.root,
	this.ui 				= options.ui
	this.analytics 	= options.leek,
	this.testing 		= options.testing
};

module.exports = RSTC;

RSTC.prototype.run = function(environment) {
	this.environment = environment;

	var args = this.environment.args.slice();
	this.commandName = args.shift();
	this.commandArgs = args;

	//debug("commandName: ", this.commandName);
	//debug("commandArgs: ", this.commandArgs);

	// Used only for liftoff command line arguments.
	this.minimist = minimist(this.environment.args);
	//debug(this.minimist)
	this.liftoff = new Liftoff({
		name: 'cli',
		moduleName: 'cli',
		configName: 'cli-configuration',
		processTitle: 'cli',
		v8flags: ['--harmony']
	}).on('require', function(name, module) {
		this.ui.writeLine('Loading:' + name);
	}).on('requireFail', function(name, err) {
		this.ui.writeLine('Unable to load:' + name + err);
	}).on('respawn', function(flags, child) {
		this.ui.writeLine('Detected node flags:' + flags);
		this.ui.writeLine('Respawned to PID:' + child.pid);
	});

	this.liftoff.launch({
		cwd: this.minimist.cwd,
		configPath: this.minimist.clifile,
		require: this.minimist.require,
		completion: this.minimist.completion,
		verbose: this.minimist.verbose
	}, this.handleArguments.bind(this));

	return new Promise.resolve();
};

RSTC.prototype.handleArguments = function(env) {
	if (this.minimist.verbose) {
		this.ui.writeLine('LIFTOFF SETTINGS: ' + util.inspect(this.liftoff, false, null));
		this.ui.writeLine('RSTC OPTIONS: ' + util.inspect(this.minimist, false, null));
		this.ui.writeLine('CWD: ' + env.cwd); // cwd: the current working directory
		this.ui.writeLine('LOCAL MODULES PRELOADED: ', env.require); // require: an array of modules that liftoff tried to pre-load
		this.ui.writeLine('SEARCHING FOR: ' + env.configNameRegex); // configNameSearch: the config files searched for
		this.ui.writeLine('FOUND CONFIG AT: ' + env.configPath); // configPath: the full path to your configuration file (if found)
		this.ui.writeLine('CONFIG BASE DIR: ' + env.configBase); // configBase: the base directory of your configuration file (if found)
		this.ui.writeLine('YOUR LOCAL MODULE IS LOCATED: ' + env.modulePath); // modulePath: the full path to the local module your project relies on (if found)
		this.ui.writeLine('LOCAL PACKAGE.JSON: ' + util.inspect(env.modulePackage, false, null)); // modulePackage: the contents of the local module's package.json (if found)
		//this.ui.writeLine('RSTC PACKAGE.JSON: '+ require('../package'));
	}

	if (process.cwd() !== env.cwd) {
		process.chdir(env.cwd);
		this.ui.writeLine('Working directory changed to:' + chalk.cyan(env.cwd));
	}

	if (!env.modulePath) {
		this.ui.writeLine('Local ' + this.liftoff.moduleName + ' module not found in: ' + chalk.cyan(env.cwd));
		exit(1);
	}

	if (env.configPath) {
		require(env.configPath);
	} else {
		this.ui.writeLine('No ' + this.liftoff.configName + ' found.');
	}

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
			helpOptions = {
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
	var helpIndex = commandArgs.indexOf('--help');
	var hIndex = commandArgs.indexOf('-h');

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

	if (helpIndex > -1) {
		commandArgs.splice(helpIndex, 1);
	}

	if (hIndex > -1) {
		commandArgs.splice(hIndex, 1);
	}

	commandArgs.unshift(commandName);

	return help.validateAndRun(commandArgs);
};

RSTC.prototype.logError = function(error) {
	if (this.testing && error) {
		console.error(chalk.red(error.message));
		if(error.stack) console.error(chalk.cyan(error.stack));
	}
	this.ui.writeError(error);
	return 1;
};