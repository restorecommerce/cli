'use strict';

const Promise = require('bluebird');
const SilentError = require('silent-error');

const i18n = require('rstc-translations');
const confirm = require('../utilities/confirm');
const Task = require('../models/task');

module.exports = Task.extend({
  run: function (options) {
    return new Promise((resolve, reject) => {
      i18n.toTextResource({
        i18nManifest: options.manifest,
        src: options.src,
        dest: options.dest
      }, function (err, dest) {
        // Change 'dest' to 'options.dest' below after 'rstc-translations' changes.
        if (err) {
          const message = 'Failed to translate '+ options.manifest + '\'.\n';
          throw new SilentError(message + err)
        } else {
          console.log('Succesfully translated \'' + options.manifest +
            '\' to \'' + dest + '\'.');
          if (options.entry && options.apikey) {
            const GssClient = require('restore-gss-client').Client;
            const gssClient = GssClient({
              entry: options.entry,
              apiKey: options.apikey
            });
            return confirm.importing(dest, options.entry).then(() => {
              return gssClient.importResource(dest, options.resource).then(res => {
                const message = 'Finished importing the translated resources to \'' + options.resource + '\'.' +
                  (res.statusCode ? ('\nResponse status code: ' + res.statusCode) : '') +
                  (res.message ? ('\n' + res.message) : '');
                console.log(message);
              }).catch(err => {
                const message = 'Failed to import the translated resources to \'' + options.resource + '\'.' +
                  (err.statusCode ? ('\nResponse status code: ' + err.statusCode) : '') +
                  (err.message ? ('\n' + err.message) : '');

                return Promise.reject(new SilentError(message));
              });
            }).catch(err => {
              return Promise.reject(err);
            });
          } else resolve();
        }
      });
    });
  }
});