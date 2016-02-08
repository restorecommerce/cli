'use strict';

const Command       = require('../../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/gss/import')
const SilentError 	= require('silent-error');
const fs						= require('co-fs');
const co            = require('co');
const chalk 				= require('chalk');

// Sub-command of Gss.
module.exports = Command.extend({
	name: 'import',
	description: 'Imports the resources defined in a file.',
	aliases: ['i'],
	works: 'everywhere',

	availableOptions: [
		{ name: 'mode',						type: String,		default: 'prod',	aliases: ['m'],		description: 'Either "prod" or "dev".'					},
		{ name: 'only-modified',	type: Boolean,	default: false,		aliases: ['om'],	description: 'Import only modified resources.'	}
	],

	anonymousOptions: [
    '<file - defaults to "import.json" in current, base or home directory>'
  ],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		if (!this.superCommand.gss) {
			this.printBasicHelp(commandOptions);
			const message = 'System error: Either a Graph Storage Service Client was not' +
											' succesfully created in command "' + this.superCommand.name +
											'" or it wasn\'t passed down to command "' + this.name + '".';
			return Promise.reject(new SilentError(message));
		}

    if(commandOptions.mode && commandOptions.mode != 'prod' && commandOptions.mode != 'dev') {
			this.printBasicHelp(commandOptions);
			const message = 'Invalid "--mode" option. Choose between "prod" and "dev".';
			return Promise.reject(new SilentError(message));
		}

		commandOptions.path = rawArgs.shift();

    const self = this;
    return co(function*() {
			if (!commandOptions.path) {
				commandOptions.path = yield self.findImportFiles.bind(self)();
			}

			const Task = self.availableTasks.Import;
			const task = new Task({
				gss: self.superCommand.gss,
				ui: self.ui
			});

			return task.run(commandOptions);
    });
	},

	findImportFiles: function() {
    const self = this;
		return co(function*() {
			console.log('Import file not specified. Looking up "import.json" files.');
      let currDir = process.cwd() + '/import.json';
      let baseDir = self.cli.root + '/import.json';
      let homeDir = process.env[(process.platform == 'win32') ?
        'USERPROFILE' : 'HOME'] + '/import.json';
      let paths = [currDir, baseDir, homeDir];

      function* existingPaths(paths) {
        let arr = [];
        for (let i = 0; i < paths.length; i++) {
          if (yield pathExists(paths[i]))
            arr.push(paths[i]);
        }

        function* pathExists(path) {
          try {
            let stats = yield fs.stat(path);
            return stats.isFile();
          } catch (e) {
            return false;
          }
        }

        return arr;
      }

      let choices = yield existingPaths(paths);
      if (!choices.length) {
        throw new SilentError('No "import.json" file found in current,' +
                              ' project base or home directory.');
			} else {
				// 'Add a "None" option only if "import.json" file wasn't found in the cwd.
				if(choices.indexOf(currDir) === -1)
					choices.unshift('None');

				const inquirer = require('inquirer');
				const question = {
					type: 'list',
					name: 'file',
					message: 'Which "import.json" file to use?',
					choices: choices
				};

				return new Promise((resolve, reject) => {
          inquirer.prompt([question], (answers) => {
					if(answers.file === 'None') reject(new SilentError('Aborted operation.'));
						else resolve(answers.file);
          })
        });
			}
		});
	}
});