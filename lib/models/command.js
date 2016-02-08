'use strict';

const nopt                = require('nopt');
const chalk               = require('chalk');
const path                = require('path');
const getCallerFile       = require('get-caller-file');
const Promise             = require('bluebird');
const EOL                 = require('os').EOL;
const CoreObject          = require('core-object');
const SilentError         = require('silent-error');
const stringUtils         = require('ember-cli-string-utils');

const union               = require('lodash/array/union');
const uniq                = require('lodash/array/uniq');
const pluck               = require('lodash/collection/pluck');
const reject              = require('lodash/collection/reject');
const where               = require('lodash/collection/where');
const assign              = require('lodash/object/assign');
const defaults            = require('lodash/object/defaults');
const keys                = require('lodash/object/keys');

const printableProperties = require('../utilities/ext/printable-properties').command;
const printCommand        = require('../utilities/ext/print-command');
const string              = require('../utilities/ext/string');
const requireAsHash       = require('../utilities/ext/require-as-hash');
const camelize            = require('../utilities/ext/string').camelize;

const debug               = require('debug')('rstc:cli/models/command')
const Task                = require('./task')

const allowedWorkOptions = {
  insideProject: true,
  outsideProject: true,
  everywhere: true
};

function Command() {
  //debug('Initializing %s in Command constructor.', this.name);

  CoreObject.apply(this, arguments);
  this.name = this.name || path.basename(getCallerFile(), '.js');
  this.isWithinProject = true; // (this.cli ? this.cli.npmPackage : 'restore-cli') in this.getDependencies();

  if (!allowedWorkOptions[this.works]) {
    throw new Error('The "' + this.name + '" command\'s "works" property has to ' +
                    'be either "everywhere", "insideProject" or "outsideProject".');
  }

  this.aliases          = this.aliases || [];
  this.availableOptions = this.availableOptions || [];
  this.anonymousOptions = this.anonymousOptions || [];
  // Used here to validate the command's command options.
  this.registerOptions();
  // Nested commands have their own directories for commands and tasks.
  this.availableCommands = this.lookupAvailableCommands();
  this.availableTasks = this.superCommand ? this.lookupAvailableTasks() : this.tasks;
}

Command.__proto__ = CoreObject;

Command.prototype.description = null;
Command.prototype.works = 'insideProject';
Command.prototype.constructor = Command;

module.exports = Command;

/*
   A method taken from ember-cli Project model.
   Later on should probably implement it as well if necessary.
*/

/*
Command.prototype.getDependencies = function (_pkg, excludeDevDeps) {
  const pkg = _pkg || this.cli.pkg || {};

  var devDependencies = pkg['devDependencies'];
  if (excludeDevDeps) {
    devDependencies = {};
  }

  return assign({}, devDependencies, pkg['dependencies']);
};
*/

/*
  Registers options with command. This method provides the ability to extend or override command options.
  Expects an object containing anonymousOptions or availableOptions, which it will then merge with
  existing availableOptions before building the optionsAliases which are used to define shorthands.
*/
Command.prototype.registerOptions = function (options) {
  var extendedAvailableOptions = options && options.availableOptions || [];
  var extendedAnonymousOptions = options && options.anonymousOptions || [];

  this.anonymousOptions = union(this.anonymousOptions.slice(0), extendedAnonymousOptions);
  this.availableOptions = union(this.availableOptions.slice(0), extendedAvailableOptions);

  var optionKeys = uniq(pluck(this.availableOptions, 'name'));

  optionKeys.map(this.mergeDuplicateOption.bind(this));

  this.optionsAliases = this.optionsAliases || {};

  this.availableOptions.map(this.validateOption.bind(this));
};

Command.prototype.lookupAvailableCommands = function () {
  const commandChain = this.getSuperCommandChain('/')
  const commandPath = '../commands/' + commandChain + '/*.js';
  const commands = requireAsHash(commandPath, Command);

  //debug('"' + this.name + '" command command path: %s', commandPath);
  //debug('"' + this.name + '" command sub-commands:');
  //debug(commands)

  return commands;
};


Command.prototype.lookupAvailableTasks = function () {
  var taskPath;
  if (Object.keys(this.availableCommands).length) {
    taskPath = '../tasks/' + this.getSuperCommandChain('/') + '/*.js';
  } else {
    var superCommandChain = this._getSuperCommandChain();
    superCommandChain.pop();
    taskPath = '../tasks/' + superCommandChain.join('/') + '/' + this.name + '.js';
  }

  const tasks = requireAsHash(taskPath, Task);

  //debug('"' + this.name + '" command task path: %s', taskPath);
  //debug('"' + this.name + '" command tasks: %o', tasks);
  //debug(tasks)

  return tasks;
};


