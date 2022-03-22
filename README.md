# PHPStan-vscode

Scans for PHPStan errors as you are working on your PHP code.

## Features

Automatically performs static analysis of your code and highlights errors as you type.

## Extension Settings

-   `phpstan.configFile` (**required**) : path to the config file, either relative to `phpstan.rootDir` or absolute
-   `phpstan.rootDir` - path to the root directory of your PHP project (defaults to `workspaceFolder`)
-   `phpstan.binPath` - path to the PHPStan binary (defaults to `${workspaceFolder}/vendor/bin/phpstan`)
-   `phpstan.whenToRun` - when to perform the check (defaults to `onSave`). Can be one of:

    -   `onSave` - whenever the current file is saved
    -   `onContentChange` - whenever the content of the current file changes as you type (debounced by 1000ms)
    -   `never` - never performs the check automatically, allowing you to use the `phpstan.scanFileForErrors` command to check the current file for errors


-   `phpstan.enableStatusBar` - whether to show a statusbar entry while performing the check (defaults to `true`)
-   `phpstan.options` - array of command line options to pass to PHPStan (defaults to `[]`)
-   `phpstan.memoryLimit` - memory limit to use when running PHPStan (defaults to `1G`)
-   `phpstan.timeout` - timeout after which the PHPStan process is killed in ms (defaults to 10000ms)
-   `phpstan.suppressTimeoutMessage` - whether to disable the error message when the check times out (defaults to `false`)

## Release Notes

### 1.1.4

* Don't show timeout message every time an operation ends

### 1.1.3

* Always show error when timing out (thanks to [ljubadr](https://github.com/ljubadr) on github for the suggestion)
* Add option for turning off these errors

### 1.1.2

* Add logging panel under output

### 1.1.1

* Add release notes

### 1.1.0

* Automatically times out after some time
* Shows result of last operation in statusbar (relevant when killed because of timeout)

### 1.0.0

Initial release!
