'use strict';

'use strict';

const Command       = require('../../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/oss/put')
const SilentError 	= require('silent-error');

// Sub-command of Oss.
module.exports = Command.extend({
	name: 'put',
	description: 'Put an object, object + meta data or only meta data to a given IRI.',
	works: 'insideProject',
	availableOptions: [
		{ name: 'private',					type: Boolean, 	default: false, aliases: ['priv']	},
		{ name: 'max-age',					type: Number,		default: false,	aliases: ['ma']	},
		{ name: 'no-cache',					type: Boolean, 	default: false, aliases: ['nc']	},
		{ name: 'must-revalidate',	type: Boolean, 	default: false,	aliases: ['mr']	},
		{ name: 'proxy-revalidate', type: Boolean, 	default: false, aliases: ['pr'] },
	],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		if(!this.superCommand.oss) {
    	console.log(this.printBasicHelp(commandOptions));
			const message = 'System error: Either an Object Storage Service Client was not' +
											'  succesfully created in command "' + this.superCommand.name +
											' " or it wasn\'t passed down to command "' + this.name + '".';
			return new Promise.reject(new SilentError(message));
		}

		if(rawArgs.length < 2) {
    	console.log(this.printBasicHelp(commandOptions));
			const message = 'A source file and a destination object must be specified.';
			return new Promise.reject(new SilentError(message));
		}


/*
options.iri, options.source, options.metaData,
									 options.accessControl, options.formOptions
									 */
		commandOptions.source 			= rawArgs.shift();
		commandOptions.destination 	= rawArgs.shift();

		/*
		if(rawArgs.length < 1) {
    	console.log(this.printBasicHelp(commandOptions));
			const message = 'An IRI must be given.';
			return new Promise.reject(new SilentError(message));
		}
		*/

		commandOptions.iri = rawArgs.shift();

		const Task = this.availableTasks.Put
		const task = new Task({
			oss: this.superCommand.oss,
			ui: this.ui
		});
		
		return task.run(commandOptions);
	}
});