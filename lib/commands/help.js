'use strict';


// Something weird is going on -
// if console.log gets replaced by
// this.ui.writeLine, then only the
// first this.ui.writeLine gets printed.


// TO DO: fix ^^^^^^^^^^^^^^^^^^^^^^^^^

const path            = require('path');
const Command         = require('../models/command');
const lookupCommand   = require('../cli/lookup-command');
const string          = require('../utilities/ext/string');
const assign          = require('lodash/object/assign');
const Promise         = require('bluebird');
//const GenerateCommand = require('./generate');
const debug           = require('debug')('rstc:commands/help');

module.exports = Command.extend({
  name: 'help',
  description: 'Outputs the usage instructions for all commands or the requested command(s).',
  aliases: [undefined, 'h', '--help', '-h'],
  works: 'everywhere',

  availableOptions: [
    { name: 'verbose', type: Boolean, default: false, aliases: ['v'] },
    { name: 'json',    type: Boolean, default: false }
  ],

  anonymousOptions: [
    '<command-name>'
  ],

  run: function(commandOptions, rawArgs) {
    //var multipleCommands = null; //[GenerateCommand.prototype.name].concat(GenerateCommand.prototype.aliases);
    var command;
    var json;

    const options = {
      ui: this.ui,
      analytics: this.analytics,
      commands: this.commands,
      tasks: this.tasks,
      project: this.project,
      settings: this.settings,
      testing: this.testing,
      cli: this.cli
    };

    if (commandOptions.json) {
      json.commands = [];
    }

    if (rawArgs.length === 0) {
      if (!commandOptions.json) {
        console.log('Available commands in rstc-cli:');
        console.log('');

        Object.keys(this.commands).forEach(function(commandName) {
          this._printBasicHelpForCommand(commandName, commandOptions, json);
        }, this);
      }
    } else {
      // If args were passed to the help command,
      // attempt to look up the command for each of them.
      if (!commandOptions.json) {
        console.log('Requested rstc-cli commands:');
        console.log('');
      }

      rawArgs.forEach(function(commandName) {
        this._printDetailedHelpForCommand(commandName, commandOptions, json);
      }, this);
    }

    if (commandOptions.json) {
      this._printJsonHelp(json);
    }

    return Promise.resolve();
  },

  _printBasicHelpForCommand: function(commandName, options, json) {
    if (options.json) {
      this._addCommandHelpToJson(commandName, false, options, json);
    } else {
      this._printHelpForCommand(commandName, false, options);
    }
  },

  _printDetailedHelpForCommand: function(commandName, options, json) {
    if (options.json) {
      this._addCommandHelpToJson(commandName, true, options, json);
    } else {
      this._printHelpForCommand(commandName, true, options);
    }
  },

  _addCommandHelpToJson: function(commandName, single, options, json) {
    var command = this._lookupCommand(commandName);
    if (!command.skipHelp || single) {
      json.commands.push(command.getJson(options));
    }
  },

  _printHelpForCommand: function(commandName, detailed, options) {
    var command = this._lookupCommand(commandName);

    if (!command.skipHelp || detailed) {
      command.printBasicHelp(options, true);
    }

    if (detailed) {
      command.printDetailedHelp(options);
    }
  },

  _printJsonHelp: function(json) {
    var outputJsonString = JSON.stringify(json, function(key, value) {
      // build command has a recursive property
      if (value === path) {
        return 'path';
      }
      return value;
    }, 2);

    console.log(outputJsonString);
  },

  _lookupCommand: function(commandName) {
    var Command = this.commands[string.classify(commandName)] ||
                  lookupCommand(this.commands, commandName);

    return new Command({
      ui: this.ui,
      analytics: this.analytics,
      commands: this.commands,
      tasks: this.tasks,
      project: this.project,
      settings: this.settings,
      testing: this.testing,
      cli: this.cli
    });
  }
});