Command.prototype.getSuperCommandChain = function (seperator) {
  seperator = seperator || ' ';
  const superCommandChain = this._getSuperCommandChain();

  return superCommandChain.join(seperator);
};

Command.prototype._getSuperCommandChain = function (cb) {
  var superCommandChain = [this.name];
  var cmd = this;

  while (cmd.superCommand) {
    cmd = cmd.superCommand;
    // Callback used before the unshift.
    // Cb currently used only in 'getFullCommandDescriptor'
    // to add a colorful '<options>' str after sub-commands.
    if (cb && typeof cb === 'function') {
      cb(cmd, superCommandChain);
    }

    superCommandChain.unshift(cmd.name);
  }

  return superCommandChain;
};

Command.prototype.validateAndRun = function (args, previousOptions) {
  let commandOptions;
  debug('validateAndRun args: ', args);
  debug('validateAndRun previousOptions: ', previousOptions)

  if (this.mergeOptions) {
    debug('Merging "' + this.name + '" options with..');
    let nextCommand = args.find(arg => {
      return !arg.startsWith('-');
    });

    if(nextCommand) {
      nextCommand = stringUtils.classify(nextCommand);
    }

    debug('"' + nextCommand + '" options.');

    if(!nextCommand || !this.availableCommands[nextCommand]) {
      return Promise.reject(new SilentError(
        'Command ' + chalk.green(nextCommand) +
        ' is not a sub-command of ' + chalk.green(this.name) + '.'
        ));
    }

    this.registerOptions(nextCommand.availableOptions);
    //debug('Merged options: ', this.availableOptions);
  }

  try {
    commandOptions = this.parseArgs(args);
    debug('Parsed commandOptions: %o', commandOptions)
  } catch (e) {
    return Promise.reject(e);
  }

  // If the help option was passed, resolve with 'help' to call the help command.
  if (commandOptions && (commandOptions.options.help || commandOptions.options.h)) {
    debug('Called "' + this.name + '" with the "--help" option.');
    return Promise.resolve('help');
  }

  // Currently this.isWithinProject is always true
  // because Liftoff has checked for a local restore-cli.
  // Have to see if this functionality will ever be necessary.

  /*
  if (this.works === 'insideProject' && !this.isWithinProject) {
    return Promise.reject(new SilentError(
        'You have to be inside an restore-cli project in order to use ' +
        'the ' + chalk.green(this.name) + ' command.'
      ));
  }

  if (this.works === 'outsideProject' && this.isWithinProject) {
    return Promise.reject(new SilentError(
        'You cannot use the ' + chalk.green(this.name) +
        ' command inside an restore-cli project.'
      ));
  }


  if (this.works === 'insideProject') {
    if (!this.project.hasDependencies()) {
      throw new SilentError('node_modules appears empty, you may need to run `npm install`');
    }
  }
  */

  if(previousOptions)  {
    defaults(commandOptions.options, previousOptions);
  }

  return this.run(commandOptions.options, commandOptions.args);
};

/*
  Gets basic help for the command.

  Basic help looks like this:

      rstc generate <blueprint> <options...>
        Generates new code from blueprints
        aliases: g
        --dry-run (Default: false)
        --verbose (Default: false)

  The default implementation is designed to cover all bases
  but may be overriden if necessary.
*/

Command.prototype.getHelp = function (options) {
  var output = '';
  options = options || {};

  if (options.fullDescriptor) output += 'rstc ' + this.getFullCommandDescriptor();
  else {
    if (!options.margin) options.margin = ' ';
    output += options.margin + this.name;
  }

  output += this.printCommand(options);
  output += EOL;

  return output;
};

Command.prototype.getFullCommandDescriptor = function () {
  return this._getSuperCommandChain(function (cmd, arr) {
    const hasOptions = cmd.availableOptions.length;

    if (hasOptions)
      arr.unshift(chalk.cyan('<options>'));
  }).join(' ');
};

Command.prototype.printBasicHelp = function (options, showSubCommands) {
  var output = this.getHelp({
    fullDescriptor: true
  });

  if (showSubCommands)
    output += this.getAvailableCommands(options);

  console.log(output);
};

/*
  Prints detailed help for the command.
  Should be overridden for each command where further help text is required.

  @method printDetailedHelp
*/
Command.prototype.printDetailedHelp = function (options) {
  this.printBasicHelp(options, true);
};

