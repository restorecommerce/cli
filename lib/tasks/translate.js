'use strict';

const Promise = require('bluebird');
const Task    = require('../models/task');
const i18n 	  = require('restore-commerce-i18n-tool');
const pkg     = require('./package.json');
const gss 	  = require('gss-client').Client;

module.exports = Task.extend({
  run: function (options) {
    const graph = gss({
      entry: options.entry,
      apiKey: options.apiKey
    });

    yield i18n({
      i18nManifest: 'app-data/i18n/i18n.manifest',
      src: './app-data/i18n/',
      dest: './.tmp/'
    });

    graph.importFile('./.tmp/texts.jsonld', '/texts/').then(res => {

    }).catch(e => {

    });
  }
});