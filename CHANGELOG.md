# Change Log

All notable changes to the "phpstan-vscode" extension will be documented in this file.

## 4.0.6

-   Fix issue where PHPStan 2.1.18 would throw an error

## 4.0.5

-   Fix path mapping issue when combining a docker setup with a non-default `rootDir`

## 4.0.4

-   Fix issue where config files that don't exist would throw an error

## 4.0.3

-   Fix issue where on-hover-info fetcher was broken when using implicit parameters in getters/setters.

## 4.0.2

-   Recalculate diagnostic line range when file is opened

## 4.0.1

-   Add command for clearing errors

## 4.0.0

-   Resolve config files relative to the file that is being checked, allowing for multiple config files in the project.

## 3.2.22

-   `TreeFetcher.php` now no longer contains PHP 7.4+ code

## 3.2.21

-   Pass docker environment variables to docker process

## 3.2.20

-   Fix bug where the UI would hang while checking

## 3.2.19

-   Add `phpstan.downloadDebugData` command to download debug data

## 3.2.18

-   Fix issue where errors would not be shown when PHPStan reported no error message

## 3.2.17

-   Only sync/check relevant URI schemes

## 3.2.16

-   Fix `showTypeOnHover` for PHPStan 2.0

## 3.2.15

-   Adapt to new PHPStan 2.0 changes

## 3.2.14

-   Ignore Xdebug errors by default

## 3.2.13

-   Fix status bar text not being updated immediately

## 3.2.12

