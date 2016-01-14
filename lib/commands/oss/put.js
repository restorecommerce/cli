'use strict';

'use strict';

const Command       = require('../../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/oss/put')
const SilentError 	= require('silent-error');
const fs = require('fs');

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

	anonymousOptions: [
    '<iri> <source> <meta-data> <access-control> <form-options>'
  ],

/**
 * Put an object, object + meta data or only meta data
 * @param {String}                        iri           the target IRI
 * @param {ReadableStream|Buffer|String}  source        the file to be uploaded. Null to upload only metaData.
 *                                                      No checks of source type are made.
 *                                                      It's passed directly to request's form
 * @param {Object}                        metaData      file meta-data
 * @param {Object}                        accessControl file access control
 * @param {Object}                        formOptions   form-specific metadata for request
 *                                                      E.g. {
 *                                                        filename: 'unicycle.jpg',
 *                                                        contentType: 'image/jpg',
 *                                                        knownLength: 19806
 *                                                       }
 */

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		if(!this.superCommand.oss) {
    	console.log(this.printBasicHelp(commandOptions));
			const message = 'System error: Either an Object Storage Service Client was not' +
											' succesfully created in command "' + this.superCommand.name +
											' " or it wasn\'t passed down to command "' + this.name + '".';
			return new Promise.reject(new SilentError(message));
		}


		commandOptions.iri = rawArgs.shift();
		if(!commandOptions.iri) {
			 console.log(this.printBasicHelp(commandOptions));
			const message = 'An IRI must be given.';
			return new Promise.reject(new SilentError(message));
		}

		var _sourceOrMetaData = rawArgs.shift();
		if(!_sourceOrMetaData) {
			console.log(this.printBasicHelp(commandOptions));
			const message = 'A source for an object or meta data (or both) must be given.';
			return new Promise.reject(new SilentError(message));
		}

		// TO DO: For every object argument fallback
		// on a path for a JSON file (or vice versa).

		var sourceOrMetaData
		try {
			sourceOrMetaData = JSON.parse(_sourceOrMetaData);
		} catch (e) {
			console.error(e); process.exit();
		}

		if (typeof sourceOrMetaData === 'object') {
			commandOptions.metaData = sourceOrMetaData;
		} else {
			commandOptions.source = sourceOrMetaData;
			try {
				commandOptions.metaData = JSON.parse(rawArgs.shift())
			} catch (e) {
				console.error(e); process.exit();
			}
		}

		try {
			commandOptions.accessControl = JSON.parse(rawArgs.shift());
		} catch (e) {
			console.error(e); process.exit();
		}


		try {
			commandOptions.formOptions = JSON.parse(rawArgs.shift());
		} catch (e) {
			console.error(e); process.exit();
		}

		const Task = this.availableTasks.Put
		const task = new Task({
			oss: this.superCommand.oss,
			ui: this.ui
		});
		
		return task.run(commandOptions).then(function(result) {
			console.log(result);
		});
	}
});