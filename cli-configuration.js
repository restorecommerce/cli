'use strict';

console.log('restore-cli-configuration.js');

/*
TO DO: look up and apply the configuration files.

There are two configuration files considered by the CLI:

.restore-commerce-project.json
.restore-commerce-credentials.json
The CLI looks up these files in the following locations:

./ ‒ the current directory
~/ ‒ the user's home directory
Settings found in the config files are used automatically, command line arguments take precedence.

restore-commerce-project.json

Containts settings for 1..n projects.

{
  "projectId": {
    "entry": "http://example.com"
  }
}
restore-commerce-credentials.json

Contains API keys for 1..n projects.

{
  "projectId": {
    "apiKey": "someApiKey"
  }
}

*/
