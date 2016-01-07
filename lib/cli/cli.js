#!/usr/bin/env node

const Liftoff 			 = require('liftoff');
const minimist 			 = require('minimist');
const chalk 				 = require('chalk');
const exit 					 = require('exit');
const UnknownCommand = require('../commands/unknown');
const debug   		   = require('debug')('rstc:cli/cli');

function RSTC(options) {
	this.name = options.name;
	this.version = options.version;
	this.npmPackage = options.npmPackage;
	this.ui = options.ui;
};

module.exports = RSTC;

RSTC.prototype.run = function(environment) {
	this.commands = environment.commands;
	this.tasks = environment.tasks;

	var args = environment.args.slice();
  this.commandName = args.shift();
  this.commandArgs = args;

	debug("commandName: ", this.commandName);
	debug("commandArgs: ", this.commandArgs);

	this.minimist = minimist(environment.args); // Temporarily, going to get removed with lookup (see below).
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

	return Promise.resolve();
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

	// Grab the settings here
	// from the cwd
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

	/*
		if (this.minimist.version) {
			this.ui.writeInfoLine('Version: ' + this.version);
			exit();
		}

		if (this.minimist.help && !this.minimist._.length) {
			this.commands.help(env);
			exit();
		}
	*/

	// TO DO: Fix up lookup, otherwise no point of UnknownCommand - 
	// a 'require' error gets thrown + have to manually populate
	// command list.
	var command = null;
	if (Object.keys(this.commands).indexOf(this.minimist._[0]) === -1) {
		debug("Unknown Command: " + this.minimist._[0]);
		command = new UnknownCommand({
			cli: this,
			ui: this.ui,
			name: this.minimist._[0]
		});
	} else {
		debug("Command: " + this.minimist._[0]);
		command = new this.commands[this.minimist._[0]]({
			ui: this.ui,
			commands: this.commands,
			tasks: this.tasks,
			cli: this
		});

		return command.validateAndRun(this.commandArgs);

		/*
		command.validate()
			.then(command.hook
						.bind(command))
			.then(command.run
						.bind(command));
		*/
	}
};

/*
RSTC.prototype.unsupportedArguments = function() {
	if (this.minimist.remain.length) {
		this.ui.writeLine("Options: " + this.minimist.remain + " are not supported.")
		exit(1);
	}
};
*/