Command.prototype.getAvailableCommands = function (options) {
  var output = '';
  if (Object.keys(this.availableCommands).length) {
    output += ('\n Where ' + chalk.yellow('<command>') + ' is one of:\n\n');

    Object.keys(this.availableCommands).forEach(function (commandName) {
      const command = new this.availableCommands[commandName](options);
      output += command.getHelp();
    }.bind(this));
  }

  return output;
}

/*
  Hook for extending a command before it is run in the cli.run command.
  Most common use case would be to extend availableOptions.
  @method beforeRun
  @return {Promise|null}
*/
Command.prototype.beforeRun = function () {

};

/*
  Merges any options with duplicate keys in the availableOptions array.
  Used primarily by registerOptions.
  @method mergeDuplicateOption
  @param {String} key
  @return {Object}
*/
Command.prototype.mergeDuplicateOption = function (key) {
  var duplicateOptions, mergedOption, mergedAliases;
  // get duplicates to merge
  duplicateOptions = where(this.availableOptions, { 'name': key });
  if (duplicateOptions.length > 1) {
    // TODO: warn on duplicates and overwriting
    mergedAliases = [];

    pluck(duplicateOptions, 'aliases').map(function (alias) {
      alias.map(function (a) {
        mergedAliases.push(a);
      });
    });

    // merge duplicate options
    mergedOption = assign.apply(null, duplicateOptions);

    // replace aliases with unique aliases
    mergedOption.aliases = uniq(mergedAliases, function (alias) {
      if (typeof alias === 'object') {
        return alias[Object.keys(alias)[0]];
      }
      return alias;
    });

    // remove duplicates from options
    this.availableOptions = reject(this.availableOptions, { 'name': key });
    this.availableOptions.push(mergedOption);
  }
  return this.availableOptions;
};

/*
  Normalizes option, filling in implicit values
  @method normalizeOption
  @param {Object} option
  @return {Object}
*/
Command.prototype.normalizeOption = function (option) {
  option.key = camelize(option.name);
  option.required = option.required || false;
  return option;
};

/*
  Assigns option
  @method assignOption
  @param {Object} option
  @param {Object} parsedOptions
  @param {Object} commandOptions
  @return {Boolean}
*/
Command.prototype.assignOption = function (option, parsedOptions, commandOptions) {
  var isValid = isValidParsedOption(option, parsedOptions[option.name]);
  if (isValid) {
    if (parsedOptions[option.name] === undefined) {
      if (option.default !== undefined) {
        commandOptions[option.key] = option.default;
      }

      /*
        if (this.settings[option.name] !== undefined) {
          commandOptions[option.key] = this.settings[option.name];
        } else if (this.settings[option.key] !== undefined) {
          commandOptions[option.key] = this.settings[option.key];
        }
      */

    } else {
      commandOptions[option.key] = parsedOptions[option.name];
      delete parsedOptions[option.name];
    }
  } else {
    this.ui.writeLine('The specified command ' + chalk.green(this.name) +
      ' requires the option ' + chalk.green(option.name) + '.');
  }
  return isValid;
};

/*
  Validates option
  @method validateOption
  @param {Object} option
  @return {Boolean}
*/
Command.prototype.validateOption = function (option) {
  var parsedAliases;

  if (!option.name || !option.type) {
    throw new Error('The command "' + this.name + '" has an option ' +
      'without the required type and name fields.');
  }

  if (option.name !== option.name.toLowerCase()) {
    throw new Error('The "' + option.name + '" option\'s name of the "' +
      this.name + '" command contains a capital letter.');
  }

  this.normalizeOption(option);

  if (option.aliases) {
    parsedAliases = option.aliases.map(this.parseAlias.bind(this, option));
    return parsedAliases.map(this.assignAlias.bind(this, option)).indexOf(false) === -1;
  }
  return false;
};

/*
  Parses alias for an option and adds it to optionsAliases
  @method parseAlias
  @param {Object} option
  @param {Object|String} alias
  @return {Object}
*/
Command.prototype.parseAlias = function (option, alias) {
  var aliasType = typeof alias;
  var key, value, aliasValue;

  if (isValidAlias(alias, option.type)) {
    if (aliasType === 'string') {
      key = alias;
      value = ['--' + option.name];
    } else if (aliasType === 'object') {
      key = Object.keys(alias)[0];
      value = ['--' + option.name, alias[key]];
    }
  } else {
    if (Array.isArray(alias)) {
      aliasType = 'array';
      aliasValue = alias.join(',');
    } else {
      aliasValue = alias;
      try {
        aliasValue = JSON.parse(alias);
      }
      catch (e) {
        var debug = require('debug')('rstc-cli/models/command');
        debug(e);
      }
    }
    throw new Error('The "' + aliasValue + '" [type:' + aliasType +
      '] alias is not an acceptable value. It must be a string or single key' +
      ' object with a string value (for example, "value" or { "key" : "value" }).');
  }

  return {
    key: key,
    value: value,
    original: alias
  };

};
Command.prototype.assignAlias = function (option, alias) {
  var isValid = this.validateAlias(option, alias);

  if (isValid) {
    this.optionsAliases[alias.key] = alias.value;
  }
  return isValid;
};

