## Global Command Line Options

Globally supported command line options:

`-v, --verbose`

Enable verbose output.

`--debug`

Enable debugging output. This usually contains API calls.

`-h, --help`

The API key to use.

## Command Reference

The following commands are supported.

## `apikey <command>`
  API key related commands.
  
### `gen` 
 Generate a random API key and output it. This will not create the generated API key in the API.

## `bootstrap <directory> <options>`
  Used to bootstrap the application's API.  Directory defaults to current working project's directory.
  * `--project` - Which project's configuration to use. The api key and entry point can be overridden by the following options. <br>
    `aliases: -p <value>`
  * `--entry` - Defaults to specified project's entry point. <br>
    `aliases: -e <value>`
  * `--apikey` - Defaults to specified project's api key. <br>
    `aliases: -key <value>, -k <value>` <br>
  * `--protocol` - Defaults to `http`.


## `command <options> <command>`
  Commands to apply on the server.
  * `--project` - Which project's configuration to use. The api key and entry point can be overridden by the following options. <br>
    `aliases: -p <value>`
  * `--entry` - Defaults to specified project's entry point. <br>
    `aliases: -e <value>`
  * `--apikey` - Defaults to specified project's api key. <br>
    `aliases: -key <value>, -k <value>` <br>
  * `--protocol` - Defaults to `http`.

  ### `reindex`
   Reindex Elastic.
  ### `send-redis-command <redis-command-file>`
   Send a Redis command specified in a JSON file.
  ### `start-job <job-file>`
   Start a job specified in a JSON file.


## `gss <options> <command>`
  Graph Storage Service Client related commands.
  * `--project` - Which project's configuration to use. The api key and entry point can be overridden by the following options. <br>
    `aliases: -p <value>`
  * `--entry` - Defaults to specified project's entry point. <br>
    `aliases: -e <value>`
  * `--apikey` - Defaults to specified project's api key. <br>
    `aliases: -key <value>, -k <value>` <br>
  * `--protocol` - Defaults to `http`.

  ### `import <file> <options>`
   Imports the resources defined in a file which defaults to "import.json" in current, current project's or home directory (lists choices). <br>
   * `--mode` - Either `prod` (production) (default) or `dev` (development). <br>
    `aliases: -m <value>`
   * `--only-modified` - Import only modified resources. <br>
    `aliases: -om`

  ### `import-resource <resource or directory> <resource>`
   Import a single resource or a directory. <br>

## `help <command-name> <options>`
  Outputs the usage instructions for all commands or the requested command(s).
  * `--json` - Output the command information as JSON.

## `info <options>`
  Print the information about a project or all project's in the current project's directory. <br>
  * `--base` - Defaults to current project's directory. <br>
    `aliases: -b <value>`
  * `--project` <br>
    `aliases: -p <value>`
  * `--all` - Display information about all projects. <br>
    `aliases: -a`

## `l10n <command>`
  Localization tools.

  ### `transform <yml directory> <destination>`
   Converts localized text resources in YAML format to JSON-LD resources of type '/classes/Text'. Translated resource destination defaults to a temporary file.

## `merge <data source directory> <data target directory>`
  Merge data.
  * `--host` - Application's host name to append to `resourceType` (optional). <br>
  * `--ignore` - Resources to ignore from merging. <br>
    `aliases: -i <value - String/Array>`

## `migrate <options> <command>`
  Fixture migration commands.
  * `--project` - Which project's configuration to use. The api key and entry point can be overridden by the following options. <br>
    `aliases: -p <value>`
  * `--entry` - Defaults to specified project's entry point. <br>
    `aliases: -e <value>`
  * `--apikey` - Defaults to specified project's api key. <br>
    `aliases: -key <value>, -k <value>` <br>
  * `--protocol` - Defaults to `http`.

  ### `create <migration-name> <options>`
   Create a fixture migration.
   * `--base` - Directory to initialize the project to. Defaults to `migrations` current working directory. <br>
    aliases: -b <value>

  ### `down <migration-name> <options>`
   Delete a migration resource.
   * `--all` - Remove all migrations from the `migrations` resource.

  ### `up <options>`
   Fulfill a migration.
   * `--mode` - Either 'prod' (production) (default) or 'dev' (development).
    aliases: -m <value>
   * `--base` - Directory in which the migration resides. Defaults to `migrations` in project base directory.
    aliases: -b <value>

## `oss <options> <command>`
  Object Storage Service Client related commands.
  * `--project` - Which project's configuration to use. The api key and entry point can be overridden by the following options. <br>
    `aliases: -p <value>`
  * `--entry` - Defaults to specified project's entry point. <br>
    `aliases: -e <value>`
  * `--apikey` - Defaults to specified project's api key. <br>
    `aliases: -key <value>, -k <value>` <br>
  * `--protocol` - Defaults to `http`.

  ### `delete <iri>`
   Delete a resource with a given IRI.

  ### `get <iri> <options>`
   Get a resource with a given IRI.
   * `--meta`

  ### `head <iri>`
   Get headers of a resource with a given IRI.

  ### `job <job-file> <options>`
   Start a job.
   * `--diff-base` - The base to compare the local and remote objects. Defaults to `MD5`.<br>
    `aliases: -db <value>`
   * `--diff-compare` - Resolve differences between the local and remote object. <br>
    `aliases: -diff, -dc`

  ### `list <iri>`
   List resources in a OSS resource with a given IRI.

  ### `put <iri> <resource> <options>`
   Put an object, object + meta data or only meta data to a given IRI.
   * `--private` <br>
    `aliases: -priv`
   * `--max-age` - Defaults to `0`. <br>
    `aliases: -ma <value>`
   * `--no-cache` <br>
    `aliases: -nc`
   * `--must-revalidate` <br>
    `aliases: -mr`
   * `--proxy-revalidate` <br>
    `aliases: -pr`

## `project <command>`
  Project related commands.

### `init <options>`
   This command creates project related configuration files in the base directory.
   Specifying the `--project` option for specific commands, the configuration files
   first are looked up in the project's base directory, if not found, then they are
   loaded from the `home' directory. So setting the `--base` option to your `home`
   directory allows you to keep all your project credentials in one place.
   * `--id` - Application ID.
   * `--entry` - Applicaton entry point. <br>
    `aliases: -e <value>`
   * `--base` - Directory to initialize the project to. Defaults to current working directory. <br>
    `aliases: -b <value>'
   * `--apikey` -  API key for the credentials file. Gets automatically generated if not provided. <br>
    `aliases: -key <value>, -k <value>`

Example:

```sh
rstc project init --id example --entry http://example.com --apikey 123 --base ~/
```

## `pwhashgen <password>`
  Generate a hash from the given string.

## `uuidgen`
  Generate an ID.

## `version`
  Outputs `restore-cli` version.
