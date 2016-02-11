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
        if (err) {
          const message = 'Failed to translate '+ options.manifest + '\'.\n';
          throw new SilentError(message + err)
        } else {
          console.log('Succesfully translated \'' + options.manifest +
            '\' to \'' + options.dest + '\'.');
          if (options.entry && options.apikey) {
            const GssClient = require('restore-gss-client').Client;
            const gssClient = GssClient({
              entry: options.entry,
              apiKey: options.apikey
            });
            return confirm.bootstrapping(options.entry).then(() => {
              return gssClient.importResource(options.dest, options.resource).then(res => {
                const message = 'Finished importing the translated resources to \'' + options.resources + '\'.' +
                  (res.statusCode ? ('\nResponse status code: ' + res.statusCde) : '') +
                  (res.message ? ('\n' + res.message) : '');
                console.log(message);
              }).catch(err => {
                const message = 'Failed to import the translated resources to \'' + options.resources + '\'.' +
                  (err.statusCode ? ('\nResponse status code: ' + err.statusCode) : '') +
                  (err.message ? ('\n' + err.message) : '');

                throw new SilentError(message);
              });
            });
          } else resolve();
        }
      });
    });
  }
});