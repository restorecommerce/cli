'use strict';

const requireAsHash = require('../utilities/ext/require-as-hash');
const Command = require('../models/command');
const Task = require('../models/task');
const Promise = require('bluebird');
const debug = require('debug')('rstc:commands/apikey')
const util = require('util')
const lookupCommand = require('../cli/lookup-command');
const string = require('../utilities/ext/string');
const path = require('path');

module.exports = Command.extend({
	name: 'apikey',
	description: 'API key related commands.',
	//works: 'insideProject', ?
	
	initialize: function() {
		this.superCommand = null;
		this.availableCommands = this.lookupAvailableCommands();
		this.availableTasks = this.lookupAvailableCommands();

	},

	run: function(commandOptions, rawArgs) {
		this.initialize();
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

		if (rawArgs.length === 0) {
			this.printAvailableCommands();
		}

		const commandName = string.classify(rawArgs.shift());
		const command = new this.availableCommands[commandName](options);

		return command.run(commandOptions, rawArgs);

		// Iterate through each arg beyond the initial 'help' command,
		// and try to display usage instructions.
		rawArgs.forEach(function(commandName) {
			const command = this._lookupCommand(commandName);
			command.printDetailedHelp(commandOptions);
		});

	},

	printAvailableCommands: function() {
		console.log(this.printBasicHelp(commandOptions));
		console.log('Available commands for "' + this.name + '":\n');

		Object.keys(this.availableCommands).forEach(function(commandName) {
			const command = new this.availableCommands[commandName](options);
			console.log(command.printBasicHelp())
		}.bind(this));

		return new Promise.reject();
	},

	_lookupCommand: function(commandName) {
		var Command = this.commands[string.classify(commandName)] ||
			lookupCommand(this.commands, commandName);

		return new Command({
			ui: this.ui,
			commands: this.commands,
			tasks: this.tasks,
			project: this.project,
		});
	}
});