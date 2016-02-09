'use strict';
'use strict';

const Promise = require('bluebird');
const co      = require('co');
const fs      = require('fs-extra');

const merge   = require('../utilities/merge');
const Task    = require('../models/task');

const JSON_INDENTATION = 2;

module.exports = Task.extend({
  run: function (options) {
    return new Promise((resolve, reject) => {

      const targetFixtures         = options.target + 'fixtures/';
      const targetImportJSON       = options.target + 'import.json';
      const targetSourceFixtures   = options.target + 'source-fixtures/';
      const targetSourceImportJSON = options.target + 'source-fixtures/import.json';

      // Remove target and re-create
      fs.removeSync(targetFixtures);
      fs.mkdirsSync(targetFixtures);

      // Append host name to the resourceType defined in the meta import.json
      var metaImport = JSON.parse(fs.readFileSync('./data/import.json'));

      // read the target import.json and merge it with the meta import.json
      var appImport = JSON.parse(fs.readFileSync(targetSourceImportJSON));
      merge.import(appImport, metaImport);

      // write merged import.json
      fs.writeFileSync(targetImportJSON, JSON.stringify(appImport, null, JSON_INDENTATION));

      // Copy meta data
      fs.copySync('./data/contexts', targetFixtures + 'contexts');
      fs.copySync('./data/resources', targetFixtures + 'resources');
      fs.readdirSync('./data/collections/').forEach(function (collection) {
        fs.copySync('./data/collections/' + collection, targetFixtures + collection);
      });

      // Merge resources/resources.jsonld
      var appResources = JSON.parse(fs.readFileSync(targetSourceFixtures + 'resources/resources.jsonld'));
      var metaResources = JSON.parse(fs.readFileSync('./data/resources/resources.jsonld'));
      appResources = merge.resources(appResources, metaResources);

      // copy collection folders to the fixtures
      fs.readdirSync(targetSourceFixtures + 'collections/').forEach(function (collection) {
        fs.copySync(targetSourceFixtures + 'collections/' + collection, targetFixtures + collection);
      });

      // copy contexts to the target contexts
      if (fs.existsSync(targetSourceFixtures + 'contexts/')) {
        fs.readdirSync(targetSourceFixtures + 'contexts/').forEach(function (collection) {
          fs.copySync(targetSourceFixtures + 'contexts/' + collection, targetFixtures + 'contexts/' + collection);
        });
      }

      // copy classes to the target classes
      if (fs.existsSync(targetSourceFixtures + 'classes/')) {
        fs.readdirSync(targetSourceFixtures + 'classes/').forEach(function (collection) {
          fs.copySync(targetSourceFixtures + 'classes/' + collection, targetFixtures + 'classes/' + collection);
        });
      }

      fs.writeFileSync(targetFixtures + 'resources/resources.jsonld', JSON.stringify(appResources, null, JSON_INDENTATION));

    });
  }
});