'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/migrate')
//const Migrate 			= require('invend-migrate').Migrate;
const SilentError 	= require('silent-error');
const string        = require('../utilities/ext/string');

module.exports = Command.extend({
	name: 'migrate',
	description: '',
	//works: 'insideProject',

	availableOptions: [
		{ name: 'project',		type: String, 	default: undefined, aliases: ['p']																																							},
		{ name: 'entry', 			type: String, 	default: undefined,	aliases: ['e'],					description: 'Defaults to resolved specified project\'s endpoint.' 	},		
		{ name: 'apikey',			type: String,		default: undefined, aliases: ['key', 'k'],	description: 'Defaults to resolved specified project\'s API key.'	 	}
	],

	/*
	anonymousOptions: [
    '<command (Default: help)>'
	],
	*/
	
	run: function(commandOptions, rawArgs) {

		/*

		gulp.task('migrate', function(done) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  var pkg = require('./package.json');
  prompt(pkg.appId, function(apiKey) {
    var task = require('invend-migrate').migrate({
      appId: pkg.appId,
      apiKey: apiKey,
      protocol: 'https'
    });
    var command = process.argv[3];
    var name;
    switch (command) {
      case '--create':
        name = process.argv[4];
        task.create(name);
        done();
        break;
      case '--down':
        name = process.argv[4];
        task.down(name);
        done();
        break;
      case '--up':
        var mode = process.argv[4];
        task.up(mode, function(err) {
          if (err) throw err;
          done();
        });
        break;
      default:
        task.up('prod', function(err) {
          if (err) throw err;
          done();
        });
        break;
    }
  });
});

*/
		debug('commandOptions: ', commandOptions);
		debug('rawArgs: ', rawArgs);

		const options = {
			superCommand: this,

			ui: this.ui,
			analytics: this.analytics,
			commands: this.commands,
			tasks: this.tasks,
			project: this.project,
			settings: this.settings,
			testing: this.testing,
			cli: this.cli
		};

		if (rawArgs.length === 0) {
			this.printBasicHelp(options);
			//const message = ""
			return new Promise.reject(); // new SilentError(message)
		}

		const _commandName = rawArgs.shift();
		debug(this.name + ' received command: %s', _commandName)
		const commandName = string.classify(_commandName);

		if (!this.availableCommands[commandName]) {
			this.printBasicHelp(options);
			const message = 'Sub-command "' + _commandName + '" is not registered with "' + this.name + '".';
			return new Promise.reject(new SilentError(message));
		}

		if (commandName !== 'Job') {
			try {
				this.parseCommandOptions.bind(this)(options, commandOptions)
			} catch(e) {
				return new Promise.reject(e);
			}

			console.log('Initializing migrate Client -\n' +
									'Endpoint: ' + commandOptions.entry + '\n' +
									'API key: ' + commandOptions.apikey + '\n');

			this.migrate = new OssClient({
				entry: commandOptions.entry,
				apiKey: commandOptions.apikey
			})
		}

		const command = new this.availableCommands[commandName](options);

		command.beforeRun(commandOptions, rawArgs);

		return command.validateAndRun(rawArgs);
	},

	parseCommandOptions: function(options, commandOptions) {
		// No --project option specified, look for entry and apikey.
		if (!commandOptions.project) {
			if (!commandOptions.entry && !commandOptions.apikey) {
				this.printBasicHelp(options);
				const message = 'Either a project or an endpoint and api key must be specified.';
				throw new SilentError(message);
			}
		// --project option is specified, look for an overriding entry and apikey.
		} else {
			this.checkConfigurationFiles();
			
			if (!this.settings.project[commandOptions.project] ||
				!this.settings.project[commandOptions.project].entry) {
				const message = 'Specified project\'s "' + commandOptions.project +
												'" endpoint ("entry") could not be located in the' +
												'".restore-commerce-project.json" file.';
				throw new SilentError(message);
			}

			var entry = this.settings.project[commandOptions.project].entry;

			if (!this.settings.credentials[commandOptions.project] ||
				!this.settings.credentials[commandOptions.project].apiKey) {
				const message = 'Specified project\'s "' + commandOptions.project +
												'" API key ("apiKey") could not be located in the' +
												'".restore-commerce-credentials.json" file.'
				throw new SilentError(message);
			}

			var apikey = this.settings.credentials[commandOptions.project].apiKey;

			if (commandOptions.entry) {
				const message = 'Overriding default endpoint ("' + entry +
												'") with "' + commandOptions.entry + '".';
				console.log(message);
			} else {
				commandOptions.entry = entry;
			}

			if (commandOptions.apikey) {
				const message = 'Overriding default API key ("' + apikey +
												'") with "' + commandOptions.apikey + '".';
				console.log(message);
			} else {
				commandOptions.apikey = apikey;
			}
		}
	},

	checkConfigurationFiles: function() {
		if (!Object.keys(this.settings.project).length) {
			throw new SilentError('No endpoint entries were found in the "restore-commerce-project.json" file.');
		}

		if (!Object.keys(this.settings.credentials).length) {
			throw new SilentError('No credential entries were found in the "restore-commerce-credentials.json" file.');
		}
	}
});