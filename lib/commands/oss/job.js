'use strict';

const Command       = require('../../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/oss/job')
const SilentError 	= require('silent-error');
const Oss 					= require('restore-oss-client');
const path 					=	require('path');
const fs 						= require('fs');

// Sub-command of Oss.
module.exports = Command.extend({
	name: 'job',
	description: 'Start a job.',
	//works: 'insideProject',

	availableOptions: [
		{ name: 'diff',				type: Boolean,	default: false, 		aliases: ['d']  },
		{ name: 'diff-base',	type: String,		default: undefined, aliases: ['db'] },
	],

	anonymousOptions: [
    '<job-file>'
  ],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
		debug('rawArgs: ', rawArgs);

		var jobArg = rawArgs.shift();
		if(!jobArg) {
			this.printBasicHelp(commandOptions);
			const message = 'A job or path to a job file must be given.';
			return Promise.reject(new SilentError(message));
		}

		var _job = jobArg;

		try {
			var jobFile = path.parse(jobArg);
			debug('Job file meta: %o', jobFile);
			_job = fs.readFileSync(jobArg, 'utf8')
		} catch(e) {
			debug('jobArg is a job');
		}

		var job;
		try {
			job = JSON.parse(_job);
		} catch (e) {
			const message = 'Invalid JSON in job:\n' + e;
			return Promise.reject(new SilentError(message));
		}

		const ossJobProcessor = Oss.ossProc({
      oss: this.superCommand.oss,
			diff: commandOptions.diff,
			diffBase: commandOptions.diffBase,
			diffCb: commandOptions.diffCb
		});

		if(!job.options) {
			job.options = {};
      debug('Job doesn\'t have any specified options.');
			/*
			const message = 'Job doesn\'t have any specified options.';
			return new Promise.reject(new SilentError(message));
			*/
		}

    job.options.processor = ossJobProcessor;

    commandOptions.jobProcessor = Oss.jobproc(job);

		const Task = this.availableTasks.Job;
		const task = new Task({
			ui: this.ui
		});

		return task.run(commandOptions);
	}
});