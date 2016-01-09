'use strict';

var UnknownCommand = require('../commands/unknown');

module.exports = function(commands, commandName, commandArgs, optionHash) {
  var options = optionHash || {};
  var project = options.project;
  var ui = options.ui;

  function aliasMatches(alias) {
    return alias === commandName;
  }

  function findCommand(commands, commandName) {
    for (var key in commands) {
      var command = commands[key];

      var name = command.prototype.name;
      var aliases = command.prototype.aliases || [];

      if (name === commandName || aliases.some(aliasMatches)) {
        return command;
      }
    }
  }

  // Attempt to find command in rstc-cli core commands.
  var command = findCommand(commands, commandName);
  /*
  var addonCommand;
  // Attempt to find command within addons
  if (project && project.eachAddonCommand) {
    project.eachAddonCommand(function(addonName, commands) {
      addonCommand = findCommand(commands, commandName);
      return !addonCommand;
    });
  }

  if (command && addonCommand) {
    if (addonCommand.overrideCore) {
      ui.writeWarnLine('An rstc-addon has attempted to override the core command "' +
              command.prototype.name + '". The addon command will be used as the overridding was explicit.');

      return addonCommand;
    }

    ui.writeWarnLine('An rstc-addon has attempted to override the core command "' +
                            command.prototype.name + '". The core command will be used.');
    return command;
  }
  */
  if (command) {
    return command;
  }
  // Very optional:
  // If no command was found, maybe the user tried
  // using a sub-command as a first level command.
  // Traverse each command and try to find it to print help. 
  /*
  Object.keys(commands).forEach(function(commandName) {
    commands[commandName].
  });
  */

  /*
  if(addonCommand) {
    return addonCommand;
  }
  */

  // If a command wasn't found, return 'UnknownCommand'.
  return UnknownCommand.extend({
    commandName: commandName
  });
};