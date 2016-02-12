'use strict';

const writeFileSync = require('fs').writeFileSync;

const Promise 	    = require('bluebird');
const SilentError   = require('silent-error');

const l10nTools     = require('restore-l10n-tools');
const Task          = require('../../models/task');

module.exports = Task.extend({
  run: function (options) {
    const transform = l10nTools({
      src: options.src,
      dest: options.dest
    });

    if (this.cli.verbose) {
	     transform.on('importFile', file => {
        console.log('importing %s', file);
      });
    }

    return transform.toTextResource().then(result => {
      try {
        writeFileSync(options.dest, JSON.stringify(result, null, this.settings.config.jsonFileIndent));
        const message = 'Succesfully transformed the \'.yml\' files in \'' + options.src +
                        '\' and wrote the result to \'' + options.dest + '\'.';
        console.log(message);
      } catch (err) {
        const message = 'The \'.yml\' files in \'' + options.manifest +
                        '\' were succesfully tranformed, but could not write them to file.\n';
        return Promise.reject(new SilentError(message + err));
      }
    });
  }
});