-   Add anonymous usage telemetry. Only enabled if VSCode telemetry is enabled. See [code](https://github.com/SanderRonde/phpstan-vscode/blob/master/client/src/lib/telemetry.ts) for exactly what is reported.

## 3.2.11

-   Re-enable zombie-process killer
-   Only queue checks on config change if file watching is enabled

## 3.2.9, 3.2.10

-   Comment out some unused code that was causing issues.

## 3.2.8

-   Fix issue where too many PID-lookup operations would be spawned.

## 3.2.7

-   Reduce frequency that `ps-tree` is used in order to reduce CPU usage

## 3.2.6

-   Only perform initial check when no other checks have been done

## 3.2.5

-   Disable file watching

## 3.2.4, 3.2.3

-   Catch case in which the `ps` command is not available

## 3.2.2

-   Watch files that are not open in the workspace for changes too (requires PHPStan 1.12 or higher)

### 3.2.1

-   Fall back to v1 when `--version` does not output a valid PHPStan version

### 3.2.0

-   Improve killing of running PHPStan checks by using the process tree to kill any zombie processes too.
-   Add a setup wizard that guides you through setting up the extension.
    -   Also supports docker setup

### 3.1.14

-   Remove some unneeded files from the extension

### 3.1.13

-   Don't overwrite temporary directory specified in config file
-   Ignore PHPStan errors by identifier with quick if possible
-   Show error identifiers in diagnostics
-   Show PHPStan tip as part of error message
-   Append ignore directive to existing docblocks if possible
-   Applying a quickfix now immediately fixes the associated issue (without a re-check needed)

### 3.1.12

-   Set default for `tmpDir` setting
-   Update PHPStan Pro failure-to-launch error message

### 3.1.11

-   Improve reliability of PHPStan Pro mode

### 3.1.10

-   Use a separate cachedir for each workspace when using the language server

### 3.1.9

-   Fix bug on Windows where errors would disappear when opening the file.
    -Rename `proTmpDir` to `tmpDir` and apply it to non-pro checks as well.

### 3.1.7

-   Fix Pro support for newest PHPStan update (3.1.11)

### 3.1.6

-   Fix issue where language server hover wasn't working
-   Ensure language server mode uses a different cache directory than the CLI mode to prevent them invalidating each others' caches.

### 3.1.5

-   When using single file mode, ignore errors related to no files being specified. This happens when the checked file is not in `paths`.

### 3.1.4

-   Only kill zombie PHPStan processes if the PID still points to a PHPStan process.

### 3.1.3

-   Improve debouncing when triggering a bunch of checks in rapid succession in different files.

### 3.1.2

-   Fix `phpstan.scanFileForErrors` command

### 3.1.1

-   Improve killing of running processes when starting a new one
-   Bring back `phpstan.scanFileForErrors` command
-   Inform users of single-file checking mode when project scan times out

### 3.1.0

-   Add back support for single-file checking behind a setting
-   Refactor a bunch of code

### 3.0.8

-   Support non-quoted regular expressions in `phpstan.ignoreErrors` setting

### 3.0.7

-   Publish version 3.0 🎉

### 3.0.6 (pre-release)

-   Fix issue when an error had no linenumber (for example baseline errors)

### 3.0.5 (pre-release)

-   Fix issue in TreeFetcher that would lead to recursive-json error
-   Report errors in traits

### 3.0.4 (pre-release)

-   Make checking validity of PHP file a setting
-   Match PHPStan's default config resolution priority

### 3.0.2 (pre-release)

-   Add PHPStan Pro support
-   Disable language server by default
-   Support tilde as first character in file paths

### 3.0.1 (pre-release)

-   Only check on initial startup if the extension is enabled

### 3.0.0 (pre-release)

-   Always perform whole-repository checks instead of single-file checks
    -   Ensures cache is always hit
    -   Ensures relevant file changes in other files are always picked up
-   Add support for PHPStan Pro
    -   Uses PHPStan Pro to watch files while displaying its errors in the editor
    -   (Requires a valid PHPStan Pro license)
-   Language server improvements
    -   Now indexes the entire project at once (no more waiting for individual file checks)
    -   Now uses the exact location of variables (this was previously guessed because PHPStan didn't provide information regarding the index of a value on a line)
    -   Includes function and closure arguments now too

### 2.2.26

-   Add warning for multi-workspace projects
-   Add commands for going to the next and previous PHPStan error

### 2.2.25

-   Fix bug where projectTimeout was not being used

### 2.2.24

-   Fix wrong title for extension configuration

### 2.2.23

-   Force-kill processes that run too long, even if they outlast VSCode's runtime itself

### 2.2.22

-   Log configuration on extension startup (helps in debugging)
-   Always check current configuration when starting a new check

### 2.2.21

-   Remove badges from README.md (VSCode marketplace did not allow them)

### 2.2.20

-   Fix paths not mapping when scanning entire project. Thanks to [raustin-m](https://github.com/SanderRonde/phpstan-vscode/pull/28) for the PR.

### 2.2.19

-   Provide quick fix for ignoring errors (thanks to [FrankySnow](https://github.com/SanderRonde/phpstan-vscode/issues/25))

### 2.2.18

-   Fix deprecated string iterpolation (thanks to [priyadi](https://github.com/SanderRonde/phpstan-vscode/pull/21))

### 2.2.17

-   Don't do unnecessary checks on closing files

### 2.2.16

-   Kill with SIGKILL if process does not respond to SIGINT
-   Fix bug in TreeFetcher

### 2.2.15

-   Kill PHPStan process with SIGINT instead of SIGKILL to allow for graceful shutdown

### 2.2.14

-   Don't check files that end with `.git` (appears to be a VSCode quirk)

### 2.2.13

-   List of to-ignore errors now takes regular expressions

### 2.2.12

-   Add option for ignoring errors occuring during execution of PHPStan

### 2.2.11

-   Use names that are less prone to collissions in code injected in PHPStan extension.

### 2.2.10

-   Jump bump version

### 2.2.9

-   Add option for enabling/disabling language server (can help with docker setups)
-   Fix file path issues on windows

### 2.2.8

-   Fix issue that would crash language server sometimes
-   When language server crashes, clear all running operations (should fix infinitely loading statusbar)

### 2.2.7

-   Fix bug that caused hover info to stop working when a file contained an array desturing inside a foreach loop
-   Attempt to fix bug with status bar entry never disappearing

### 2.2.6

-   Fix bug that caused status bar icon to disappear
-   Add on-hover tooltip to status bar icon

### 2.2.5

-   Support older PHP versions too (<= 7.3)

### 2.2.4

-   Add PHPStan tag to errors in the `Problems` tab for easier filtering.

### 2.2.3

-   Publish previous version of the extension to the stable channel.

### 2.2.2 (pre-release)

-   Fix bugs from broken release
-   Fix bug where only the first symbol on a line would get hover information
-   Improve logging

### 2.2.1

-   Last release was broken, took it offline to investigate

### 2.2.0

-   Allow scanning of entire project (thanks to [edafonseca](https://github.com/SanderRonde/phpstan-vscode/issues/9) for the idea)
-   Move error-managing to the LSP-client, allows for setting errors on unopened files
-   Re-apply errors when files are closed and re-opened
-   Show progress (on by default), can be turned off with `phpstan.showProgress`

### 2.1.4

-   Release LSP functionality to the stable channel

### 2.1.3 (pre-release)

-   Improve hover functionality
    -   Also works if a parameter with the same name as a variable is defined on one line
    -   Also works if a variable that starts with the same name is on the line (`$x` and `$xyz`)

### 2.1.2 (pre-release)

-   Add `reload` command

### 2.1.1 (pre-release)

-   Remove completion-capability that wasn't actually being provided (leading to a popup)

### 2.1.0 (pre-release)

-   Add support for type-on-hover in `for` and `foreach` loops

### 2.0.0

-   Extension now provides a language server
-   Add support for showing type on hover(!)
-   Rewrite main phpstan-runner code

## 1.3.4

-   Fix issue with some configurations throwing errors

## 1.3.3

-   Add support for disabling config file

## 1.3.2

-   Fix more windows issues

## 1.3.1

-   Fix file path issues on windows

## 1.3.0

-   Ensure the extension works in a docker container as well (thanks to [Grldk](https://github.com/SanderRonde/phpstan-vscode/issues/1))

### 1.2.4

-   Never enable quote paths on non-windows operating systems
-   Add some logging

### 1.2.3

-   Only enable quote paths on windows

### 1.2.2

-   Fix issue where paths with spaces were not being resolved correctly (thanks to Balkoth for opening [this issue](https://github.com/SanderRonde/phpstan-vscode/issues/5))

### 1.2.1

-   Don't restart check when re-focusing file. Instead continue current check (unless file changed)

### 1.2.0

-   Improve `.neon` file parsing
-   Don't crash when a single `.neon` value fails to parse
-   Fix extension not working when using workspace is running under Windows

### 1.1.7

-   Fix extension not working when running VSCode on Windows.

### 1.1.6

-   Show "PHPStan checking errorred" in statusbar if check failed instead of silently failing.

### 1.1.5

-   Fix issue that occurred during bundling that somehow caused an error.

### 1.1.4

-   Don't show timeout message every time an operation ends

### 1.1.3

-   Always show error when timing out (thanks to [ljubadr](https://github.com/ljubadr) on github for the suggestion)
-   Add option for turning off these errors

### 1.1.2

-   Add logging panel under output

### 1.1.1

-   Add release notes

### 1.1.0

-   Automatically times out after some time
-   Shows result of last operation in statusbar (relevant when killed because of timeout)

### 1.0.0

Initial release!
