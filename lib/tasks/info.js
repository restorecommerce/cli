'use strict';

const Promise     = require('bluebird');
const Task        = require('../models/task');
const fs          = require('co-fs')
const co          = require('co');
const debug       = require('debug')('rstc:tasks/info');
const SilentError = require('silent-error');

module.exports = Task.extend({
	run: function(options) {
		const projectPath = options.base + '/.restore-commerce-project.json';
		const credentialsPath = options.base + '/.restore-commerce-credentials.json';
    const self = this;
		debug('projectPath: (%s)', projectPath);
		debug('credentialsPath (%s)', credentialsPath);
    return co(function*() {
      let project = yield self.getProject(projectPath);
      let credentials = yield self.getCredentials(credentialsPath);
      let info = {};
      if(options.all) {
        for(let field in project) {
          info[field] = {
            Entry: project[field].entry,
            Key: credentials[field] ? credentials[field].apiKey : 'Not specified.'
          }
        }
      } else {
        info.Entry = project[options.project] ? project[options.project].entry : 'Not specified.';
        info.Key =  credentials[options.project] ? credentials[options.project].apiKey : 'Not specified.';
      }

      console.log(info);
      return info;
    });
	},

  getProject: function*(path) {
   try {
     let content = yield fs.readFile(path, 'utf-8');
     return JSON.parse(content);
   } catch (e) {
     const message = 'Invalid JSON in ".restore-commerce-project.json" file:\n' + e;
     return Promise.reject(new SilentError(message));
   }
  },

  getCredentials: function*(path) {
   try {
     let content = yield fs.readFile(path, 'utf-8');
     return JSON.parse(content);
   } catch (e) {
     const message = 'Invalid JSON in ".restore-commerce-credentials.json" file:\n' + e;
     return Promise.reject(new SilentError(message));
   }
  }
});