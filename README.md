## Restore CLI

a tool for common Restore Commerce operation tasks.

## Name Variants

`restore`, `restore-commerce`, `rstc`

## Usage

### Initialization

Configration stored in `restore.config.js`.

Init with params:

```sh
restore init --endpoint https://host.invend.eu --default  
```

Interactive init:

```sh
restore init
```

Print config:

```
restore info # show what's configured
```

### File Upload (OSS)

```sh
restore upload files # uploads according to the restore-commerce.config.js
```

Upload single dirs or files:

```sh
restore upload files dir # upload relative dir
restore upload file dir/file # upload relative file
```

### Resource Upload (GSS)

Equivalent to gulp gss, runs according to according to the `restore.config.js`. `import.json` should be put to `restore.config.js`:

```sh
restore upload resources
```

Upload a file with fixtures:

```sh
restore upload resource path/to/fixture.jsonld 
```

### Data Migration

```sh
restore migrate # run migrations according to the restore-commerce.config.js
restore migrate otherMigration # run a custom migrations 
```

### Authorization

```
restore set-mode production # can run against server other than 127.0.0.1
restore set-mode development # default; all API requests are only run if against 127.0.0.1
```

### Bootstrap

Bootstrap the server

```sh
restore bootstrap
```
