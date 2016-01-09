const requireAsHash = require('../utilities/require-as-hash');
const path 					= require('path');
const debug 				= require('debug')('rstc:cli/ext/command')
const EOL 					= require('os').EOL;
var Command = require('../models/command');

module.exports = Command;

Command.prototype.getSuperCommandChain = function(_seperator) {
	const seperator = _seperator || ' ';
	let superCommandChain = [this.name];
	let cmd = this;

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
	const commandPath = './' + path.relative(__dirname, this.settings.pathToCommands + '/' + commandChain + '/commands') + '/*.js';
	const commands = requireAsHash(commandPath, Command);

	debug('"' + this.name + '" command sub-commands:');
	debug(commands)

	return commands;
};

Command.prototype.lookupAvailableTasks = function() {
	const commandChain = this.getSuperCommandChain('/')
	const taskPath = './' + path.relative(__dirname, this.settings.pathToTasks + '/' + commandChain + '/tasks') + '/*.js';
	const tasks = requireAsHash(taskPath, Task);

	debug('"' + this.name + '" command tasks:');
	debug(tasks)

	return tasks;
};
