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
		{ name: 'project',		type: String, 	default: undefined, aliases: ['p'],					description: 'Which project\'s configuration to use (can be overrided).'	},
		{ name: 'entry', 			type: String, 	default: undefined,	aliases: ['e'],					description: 'Defaults to specified project\'s endpoint.' 								},
		{ name: 'apikey',			type: String,		default: undefined, aliases: ['key', 'k'],	description: 'Defaults to specified project\'s API key.'	 								},
		{ name: 'diff',				type: Boolean,	default: false, 		aliases: ['d']																																										},
		{ name: 'diff-base',	type: String,		default: undefined, aliases: ['db']																																										},
		{ name: 'diff-cb',		type: Function,	default: undefined, aliases: ['dcb']																																									}
	],

	anonymousOptions: [
    '<job-file>'
  ],

	run: function(commandOptions, rawArgs) {
		debug('commandOptions: %o', commandOptions)
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

		try {
			this.superCommand.parseCommandOptions.bind(this)(options, commandOptions);
		} catch (e) {
			return new Promise.reject(e);
		}

		var jobArg = rawArgs.shift();
		if(!jobArg) {
			this.printBasicHelp(commandOptions);
			const message = 'A job or path to a job file must be given.';
			return new Promise.reject(new SilentError(message));
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
			return new Promise.reject(new SilentError(message));
		}

		debug(job);

		const ossJobProcessor = Oss.ossProc({
			entry: commandOptions.entry,
			apiKey: commandOptions.apikey,
			diff: commandOptions.diff,
			diffBase: commandOptions.diffBase,
			diffCb: commandOptions.diffCb
		});

		if(!job.options) {
			job.options = {};

			/*
			const message = 'Job doesn\'t have any specified options.';
			return new Promise.reject(new SilentError(message));
			*/
		}

    job.options.processor = ossJobProcessor;

    commandOptions.jobProcessor = Oss.jobproc(job);

		const Task = this.availableTasks.Job;
		const task = new Task({
			oss: this.superCommand.oss,
			ui: this.ui
		});

		return task.run(commandOptions).then(function(result) {
			//
		});
	}
});
