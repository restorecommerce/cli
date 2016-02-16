'use strict';

// Something weird is going on -
// if console.log gets replaced by
// this.ui.writeLine, then only the
// first this.ui.writeLine gets printed.


// TO DO: fix ^^^^^^^^^^^^^^^^^^^^^^^^^

const Promise       = require('bluebird');

const string        = require('../utilities/ext/string');
const lookupCommand = require('../cli/lookup-command');
const Command       = require('../models/command');
const debug         = require('debug')('rstc:commands/help');

module.exports = Command.extend({
  name: 'help',
  description: 'Outputs the usage instructions for all commands or the requested command(s).',
  works: 'everywhere',
  aliases: [undefined, 'h', '--help', '-h'],
  availableOptions: [
    { name: 'json', type: Boolean, default: false }
  ],

  anonymousOptions: [
    '<command-name>'
  ],

  run: function (commandOptions, rawArgs) {
    let json = undefined;
    if (commandOptions.json) {
      json = {
        commands: []
      }
    }

    let options = {
      ui: this.ui,
      commands: this.commands,
      tasks: this.tasks,
      cli: this.cli
    };

    if (rawArgs.length === 0) {
      if (!commandOptions.json) {
        console.log('Available commands in rstc-cli:\n');
      }

      Object.keys(this.commands).forEach(function (commandName) {
        this._printBasicHelpForCommand(commandName, options, json);
      }, this);
    } else {
      // If args were passed to the help command,
      // attempt to look up the command for each of them.
      if (!commandOptions.json) {
        console.log('Requested rstc-cli commands:\n');
      }

      rawArgs.forEach(function (commandName) {
        this._printDetailedHelpForCommand(commandName, options, json);
      }, this);
    }

    if (commandOptions.json) {
      this._printJsonHelp(json);
    }

    return Promise.resolve();
  },

  _printBasicHelpForCommand: function (commandName, options, json) {
    if (json) {
      this._addCommandHelpToJson(commandName, false, options, json);
    } else {
      this._printHelpForCommand(commandName, false, options);
    }
  },

  _printDetailedHelpForCommand: function (commandName, options, json) {
    if (json) {
      this._addCommandHelpToJson(commandName, true, options, json);
    } else {
      this._printHelpForCommand(commandName, true, options);
    }
  },

  _addCommandHelpToJson: function (commandName, single, options, json) {
    var command = this._lookupCommand(commandName);
    debug('add')
    if (!command.skipHelp || single) {
      let jsonHelp = command.getJson(options);
      debug(jsonHelp)
      json.commands.push(jsonHelp);
    }
  },

  _printHelpForCommand: function (commandName, detailed, options) {
    var command = this._lookupCommand(commandName);

    if (!command.skipHelp) {
      if (detailed) {
        command.printDetailedHelp();
      } else {
        command.printBasicHelp(true);
      }
    }
  },

  _printJsonHelp: function (json) {
    var outputJsonString = JSON.stringify(json, null, this.settings.config.jsonFileIndent);
    console.log(outputJsonString);
  },

  _lookupCommand: function (commandName) {
    var Command = this.commands[string.classify(commandName)] ||
      lookupCommand(this.commands, commandName);

    return new Command({
      ui: this.ui,
      commands: this.commands,
      tasks: this.tasks,
      cli: this.cli
    });
  }
});
