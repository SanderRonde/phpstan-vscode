Great that you want to contribute to this project!

## Opening an issue

> [!IMPORTANT]
> A simple test to perform before you open an issue is: if you can run PHPStan on the command line with the exact same settings and your issue persists, then it's not something this extension can fix and it should instead be reported to [the PHPStan project](https://github.com/phpstan/phpstan/issues).

First it's good to know what this extension is and what it is not.

This extension is a VSCode integration for PHPStan that can display the resulting errors, as well as it being able to queue a new check when any files in your project change. It is not affiliated with the PHPStan project itself. It is merely a wrapper around the PHPStan binary.

Examples of things this extension **can** do:

-   Display errors in the editor (potential issue: errors are not displayed or are displayed on the wrong line)
-   Watch for changes in open files (potential issue: file is not checked when it has just been changed and should be checked)

Examples of things this extension can **not** do:

-   Fix issues related to the running of PHPStan itself (potential issue: PHPStan is not running because there is no `vendor` directory)
-   Fix parallelization-related issues or issues related to it being too heavy to run (potential issue: PHPStan takes too long to run, PHPStan takes up too many system resources)
-   Fix wrongly reported errors (potential issue: "missing return type" is reported but the function does have a return type)

## Contributing code

See [the development section](https://github.com/SanderRonde/phpstan-vscode#development) of the README.
