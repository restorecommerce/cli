'use strict';
const chalk = require('chalk');

module.exports = {
  import: function (input, mergeWith) {
    var getResource = function (path, input) {
      var result = null;
      input.forEach(function (res) {
        if (res.path === path) {
          result = res;
        }
      });
      return result;
    };

    mergeWith.forEach(function (item) {
      var anotherRes = getResource(item.path, input);
      if (!anotherRes) {
        console.log(chalk.green('Adding ' + item.path + ' to the resources list'));
        input.push(item);
      }
    });
  },

  resources: function (input, mergeWith) {
    var startLength = input['@graph'].length;
    mergeWith['@graph'].forEach(function (res) {
      var id = res['@id'];
      var exists = false;
      for (var i = 0; i < input['@graph'].length; i++) {
        if (input['@graph'][i]['@id'] === '/resources/' + id ||
          input['@graph'][i]['@id'] === 'resources/' + id ||
          input['@graph'][i]['@id'] === id) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        input['@graph'].push(res);
        console.log(chalk.magenta('Pushing: ' + res['@id']));
      } else {
        console.log(chalk.red('Resource exists both in the app fixtures and in the meta: ' + res['@id']));
      }
    });
    console.log(chalk.green('Merged resources: ' + startLength + ' + ' + mergeWith['@graph'].length + ' = ' + input['@graph'].length));
  },

  br: function (input, mergeWith) {
    var getBr = function (id, data) {
      var result = null;
      data.forEach(function (br) {
        if (br['@id'].indexOf(id) >= 0) {
          result = br;
        }
      });
      return result;
    };

    var getPolicy = function (res, data) {
      var result = null;
      data.forEach(function (br) {
        if (br.res === res) {
          result = br;
        }
      });
      return result;
    };

    input.forEach(function (br) {
      var policies = br.policy;
      var anotherBr = getBr(br['@id'], mergeWith);
      if (!anotherBr) {
        anotherBr = getBr('business_roles/unauthenticated', mergeWith);
        if (!anotherBr) {
          return;
        }
      }
      console.log(chalk.cyan.bold('Merging: ' + br['@id'] + ' with ' + anotherBr['@id']));
      var anotherPolicies = anotherBr.policy;
      anotherPolicies.forEach(function (policy) {
        var originalPolicy = getPolicy(policy.res, policies);
        if (originalPolicy) {
          console.log(chalk.magenta.bold('For policy ' + originalPolicy.res + ' found a policy ' + policy.res));
        } else {
          console.log(chalk.red.bold('For policy ' + policy.res + ' there is no matching policies. Adding'));
          policies.push(policy);
        }
      });
    });
  }
}