/*
  Validates alias value
  @method validateAlias
  @params {Object} alias
  @return {Boolean}
*/
Command.prototype.validateAlias = function (option, alias) {
  var key = alias.key;
  var value = alias.value;

  if (!this.optionsAliases[key]) {
    return true;
  } else {
    if (value[0] !== this.optionsAliases[key][0]) {
      throw new SilentError('The "' + key + '" alias is already in use by the "' + this.optionsAliases[key][0] +
        '" option and cannot be used by the "' + value[0] + '" option. Please use a different alias.');
    } else {
      if (value[1] !== this.optionsAliases[key][1]) {
        this.ui.writeLine(chalk.yellow('The "' + key + '" alias cannot be overridden. Please use a different alias.'));
        // delete offending alias from options
        var index = this.availableOptions.indexOf(option);
        var aliasIndex = this.availableOptions[index].aliases.indexOf(alias.original);
        if (this.availableOptions[index].aliases[aliasIndex]) {
          delete this.availableOptions[index].aliases[aliasIndex];
        }
      }
    }
    return false;
  }
};

/*
  Parses command arguments and processes
  @method parseArgs
  @param {Object} commandArgs
  @return {Object|null}
*/
Command.prototype.parseArgs = function (commandArgs) {
  var knownOpts = {};
  var commandOptions = {};
  var parsedOptions;

  var assembleAndValidateOption = function (option) {
    return this.assignOption(option, parsedOptions, commandOptions);
  };

  var validateParsed = function (key) {
    if (!commandOptions.hasOwnProperty(key) && key !== 'argv') {
      const message = 'The option \'--' + key + '\' is not registered with the ' +
        this.name + ' command. ' + 'Run "rstc "' + this.getSuperCommandChain() +
        ' --help` for a list of supported options.';

      this.console.log(chalk.yellow(message)); // Warning
      //throw new SilentError(message);
    }

    if (typeof parsedOptions[key] !== 'object') {
      commandOptions[camelize(key)] = parsedOptions[key];
    }
  };

  this.availableOptions.forEach(function (option) {
    knownOpts[option.name] = option.type;
  });

  parsedOptions = nopt(knownOpts, this.optionsAliases, commandArgs, 0);

  if (!this.availableOptions.every(assembleAndValidateOption.bind(this))) {
    return null;
  }

  keys(parsedOptions).map(validateParsed.bind(this));

  return {
    options: commandOptions, // defaults(commandOptions, this.settings),
    args: parsedOptions.argv.remain
  };
};

Command.prototype.run = function (commandArgs) {
  throw new Error('Command must implement a "run()" method.');
};

Command.prototype.printCommand = printCommand;

Command.prototype.getJson = function (options) {
  var json = {};

  printableProperties.forEachWithProperty(function (key) {
    json[key] = this[key];
  }, this);

  if (this.addAdditionalJsonForHelp) {
    this.addAdditionalJsonForHelp(json, options);
  }

  return json;
};

/*
  Validates options parsed by nopt
*/
function isValidParsedOption(option, parsedOption) {
  // option.name didn't parse
  if (parsedOption === undefined) {
    // no default
    if (option.default === undefined) {
      if (option.required) {
        return false;
      }
    }
  }

  return true;
}

/*
  Validates alias. Must be a string or single key object
*/
function isValidAlias(alias, expectedType) {
  var type = typeof alias;
  var value, valueType;
  if (type === 'string') {
    return true;
  } else if (type === 'object') {

    // no arrays, no multi-key objects
    if (!Array.isArray(alias) && Object.keys(alias).length === 1) {
      value = alias[Object.keys(alias)[0]];
      valueType = typeof value;
      if (!Array.isArray(expectedType)) {
        if (valueType === expectedType.name.toLowerCase()) {
          return true;
        }
      } else {
        if (expectedType.indexOf(value) > -1) {
          return true;
        }
      }
    }
  }

  return false;
}
