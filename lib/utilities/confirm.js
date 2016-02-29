'use strict'
const Promise     = require('bluebird');
const lookup      = require('dns').lookup;
const inquirer    = require('inquirer');
const SilentError = require('silent-error')

/*
 Used to confirm GSS imports.
*/
function importing(path, entry) {
  return new Promise((resolve, reject) => {
    lookup(entry, null, (err, address, family) => {
      inquirer.prompt({
        type: 'confirm',
        name: 'confirm',
        message: 'Import \'' + path + '\' to ' + entry + ' (' + address + ')?'
      }, (answers) => {
        if (answers.confirm) resolve();
        	  else reject(new SilentError('Aborted operation.'));
      });
    });
  });
};
exports.importing = importing;

/*
 Used to confirm bootstrapping.
*/
function bootstrapping(entry) {
  return new Promise((resolve, reject) => {
    lookup(entry, null, (err, address, family) => {
      inquirer.prompt({
        type: 'confirm',
        name: 'confirm',
        message: 'Bootstrap ' + entry + ' (' + address + ')?'
      }, (answers) => {
        if (answers.confirm) resolve();
          else reject(new SilentError('Aborted operation.'));
      });
    });
  });
}
exports.bootstrapping = bootstrapping;

/*
 Used to confirm bootstrapping.
*/
function jobUploads(path, iri) {
  return new Promise((resolve, reject) => {
      inquirer.prompt({
        type: 'confirm',
        name: 'confirm',
        message: 'Overwrite remote resource \'' + iri + '\'?'
      }, (answers) => {
        if (answers.confirm) resolve(true);
          else resolve(false);
      });
  });
}
exports.jobUploads = jobUploads;