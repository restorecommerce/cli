'use strict';

const fs          = require('fs');

const Promise 		= require('bluebird');
const SilentError = require('silent-error');

const Command     = require('../../models/command');
const debug 		  = require('debug')('rstc:commands/command/send-redis-command')

// Sub-command of Command.
module.exports = Command.extend({
	name: 'send-redis-command',
	description: 'Send a Redis command specified in a JSON file.',
	works: 'everywhere',
	availableOptions: [],
	anonymousOptions: [
    '<redis-command-file>'
  ],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		if (!this.superCommand.request) {
			const message = 'System error: Either a request was not' +
											' succesfully created in command "' + this.superCommand.name +
											'" or it wasn\'t passed down to command "' + this.name + '".';
			throw Error(message);
		}

    commandOptions.url = commandOptions.headers.Origin + '/commands/sendRedisCommand';

    commandOptions.path = rawArgs.shift();
		if(!commandOptions.path) {
			this.printBasicHelp();
			const message = 'Please provide a path to the JSON file containing the Redis command.';
			return Promise.reject(new SilentError(message));
		}

    let command;
		try {
      command = JSON.parse(fs.readFileSync(commandOptions.path, 'utf-8'));
		} catch(e) {
			const message = 'Invalid JSON in the command file:\n' + e;
			return Promise.reject(new SilentError(message));
		}

    commandOptions.body = command;

		const Task = this.availableTasks.SendRedisCommand;
		const task = new Task({
      request: this.superCommand.request,
      settings: this.settings,
      cli: this.cli,
			ui: this.ui
		});

		return task.run(commandOptions);
	}
});