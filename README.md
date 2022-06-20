# PHPStan-vscode

Scans for PHPStan errors as you are working on your PHP code.

## Features

Automatically performs static analysis of your code and highlights errors as you type.

## Extension Settings

-   `phpstan.configFile` (**required**) : path to the config file, either relative to `phpstan.rootDir` or absolute
-   `phpstan.rootDir` - path to the root directory of your PHP project (defaults to `workspaceFolder`)
-   `phpstan.binPath` - path to the PHPStan binary (defaults to `${workspaceFolder}/vendor/bin/phpstan`)
-   `phpstan.binCommand` - command that runs the PHPStan binary. Use this if, for example, PHPStan is already in your global path. If this is specified, it is used instead of `phpstan.binPath`. Unset by default.
-   `phpstan.paths` - path mapping that allows for rewriting paths. Can be useful when developing inside a docker container or over SSH. Unset by default.
-   `phpstan.whenToRun` - when to perform the check (defaults to `onSave`). Can be one of:

    -   `onSave` - whenever the current file is saved
    -   `onContentChange` - whenever the content of the current file changes as you type (debounced by 1000ms)
    -   `never` - never performs the check automatically, allowing you to use the `phpstan.scanFileForErrors` command to check the current file for errors

-   `phpstan.enableStatusBar` - whether to show a statusbar entry while performing the check (defaults to `true`)
-   `phpstan.options` - array of command line options to pass to PHPStan (defaults to `[]`)
-   `phpstan.memoryLimit` - memory limit to use when running PHPStan (defaults to `1G`)
-   `phpstan.timeout` - timeout after which the PHPStan process is killed in ms (defaults to 10000ms)
-   `phpstan.suppressTimeoutMessage` - whether to disable the error message when the check times out (defaults to `false`)
