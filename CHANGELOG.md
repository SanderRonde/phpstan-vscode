# Change Log

All notable changes to the "phpstan-vscode" extension will be documented in this file.

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
