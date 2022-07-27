# Change Log

All notable changes to the "phpstan-vscode" extension will be documented in this file.

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
