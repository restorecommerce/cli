'use strict';
'use restrict';

const fs        = require('fs');
const chalk     = require('chalk');
const yaml      = require('js-yaml');
const readdirp  = require('readdirp');
const async     = require('async');
const request   = require('request');
const tmp       = require('tmp');

const languages = ['en', 'de'];

var isLanguage = function(key) {
  if (languages.indexOf(key) !== -1) {
    return true;
  }
  return false;
};

var isLeaf = function(node) {
  var isLeaf = false;
  if (node instanceof Object) {
    Object.keys(node).forEach(function(key) {
      isLeaf = isLanguage(key);
    });
  }
  return isLeaf;
};

var traverseTree = function(tree, callback, path) {
  if (typeof path !== 'string') {
    path = '';
  }
  if (tree instanceof Object) {
    Object.keys(tree).forEach(function(key) {
      var node = tree[key];
      var nodePath = path === '' ? path + key : path + '.' + key;
      traverseTree(node, callback, nodePath);
      callback(nodePath, node);
    });
  }
};

var forEachText = function(content, callback) {
  traverseTree(content, function(path, node) {
    if (isLeaf(node)) {
      var id = path.split('.').join('_');
      var key = path;
      var langs = Object.keys(node);
      var values = [];
      langs.forEach(function(lang) {
        values.push(node[lang]);
      });
      callback(id, key, langs, values);
    }
  });
};

var writeYmlToResult = function(content, result) {
  forEachText(content, function(id, key, langs, values) {
    var text = {};
    for (var i = 0; i < langs.length; i++) {
      var lang = langs[i];
      var value = values[i];
      text[lang] = value;
    }
    var resource = {
      '@id': '/texts/' + id,
      'key': key,
      'pkg': id.split('_')[0],
      'text': text
    };
    result.push(resource);
  });
};

function processManifest(manifest, manifestName, wcb, result) {
  var textsFolder = manifest.textsFolder;
  var textFiles = manifest.textFiles || [];
  var basePath = manifestName.split('/').slice(0, -1).join('/') +
    '/' + textsFolder + '/';
  async.eachSeries(textFiles, function iterator(file, escb) {
    var fpath = basePath + file;
    if (fpath.substring(0, 4) === 'http') {
      request.get(fpath, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          var content = yaml.safeLoad(body);
          writeYmlToResult(content, result);
          escb();
        } else {
          console.log('Error getting file ' + basePath + file);
          escb('Error getting file ' + basePath + file);
        }
      });
    } else {
      var body = fs.readFileSync(fpath);
      var content = yaml.safeLoad(body);
      writeYmlToResult(content, result);
      escb();
    }
  }, function(err, data) {
    wcb(err);
  });
}

function loadRemoteFiles(i18nManifest, result) {
  return function(wcb) {
    if (i18nManifest.substring(0, 4) === 'http') {
      request.get(i18nManifest, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          var manifest = JSON.parse(body);
          processManifest(manifest, i18nManifest, wcb, result);
        } else {
          wcb('Error getting i18n manifest');
        }
      });
    } else {
      var file = fs.readFileSync(i18nManifest);
      var manifest = JSON.parse(file);
      processManifest(manifest, i18nManifest, wcb, result);
    }
  };
}

function loadLocalFiles(src, result) {
  return function(wcb) {
    var srcStat = fs.statSync(src);
    if (srcStat.isDirectory()) {
      readdirp({
        root: src,
        fileFilter: '*.yml'
      }, function(errors, res) {
        if (errors) {
          errors.forEach(function(err) {
            console.error('Error: ', err);
          });
        }
        res.files.forEach(function(entry) {
          var abspath = entry.fullPath;
          var name = entry.name;
          var content = yaml.safeLoad(fs.readFileSync(abspath, 'utf8'));
          writeYmlToResult(content, result);
        });
        wcb();
      });
    } else if (srcStat.isFile()) {
      var content = yaml.safeLoad(fs.readFileSync(src, 'utf8'));
      var tmp = src.split('/');
      var filename = tmp[tmp.length - 1];
      writeYmlToResult(content, result);
      wcb();
    }
  };
}

function checkDuplicates(array) {
  var counter = {};

  array.forEach(function(obj) {
    var key = obj.key;
    counter[key] = (counter[key] || 0) + 1;
  });

  Object.keys(counter).forEach(function(key) {
    if (counter[key] > 1) {
      console.log('The key ' + chalk.red(key) + ' appears ' +
       chalk.cyan(counter[key]) + ' times.');
    }
  });
}

function run(opts, result, cb) {
  var i18nManifest = opts.i18nManifest;
  var tasks = [];
  if (i18nManifest) {
    tasks.push(loadRemoteFiles(i18nManifest, result));
  }
  var src = opts.src;
  tasks.push(loadLocalFiles(__dirname + '/src', result));
  tasks.push(loadLocalFiles(src, result));
  async.eachSeries(tasks, function(item, escb) {
    item(escb);
  }, cb);
}

module.exports.toTextResource = function(opts, done) {
  var result = [];
  run(opts, result, function(err, data) {
    var dest = tmp.tmpNameSync();
    if (err) {
      console.log(err);
    } else {
      checkDuplicates(result);

      result = {
        '@graph': result
      };

      fs.writeFileSync(dest, JSON.stringify(result, null, 2));
      console.log('File ' + chalk.cyan(dest) + ' created.');
    }
    done(err, dest);
  });
};

module.exports.toJSON = function(opts, done) {
  var result = [];
  run(opts, result, function(err, data) {
    var dest = tmp.tmpNameSync();
    if (err) {
      console.log(err);
      return done(err);
    }

    checkDuplicates(result);
    var json = {};
    result.forEach(function(r) {
      json[r.key] = r.text;
    });

    console.log('JSON doc generated');
    done(null, json);
  });
};