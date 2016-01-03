
- OSS Operations
- GSS Operations
- Application Bootstrapping
- Migration
- Data Building

restore init --endpoint https://xxx.example.com ./ --default  
restore init # or interactive
restore upload files # uploads according to the restore-commerce.config.js
restore upload files dir # upload relative dir
restore upload file dir/file # upload relative file
restore upload fixtures # equivalent to gulp gss, runs according to according to the restore-commerce.config.js/ import.json should be put to restore-commerce.config.js
restore upload fixture path/to/fixture.jsonld 
restore migrate # run migrations according to the restore-commerce.config.js
restore migrate otherMigration # run a custom migrations 
restore bootstrap
restore info # show what's configured
restore set-mode production # can run against server other than 127.0.0.1
restore set-mode development # default; all API requests are only run if against 127.0.0.1

$ restore-commerce project create xxx --endpoint https://xxx.example.com ./ --default
$ restore-commerce bootstrap
$ restore-commerce files deploy
$ restore-commerce fixtures deploy



### Initialization

Configration stored in `restore.config.js`.

Init with params:

```sh
restore init --endpoint https://host.example.com --default  
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