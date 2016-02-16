'use strict'
const SilentError = require('silent-error');

/*
 Used to determine if the project (or any project) has been initialized.
*/
function configurationFiles(cmd, opts, settings) {
  const credentialsFile = settings.config.credentialsFileName;
  const projectsFile = settings.config.projectsFileName;

  if (!Object.keys(settings.projects).length) {
    const message = 'No project entries were found in the file \'' +
      projectsFile + '\'. Have you initialized \'' +
      opts.project + '\'? (For help see \'rstc help project\'.)';

    throw new SilentError(message);
  }

  if (!Object.keys(settings.credentials).length) {
    const message = 'No project entries were found in the file \'' +
      credentialsFile + '\'. Have you initialized \'' +
      opts.project + '\'? (For help see \'rstc help project\'.)';

    throw new SilentError(message);
  }
};
exports.configurationFiles = configurationFiles;

/*
 Used to determine if there's enough information passed in
 with command options to communicate with an application.
*/
function applicationOptions(cmd, opts, settings) {
  const credentialsFile = settings.config.credentialsFileName;
  const projectsFile = settings.config.projectsFileName;
  let options = Object.assign({}, opts);

  // No '--project' option specified, look for entry and apikey.
  if (!options.project) {
    if (!options.entry || !options.apikey) {
      cmd.printBasicHelp();
      const message = 'Either a project or an entry point and api key must be specified.';
      throw new SilentError(message);
    }
    // '--project' option is specified, look for an overriding entry and apikey.
  } else {
    configurationFiles(cmd, options, settings);

    if (!settings.projects[options.project] ||
      !settings.projects[options.project].entry) {
      const message = 'The specified project \'' + options.project +
        '\' cannot be found in the configuration file \'' +
        projectsFile + '\'.';

      throw new SilentError(message);
    }

    var entry = settings.projects[options.project].entry;

    if (!settings.credentials[options.project] ||
      !settings.credentials[options.project].apiKey) {
      const message = 'The specified project \'' + options.project +
        '\' cannot be found in the configuration file \'' +
        credentialsFile + '\'.';
      throw new SilentError(message);
    }

    var apikey = settings.credentials[options.project].apiKey;

    if (options.entry) {
      const message = 'Overriding default entry point ("' + entry +
        '") with "' + options.entry + '".';
      console.log(message);
    } else {
      options.entry = entry;
    }

    if (options.apikey) {
      const message = 'Overriding default API key ("' + apikey +
        '") with "' + options.apikey + '".';
      console.log(message);
    } else {
      options.apikey = apikey;
    }
  }

  return options;
}
exports.applicationOptions = applicationOptions;