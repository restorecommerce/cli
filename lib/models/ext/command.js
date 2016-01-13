/***

Not in use, just methods which are overrided or added to the ember-cli Command model.

***/

function Command() {
  debug('Initializing %s in Command constructor.', this.name);

  CoreObject.apply(this, arguments);
  this.name = this.name || path.basename(getCallerFile(), '.js');
  this.isWithinProject = true; // (this.cli ? this.cli.npmPackage : 'restore-cli') in this.getDependencies();

  if (!allowedWorkOptions[this.works]) {
    throw new Error('The "' + this.name + '" command\'s works field has to ' +
                    'be either "everywhere", "insideProject" or "outsideProject".');
  }

  this.aliases = this.aliases || [];

  this.availableOptions   = this.availableOptions || [];
  this.anonymousOptions   = this.anonymousOptions || [];
  this.registerOptions();

  // Nested commands have their own directories for commands and tasks.
  this.availableCommands  = this.lookupAvailableCommands();
  this.availableTasks = this.superCommand ? this.lookupAvailableTasks() : this.tasks;
}


/* A method taken from ember-cli Project model.
   Later on should probably implement it as well.
*/
Command.prototype.getDependencies = function(_pkg, excludeDevDeps) {
  const pkg = _pkg || this.cli.pkg || {};

  var devDependencies = pkg['devDependencies'];
  if (excludeDevDeps) {
    devDependencies = {};
  }

  return assign({}, devDependencies, pkg['dependencies']);
};


Command.prototype.getSuperCommandChain = function(_seperator) {
  const seperator = _seperator || ' ';
  const superCommandChain = this._getSuperCommandChain();

  return superCommandChain.join(seperator);
};

Command.prototype._getSuperCommandChain = function() {
  var superCommandChain = [this.name];
  var cmd = this;

  while (cmd.superCommand) {
    cmd = cmd.superCommand;
    superCommandChain.unshift(cmd.name);
  }

  return superCommandChain;
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

  //debug('"' + this.name + '" command command path: %s', commandPath);
  //debug('"' + this.name + '" command sub-commands:');
  //debug(commands)

  return commands;
};

Command.prototype.lookupAvailableTasks = function() {
  var taskPath;
  if(Object.keys(this.availableCommands).length)  {
    taskPath = path.relative(__dirname, this.settings.pathToTasks + '/' + this.getSuperCommandChain('/')) + '/*.js';
  } else {
    var superCommandChain = this._getSuperCommandChain();
    superCommandChain.pop();
    taskPath = path.relative(__dirname, this.settings.pathToTasks + '/' + superCommandChain.join('/')) + '/' + this.name + '.js';
  }

  const tasks = requireAsHash(taskPath, Task);

  //debug('"' + this.name + '" command task path: %s', taskPath);
  //debug('"' + this.name + '" command tasks: %o', tasks);
  //debug(tasks)

  return tasks;
};

Command.prototype.run = function(commandArgs) {
  throw new Error('Command must implement a "run()" method.');
};


Command.prototype.printAvailableCommands = function(options) {
  console.log(this.printBasicHelp());
  if (this.availableCommands) {
    console.log('Available commands for "' + this.name + '":\n');

    Object.keys(this.availableCommands).forEach(function(commandName) {
      const command = new this.availableCommands[commandName](options);
      console.log(command.printBasicHelp())
    }.bind(this));
  }
};


Command.prototype.validateAndRun = function(args) {
    debug('validateAndRun args: ', args)
    const parseTill = this.parseTill(args);
    const argsToParse = args.slice(0, parseTill);
    debug("Args to parse: ", argsToParse);
    const argsToPass = args.slice(parseTill, args.length)
    debug("Args to pass: ", argsToPass);

    const commandOptions = this.parseArgs(argsToParse);

    debug('Parsed commandOptions: %o', commandOptions)
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

    /*
    if (this.works === 'insideProject') {
      if (!this.project.hasDependencies()) {
        throw new SilentError('node_modules appears empty, you may need to run `npm install`');
      }
    }
    */

    /*
    return Watcher.detectWatcher(this.ui, commandOptions.options).then(function(options) {
      if (options._watchmanInfo) {
        this.project._watchmanInfo = options._watchmanInfo;
      }
    */ 
      return this.run(commandOptions.options /*options*/ , argsToPass);
    /*
  }.bind(this));
  */
};

Command.prototype.parseTill = function(_args) {
  var args = _args.slice();
  var parseTill = 0;
  var skip = false;

  function skipNextArgument (type, value) {
    if(type === Boolean && !(value === 'true' || value === 'false'))
      return false;

    return true;
  }

  function invalidOptionError(invalidOption, name) {
    return new SilentError(chalk.yellow(
      'The option \'--' +  invalidOption + '\' is not registered with the ' +
       name + ' command. ' + 'Run "rstc ' + name +
       ' --help" for a list of supported options.')
    );    
  }

  args.some(function(arg, i) {
    if (!skip) {
      if (arg[0] !== '-') return true; // No options specified for current command.
      var validOption = this.availableOptions.some(function(option) {
        while (arg[0] === '-') arg = arg.slice(1, arg.length);
        if (arg === option.name) {
          skip = skipNextArgument(option.type, args[i + 1]);
          return true;
          /*
            var value = arguments[i + 1];
            var validValue = validateValue(option.type, value);
            if (validValue) return true;
              else throw invalidValueError(option, value);
          */
        }
      })

      if(validOption) { 
        parseTill = i;
        if(skip) parseTill++;
      } else throw invalidOptionError(arg, this.name);
    } else skip = false;
  }.bind(this));

  return parseTill === 0 ? 0 : parseTill + 1; // splice(0,0) for empty array or +1 because splice doesn't copy ith element.


  /*
    function validateValue(type, value) {
      const valueType = typeof value;
      if(type === Boolean) {
        if(value === null || value === undefined) return true; // A boolean type option was the last argument.
        if(value === true || value === false) {
          skip = true;
          return true;
        }
      } else if(type == Object) {
        var valueAsObj = JSON.parse(value);
        if(valueAsObj) return true; // A boolean type option was the last argument.
      } else if(type == Number) {

      }

      return false;
    }
  */

  /*
    function invalidValueError(option, invalidValue) {
      return new SilentError(chalk.yellow(
            'Invalid value "' + invalidValue + '" (' + (typeof invalidValue) +
            ') for option \'--' + option +  '". It must be of type "' option.type + '".');
      );    
    }
  */
}

// Not used, was / would be bad for performance
// If ever implemented, should be used only for 1 specific sub-command.
/*
Command.prototype.registerSubCommandOptions = function(options) {
  Object.keys(this.availableCommands).forEach(function(commandName) {
    const command = new this.availableCommands[commandName](options);
    this.registerOptions(command);
  }.bind(this));
}
*/