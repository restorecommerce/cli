# Restore Commerce CLI

Restore Commerce command-line utility.

## Installation

```sh
$ npm i -g restore-cli
```

## Usage

```sh
# Print the help index
$ rstc -h

# Print the help for a command
$ rstc <command> -h

# General command invocation
$ rstc <command> [OPTIONS] <command> [OPTIONS] ...
```

**See [REFERENCE.md](REFERENCE.md) for a reference documentation.**

## Configuration Files

There are two configuration files considered by the CLI:

- `.restore-commerce-project.json`
- `.restore-commerce-credentials.json`

The CLI looks up these files in the following locations:

- `./` ‒ the current directory
- `~/` ‒ the user's home directory

Settings found in the config files are used automatically,
command line arguments take precedence.

### `restore-commerce-project.json`

Containts settings for 1..n projects.

```json
{
  "projectId": {
    "entry": "http://example.com"
  }
}
```

### `restore-commerce-credentials.json`

Contains API keys for 1..n projects.

```json
{
  "projectId": {
    "apiKey": "someApiKey"
  }
}
```
