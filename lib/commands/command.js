'use strict';

const url	        = require('url');

const Promise 		= require('bluebird');
const SilentError = require('silent-error');

const string      = require('../utilities/ext/string');
const validate    = require('../utilities/validate');
const rp          = require('request-promise');

const Command     = require('../models/command');
const debug 		  = require('debug')('rstc:commands/command')

module.exports = Command.extend({
	name: 'command',
	description: 'Commands to apply on the server.',
	works: 'everywhere',
	availableOptions: [
		{ name: 'project',		type: String, 	default: undefined, aliases: ['p'],					description: 'Which project\'s configuration to use (can be overridden).'	},
		{ name: 'entry', 			type: String, 	default: undefined,	aliases: ['e'],					description: 'Defaults to specified project\'s entry point.' 							},
		{ name: 'apikey',			type: String,		default: undefined, aliases: ['key', 'k'],	description: 'Defaults to specified project\'s API key.'	 								},
		{ name: 'protocol',		type: String,		default: 'http',	  aliases: [],						/* description: 'Defaults to "http".' */ 																	}
	],

	anonymousOptions: [
    '<command>'
	],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: ', commandOptions);
		debug('rawArgs: ', rawArgs);

    const cmdNameArg = rawArgs.shift();
    if (!cmdNameArg) {
      this.printDetailedHelp();
      return Promise.resolve();
    }

    debug(this.name + ' received command: %s', cmdNameArg)
    const commandName = string.classify(cmdNameArg);

		if (!this.availableCommands[commandName]) {
			this.printDetailedHelp();
			const message = 'Sub-command "' + cmdNameArg + '" is not registered with "' + this.name + '".';
			return Promise.reject(new SilentError(message));
		}

		try {
			commandOptions = validate.applicationOptions(this, commandOptions, this.settings);
		} catch (e) {
			return Promise.reject(e);
		}

    let _url = url.format({
      protocol: commandOptions.protocol,
      hostname: commandOptions.entry
    });

    commandOptions.headers = {
      Accept: "application/ld+json",
      Origin: _url,
      Authorization: "Key " + commandOptions.apikey,
      "Content-Type": "application/ld+json; charset=UTF-8",
    };

    debug('headers: %o', commandOptions.headers);
    this.request = rp.defaults({
	     headers: commandOptions.headers,
       json: true
    });

    const options = {
      commands: this.commands,
      settings: this.settings,
      superCommand: this,
      tasks: this.tasks,
      cli: this.cli,
      ui: this.ui,
    };

		const command = new this.availableCommands[commandName](options);

		command.beforeRun(commandOptions, rawArgs);

		return command.validateAndRun(rawArgs, commandOptions);
	}
});