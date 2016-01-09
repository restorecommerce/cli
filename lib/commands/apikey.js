'use strict';

const requireAsHash = require('../utilities/ext/require-as-hash');
const Command 			= require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/apikey')
//const lookupCommand = require('../cli/lookup-command');
const string 				= require('../utilities/ext/string');
const SilentError 	= require('silent-error');

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
			this.printAvailableCommands(options, commandOptions);
			//const message = ""
			return new Promise.reject(/*new SilentError(message)*/);
		}

		const _commandName = rawArgs.shift();
		const commandName = string.classify(_commandName);
		if (!this.availableCommands[commandName]) {
			this.printAvailableCommands(options, commandOptions);
			const message = 'Sub-command "' + _commandName + '" is not registered with "' + this.name + '".';
			return new Promise.reject(new SilentError(message));
		}

		const command = new this.availableCommands[commandName](options);

		return command.run(commandOptions, rawArgs);
	},

	printAvailableCommands: function(options, commandOptions) {
		console.log(this.printBasicHelp(commandOptions));
		console.log('Available commands for "' + this.name + '":\n');

		Object.keys(this.availableCommands).forEach(function(commandName) {
			const command = new this.availableCommands[commandName](options);
			console.log(command.printBasicHelp())
		}.bind(this));
	},
});


/*
	rawArgs.forEach(function(commandName) {
			const command = this._lookupCommand(commandName);
			command.printDetailedHelp(commandOptions);
	});
*/

/*
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
*/