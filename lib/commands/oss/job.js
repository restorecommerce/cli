'use strict';

const Command       = require('../../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/oss/job')
const SilentError 	= require('silent-error');
const Oss 					= require('../../oss-client/');

// Sub-command of Oss.
module.exports = Command.extend({
	name: 'job',
	description: 'Start a job.',
	works: 'insideProject',
	/*availableOptions: [
		{ name: 'private',					type: Boolean, 	default: false, aliases: ['p']	},
		{ name: 'max-age',					type: Number,		default: false,	aliases: ['ma']	},
		{ name: 'no-cache',					type: Boolean, 	default: false, aliases: ['nc']	},
		{ name: 'must-revalidate',	type: Boolean, 	default: false,	aliases: ['mr']	},
		{ name: 'proxy-revalidate', type: Boolean, 	default: false, aliases: ['pr'] },
	],
	*/
	anonymousOptions: [
    '<iri> <source>'
  ],
  
	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		if(rawArgs.length < 2) {
    	console.log(this.printBasicHelp(commandOptions));
			const message = 'A source file and a destination object must be specified.';
			return new Promise.reject(new SilentError(message));
		}

		commandOptions.source 			= rawArgs.shift();
		commandOptions.destination 	= rawArgs.shift();

		const Task = this.availableTasks.Job;
		const task = new Task({
			ui: this.ui
		});
		
		return task.run(commandOptions).then(function(result) {
			//
		});
	}
});
