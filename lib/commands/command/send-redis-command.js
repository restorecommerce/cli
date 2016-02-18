'use strict';

const fs          = require('fs');

const Promise 		= require('bluebird');
const SilentError = require('silent-error');

const Command     = require('../../models/command');
const debug 		  = require('debug')('rstc:commands/command/send-redis-command')

// Sub-command of Command.
module.exports = Command.extend({
	name: 'send-redis-command',
	description: 'Send a redis command.',
	works: 'everywhere',
	availableOptions: [],
	anonymousOptions: [],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

    commandOptions.url = this.superCommand.request.headers.Origin + 'sendRedisCommand';

    const redisCommandFile = rawArgs.shift();
		if(!redisCommandFile) {
			this.printBasicHelp();
			const message = 'Please provide a path to the JSON file containing the Redis command.';
			return Promise.reject(new SilentError(message));
		}

    let command;
		try {
      command = JSON.parse(fs.readFileSync(redisCommandFile, 'utf-8'));
		} catch(e) {
			const message = 'Invalid JSON in the command file:\n' + e;
			return Promise.reject(new SilentError(message));
		}

    const request = this.superCommand.request;
    request.body = command;


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