'use strict';

const Command       = require('../../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/oss/put')
const SilentError 	= require('silent-error');
const path 					=	require('path');
const fs 						= require('fs');
const camelize      = require('../../utilities/ext/string').camelize;
const chalk 				= require('chalk');

// Sub-command of Oss.
module.exports = Command.extend({
	name: 'put',
	description: 'Put an object, object + meta data or only meta data to a given IRI. '/* +
							 'JSON file properties: "source", "meta-data", "access-control", "form-options".'*/,
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
   /* var cacheControlArray = [];
    for(var option in commandOptions) {
      cacheControlArray.push(option);
    }
    if(commandOptions.private) cacheControl;*/

		if(!this.superCommand.oss) {
    	this.printBasicHelp(commandOptions);
			const message = 'System error: Either an Object Storage Service Client was not' +
											' succesfully created in command "' + this.superCommand.name +
											' " or it wasn\'t passed down to command "' + this.name + '".';
			return Promise.reject(new SilentError(message));
		}


		commandOptions.iri = rawArgs.shift();
		if(!commandOptions.iri) {
			this.printBasicHelp(commandOptions);
			const message = 'An IRI must be given.';
			return Promise.reject(new SilentError(message));
		}

		const resource = rawArgs.shift();
		if(!resource) {
			this.printBasicHelp(commandOptions);
			const message = 'A path to a file must be provided.';
			return Promise.reject(new SilentError(message));
		}

    const fullPath = path.resolve(resource);
    commandOptions.source = fs.createReadStream(fullPath);
    //commandOptions.metaData = {
    //  cacheControl:
   // };

    // Parsing and looking into the file only necessary
    // if any options are actually inside the file.

		/*
    var json;
		try {
			const fileMeta = path.parse(pathToJson);
			debug('JSON file meta: %o', fileMeta);

			try {
				json = JSON.parse(fs.readFileSync(pathToJson, 'utf8'));
			} catch(e) {
				const message = 'Invalid JSON:\n' + e;
				return Promise.reject(new SilentError(message));
			}

		} catch(e) {
			return Promise.reject(new SilentError(e));
		}

		var mergedOptions = {};

		// Camelize and merge JSON file options with the default values.
		this.availableOptions.forEach(function(option) {
			const camelized = camelize(option.name);
			// Command line arguments take precedence over JSON file options.
			// TO DO: Alert on JSON file property override with commandOptions?
			if (commandOptions[camelized] !== option.default) {
				if (json[option.name]) {
					console.log(chalk.red('Overrided JSON file\'s (' + pathToJson + ') "' + option.name +
					 						'" (' + json[option.name] + ') with "' + commandOptions[camelized] +'".'));
				} else {
					commandOptions[camelized] = json[option.name];
				}
			}
		}.bind(this));
    */

		debug('commandOptions passed to "%s" task: %o', this.name, commandOptions)

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