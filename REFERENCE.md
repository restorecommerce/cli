# Global Command Line Options

Globally supported command line options:

`-v, --verbose`

Enable verbose output.

`--debug`

Enable debugging output. This usually contains API calls.

`-h, --help`

Show help for a command.

`--entry`

The API endpoint to use.

`--key`

The API key to use.

# Command Reference

The following commands are supported.

## `apikey`

API key related commands.

### `gen`

Generate a random API key.
This will not create the API key in the API.

## `bootstrap`

Application bootstrapping.

Arguments:

1. `data directory` the directory which contains the bootstrap data

## `info`

Print information about the current project.
For example, the current API entry point.

## `oss`

Object storage service related commands.

### `job`

Arguments:

1. `job path` the path to the job file to process

## `project`

### `init`

- `--id` the project ID
- `--entry` the API entry point
- `--base` base directory, defaults to cwd

This command creates project related config files in the
base directory.

Example:

```sh
rstc project init --id example --entry http://example.com
```

## `pwhashgen`

Arguments:

1. `password` the password to be hashed

Generate a hash from the given string.

## `uuidgen`

Generate a random v4 UUID.

