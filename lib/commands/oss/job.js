'use strict';

const path 					=	require('path');
const fs 						= require('fs');

const chalk         = require('chalk');
const Promise 			= require('bluebird');
const SilentError 	= require('silent-error');

const Oss 					= require('restore-oss-client');
const Command       = require('../../models/command');
const confirm       = require('../../utilities/confirm');
const debug 				= require('debug')('rstc:commands/oss/job')

// Sub-command of Oss.
module.exports = Command.extend({
	name: 'job',
	description: 'Start a job.',
	works: 'everywhere',

	availableOptions: [
    { name: 'diff-base',    type: String,		default: 'md5', aliases: ['db'], description: 'The base to compare the local and remote objects.' 	    },
		{ name: 'diff-compare',	type: Boolean,	default: false, aliases: ['d'],  description: 'Resolve differences between the local and remote object.'}
	],

	anonymousOptions: [
    '<job-file>'
  ],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		if(!this.superCommand.oss) {
			const message = 'System error: Either a Object Storage Service Client was not' +
											' succesfully created in command "' + this.superCommand.name +
											'" or it wasn\'t passed down to command "' + this.name + '".';
			throw Error(message);
		}

		const jobFile = rawArgs.shift();
		if(!jobFile) {
			this.printBasicHelp();
			const message = 'A path to a job file must be given.';
			return Promise.reject(new SilentError(message));
		}

    let job;
		try {
      job = JSON.parse(fs.readFileSync(jobFile, 'utf-8'));
		} catch(e) {
			const message = 'Invalid JSON in job file:\n' + e;
			return Promise.reject(new SilentError(message));
		}

    if(!job.options) {
			job.options = {};
      debug('Job doesn\'t have any options specified.');
		}

    if(!job.options.base) {
      job.options.base = process.cwd();
      const message = 'No \'base\' directory set in job file.' +
                      ' Using current working project\'s directory (\'' +
                      job.options.base + '\').';
      console.log(chalk.cyan(message));
    }

    let options = {
      oss: this.superCommand.oss,
      diff: commandOptions.diffCompare ? true : false,
      diffCb: commandOptions.diffCompare ? confirm.jobUploads : false,
      diffBase: commandOptions.diffBase
    };

		const ossJobProcessor = Oss.ossProc(options);

    job.options.processor = ossJobProcessor;

    commandOptions.jobProcessor = Oss.jobproc(job);

		const Task = this.availableTasks.Job;
		const task = new Task({
      cli: this.cli,
			ui: this.ui
		});

		return task.run(commandOptions);
	}
});