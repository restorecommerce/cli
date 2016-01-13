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
											'  succesfully created in command "' + this.superCommand.name +
											' " or it wasn\'t passed down to command "' + this.name + '".';
			return new Promise.reject(new SilentError(message));
		}

		if(rawArgs.length < 2) {
    	console.log(this.printBasicHelp(commandOptions));
			const message = 'A source file and a destination object must be specified.';
			return new Promise.reject(new SilentError(message));
		}

		commandOptions.iri 			= rawArgs.shift();
		// They just should be made options.
		/*
			var sourceOrMeta = JSON.parse(rawArgs.shift());
			if(typeof sourceOrMeta !== 'object') commandOptions.metaData = sourceOrMeta;
			commandOptions.metaData 	= rawArgs.shift(); // source or metaData, can check by typeof == 'object'
		*/
		/*
		    os.put(remoteObject, fs.createReadStream(localObject), metaData).then((res) => {
		      res.statusCode.should.equal(204);
		      done();
		    });
		 */

		/*
		if(rawArgs.length < 1) {
    	console.log(this.printBasicHelp(commandOptions));
			const message = 'An IRI must be given.';
			return new Promise.reject(new SilentError(message));
		}
		*/

		const Task = this.availableTasks.Put
		const task = new Task({
			oss: this.superCommand.oss,
			ui: this.ui
		});
		
		return task.run(commandOptions);
	}
});