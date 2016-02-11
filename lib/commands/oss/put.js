'use strict';

const path 					=	require('path');
const fs 						= require('fs');

const chalk 				= require('chalk');
const Promise 			= require('bluebird');
const SilentError 	= require('silent-error');

const camelize      = require('../../utilities/ext/string').camelize;
const Command       = require('../../models/command');
const debug 				= require('debug')('rstc:commands/oss/put')

// Sub-command of Oss.
module.exports = Command.extend({
	name: 'put',
	description: 'Put an object, object + meta data or only meta data to a given IRI. ',
	works: 'everywhere',

	availableOptions: [
		{ name: 'private',					type: Boolean, 	default: false, aliases: ['priv']	},
		{ name: 'max-age',					type: Number,		default: 0,			aliases: ['ma']		},
		{ name: 'no-cache',					type: Boolean, 	default: false, aliases: ['nc']		},
		{ name: 'must-revalidate',	type: Boolean, 	default: false,	aliases: ['mr']		},
		{ name: 'proxy-revalidate', type: Boolean, 	default: false, aliases: ['pr']		}
	],

	anonymousOptions: [
    '<iri> <resource>'
  ],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);
	  let options = {};

		if(!this.superCommand.oss) {
			const message = 'System error: Either a Object Storage Service Client was not' +
											' succesfully created in command "' + this.superCommand.name +
											'" or it wasn\'t passed down to command "' + this.name + '".';
			throw Error(message);
		}

		options.iri = rawArgs.shift();
		if(!options.iri) {
    	this.printBasicHelp();
			const message = 'An IRI to put to must be given.';
			return Promise.reject(new SilentError(message));
		}

		const resource = rawArgs.shift();
		if(resource) {
      const fullPath = path.resolve(resource);
      options.source = fs.createReadStream(fullPath);
		}

    options.metaData = {};
    if (commandOptions.private)
      options.metaData["private"] = commandOptions.private;
    if (commandOptions.maxAge)
      options.metaData["max-age"] = commandOptions.maxAge;
    if (commandOptions.noCache)
      options.metaData["no-cache"] = commandOptions.noCache;
    if (commandOptions.mustRevalidate)
      options.metaData["must-revalidate"] = commandOptions.mustRevalidate;
    if (commandOptions.proxyRevalidate)
      options.metaData["proxy-revalidate"] = commandOptions.proxyRevalidate;

		const Task = this.availableTasks.Put
		const task = new Task({
			oss: this.superCommand.oss,
      cli: this.cli,
			ui: this.ui
		});

		return task.run(options);
	}
});