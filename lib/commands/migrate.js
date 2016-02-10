'use strict';

const Command       = require('../models/command');
const Promise 			= require('bluebird');
const debug 				= require('debug')('rstc:commands/migrate')
//const Migrate 			= require('invend-migrate').Migrate;
const SilentError 	= require('silent-error');

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
  }
});