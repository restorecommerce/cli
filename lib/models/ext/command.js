var Command = function() {
  debug('Initializing %s in Command constructor.', this.name);

  CoreObject.apply(this, arguments);

  this.name = this.name || path.basename(getCallerFile(), '.js');
  this.isWithinProject = true; // this.project.isEmberCLIProject();

  if (!allowedWorkOptions[this.works]) {
    throw new Error('The "' + this.name + '" command\'s works field has to ' +
                    'be either "everywhere", "insideProject" or "outsideProject".');
  }

  this.aliases = this.aliases || [];

  this.availableOptions   = this.availableOptions || [];
  this.anonymousOptions   = this.anonymousOptions || [];
  this.registerOptions();

  this.availableCommands  = this.lookupAvailableCommands();
  this.availableTasks     = this.lookupAvailableTasks();
}

Command.prototype.getSuperCommandChain = function(_seperator) {
	const seperator = _seperator || ' ';
	var superCommandChain = [this.name];
	var cmd = this;

	while (cmd.superCommand) {
		cmd = cmd.superCommand;
		superCommandChain.unshift(cmd.name);
	}

	return superCommandChain.join(seperator);
};

Command.prototype.printBasicHelp = function() {
  var output;
  if (this.isRoot) {
    output = 'Usage: ' + this.name;
  } else if(this.superCommand) {
    const commandChain = this.getSuperCommandChain(' ');
    output = 'rstc ' + commandChain;
  } else {
    output = 'rstc ' + this.name;
  } 

  output += this._printCommand();
  output += EOL;

  return output;
};

Command.prototype.lookupAvailableCommands = function() {
	const commandChain = this.getSuperCommandChain('/')
	const commandPath = path.relative(__dirname, this.settings.pathToCommands + '/' + commandChain) + '/*.js';
	const commands = requireAsHash(commandPath, Command);

	debug('"' + this.name + '" command sub-commands:');
	debug(commands)

	return commands;
};

Command.prototype.lookupAvailableTasks = function() {
	const commandChain = this.getSuperCommandChain('/')
	const taskPath = path.relative(__dirname, this.settings.pathToTasks + '/' + commandChain) + '/*.js';
	const tasks = requireAsHash(taskPath, Task);

	debug('"' + this.name + '" command tasks:');
	debug(tasks)

	return tasks;
};

Command.prototype.printAvailableCommands = function(options, commandOptions) {
	console.log(this.printBasicHelp(commandOptions));
	if (this.availableCommands) {
		console.log('Available commands for "' + this.name + '":\n');

		Object.keys(this.availableCommands).forEach(function(commandName) {
			const command = new this.availableCommands[commandName](options);
			console.log(command.printBasicHelp())
		}.bind(this));
	}
};


Command.prototype.validateAndRun = function(args) {
  // Don't parse the options yet,
  // get the first subcommand and pipe down.
  debug('%s.availableCommands: %o', this.name, this.availableCommands)
  if (Object.keys(this.availableCommands).length) {
      const options = {
        superCommand: this,

        ui: this.ui,
        analytics: this.analytics,
        commands: this.commands,
        tasks: this.tasks,
        project: this.project,
        settings: this.settings,
        testing: this.testing,
        cli: this.cli
    };

    if (args.length === 0) {
      this.printAvailableCommands(options, commandOptions);
      //const message = ""
      return new Promise.reject(/*new SilentError(message)*/);
    }

    const _commandName = args.shift();
    debug('Parsed: ', _commandName)
    const commandName = string.classify(_commandName);

    if (!this.availableCommands[commandName]) {
      this.printAvailableCommands(options, commandOptions);
      const message = 'Sub-command "' + _commandName + '" is not registered with "' + this.name + '".';
      return new Promise.reject(new SilentError(message));
    }

    const command = new this.availableCommands[commandName](options);
    debug('Not going to parse: ', args)

    command.beforeRun(args);
    return command.validateAndRun(args);
  } else {
    debug('About to parse these args: ', args)
    const commandOptions = this.parseArgs(args);
    debug('And got this: %o', commandOptions)
    // If the help option was passed, resolve with 'callHelp' to call help command.
    if (commandOptions && (commandOptions.options.help || commandOptions.options.h)) {
      debug(this.name + ' called with help option');
      return Promise.resolve('callHelp');
    }
    
    /*
      this.analytics.track({
        name:    'rstc ',
        message: this.name
      });
    */

    if (commandOptions === null) {
      return Promise.resolve();
    }

    if (this.works === 'insideProject' && !this.isWithinProject) {
      return Promise.reject(new SilentError(
        'You have to be inside an restore-cli project in order to use ' +
        'the ' + chalk.green(this.name) + ' command.'
      ));
    }

    if (this.works === 'outsideProject' && this.isWithinProject) {
      return Promise.reject(new SilentError(
        'You cannot use the '+  chalk.green(this.name) +
        ' command inside an restore-cli project.'
      ));
    }

    if (this.works === 'insideProject') {
      if (!this.project.hasDependencies()) {
        throw new SilentError('node_modules appears empty, you may need to run `npm install`');
      }
    }

    /*
    return Watcher.detectWatcher(this.ui, commandOptions.options).then(function(options) {
      if (options._watchmanInfo) {
        this.project._watchmanInfo = options._watchmanInfo;
      }
    */ 
      return this.run(commandOptions.options /*options*/ , commandOptions.args);
    /*
  }.bind(this));
  */
  }
};