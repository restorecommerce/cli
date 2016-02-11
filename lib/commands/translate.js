'use strict';

const Promise			= require('bluebird');
const SilentError = require('silent-error');

const validate    = require('../utilities/validate');
const Command 		= require('../models/command');
const debug 			= require('debug')('rstc:commands/translate');
const tmp 	      = require('tmp');

const i18nTmpDir = tmp.tmpNameSync();

module.exports = Command.extend({
	name: 'translate',
	description: 'Converts localized text resources in YAML format to JSON-LD resources of type \'/classes/Text\'. \nBy specifying a target application by the \'--project\' option or \'--entry\' and \'apikey\' options, the translated resources will also be imported to the application (to \'/text\' by default, specifiable by the \'--resource\' option). \nTranslated resource destination directory defaults to \'/tmp/\'.',
	aliases: ['t'],
	works: 'everywhere',
	availableOptions: [
		{ name: 'project',	type: String, default: undefined, aliases: ['p'],					description: 'Which project\'s configuration to use (can be overridden).'	},
		{ name: 'entry',		type: String, default: undefined, aliases: ['e'],					description: 'Defaults to specified project\'s entry point.'							},
		{ name: 'apikey',		type: String,	default: undefined, aliases: ['key', 'k'],	description: 'Defaults to specified project\'s api key.'									},
	  { name: 'protocol',	type: String,	default: 'http',	  aliases: [],				 	  /* description: 'Defaults to "http".' */ 															    },
    { name: 'resource',	type: String,	default: '/text',	  aliases: ['r'],				 	/* description: 'Defaults to "/text".' */ 														    }
  ],
	anonymousOptions: [
    '<i18n manifest> <i18n directory> <destination directory>'
  ],

  run: function (commandOptions, rawArgs) {

    if (commandOptions.project || commandOptions.entry || commandOptions.apikey) {
      try {
        commandOptions = validate.applicationOptions(this, commandOptions, this.settings);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    commandOptions.manifest = rawArgs.shift();
    if (!commandOptions.manifest) {
      this.printBasicHelp();
      const message = 'Path to the i18n manifest file must be provided.';
      return Promise(new SilentError(message));
    }

    commandOptions.src = rawArgs.shift();
    if (!commandOptions.src) {
      this.printBasicHelp();
      const message = 'Path to the i18n directory to be used must be provided.';
      throw Promise(new SilentError(message));
    }

    commandOptions.dest = rawArgs.shift();
    if (!commandOptions.dest) {
      commandOptions.dest = i18nTmpDir;
      const message = 'Destination directory not specified. Defaulting to \'' + i18nTmpDir + '\'.';
      console.log(message);
      if (!commandOptions.entry) {
        console.log('Are you sure you just wanted to translate the resources to \'' + i18nTmpDir + '\'?');
      }
    }

    debug('Translating with options: %o', commandOptions);
    const Task = this.availableTasks.Translate
    const task = new Task({
      ui: this.ui
    });

    return task.run(commandOptions);
  }
});
