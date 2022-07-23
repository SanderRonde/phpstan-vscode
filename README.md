# PHPStan-vscode

Scans for PHPStan errors as you are working on your PHP code.

## Features

Automatically performs static analysis of your code and highlights errors as you type.

## Extension Settings

### Main Config

-   `phpstan.configFile` (**required**) : path to the config file, either relative to `phpstan.rootDir` or absolute
-   `phpstan.rootDir` - path to the root directory of your PHP project (defaults to `workspaceFolder`)
-   `phpstan.binPath` - path to the PHPStan binary (defaults to `${workspaceFolder}/vendor/bin/phpstan`)
-   `phpstan.binCommand` - command that runs the PHPStan binary. Use this if, for example, PHPStan is already in your global path. If this is specified, it is used instead of `phpstan.binPath`. Unset by default.

### Tuning

-   `phpstan.options` - array of command line options to pass to PHPStan (defaults to `[]`)
-   `phpstan.memoryLimit` - memory limit to use when running PHPStan (defaults to `1G`)
-   `phpstan.timeout` - timeout for checking single files after which the PHPStan process is killed in ms (defaults to 10000ms)
-   `phpstan.projectTimeout` - timeout for checking the entire project after which the PHPStan process is killed in ms (defaults to 60000ms)
-   `phpstan.suppressTimeoutMessage` - whether to disable the error message when the check times out (defaults to `false`)
-   `phpstan.paths` - path mapping that allows for rewriting paths. Can be useful when developing inside a docker container or over SSH. Unset by default.

### Customization

-   `phpstan.enabled` - whether to enable the on-save checker (defaults to `true`)
-   `phpstan.enableStatusBar` - whether to show a statusbar entry while performing the check (defaults to `true`)
-   `phpstan.showProgress` - whether to show the progress bar when performing a single-file check (defaults to `false`)

## Development

First get your dev environment started by running `yarn dev`. Note that this expects you to have a few programs installed:

-   `composer`
-   `git`
-   `yarn`

This command installs all JS and PHP dependencies and ensures you're ready to go for writing a PHPStan extension.

### Good-to-know commands

The following command will run PHPStan on a demo file, this is handy for testing out changes to the PHPStan extension.

`php/vendor/bin/phpstan analyze -c php/config.neon -a php/TreeFetcher.php --debug test/demo/DemoClass.php`
