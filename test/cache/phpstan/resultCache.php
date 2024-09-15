<?php declare(strict_types = 1);

return [
	'lastFullAnalysisTime' => 1726411440,
	'meta' => array (
  'cacheVersion' => 'v12-linesToIgnore',
  'phpstanVersion' => '1.12.0',
  'phpVersion' => 80303,
  'projectConfig' => '{parameters: {level: 9, scanDirectories: [/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/src/php], paths: [/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/src/php], tmpDir: %currentWorkingDirectory%/../cache/phpstan}}',
  'analysedPaths' => 
  array (
    0 => '/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/src/php',
  ),
  'scannedFiles' => 
  array (
  ),
  'composerLocks' => 
  array (
    '/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/composer.lock' => '259e05ff868f12b8c3ccefd6aeb8a3d8b200bd72',
  ),
  'composerInstalled' => 
  array (
    '/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/composer/installed.php' => 
    array (
      'versions' => 
      array (
        'phpstan/phpstan' => 
        array (
          'pretty_version' => '1.12.0',
          'version' => '1.12.0.0',
          'reference' => '384af967d35b2162f69526c7276acadce534d0e1',
          'type' => 'library',
          'install_path' => '/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/composer/../phpstan/phpstan',
          'aliases' => 
          array (
          ),
          'dev_requirement' => false,
        ),
      ),
    ),
  ),
  'executedFilesHashes' => 
  array (
    'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/runtime/Attribute.php' => 'eaf9127f074e9c7ebc65043ec4050f9fed60c2bb',
    'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/runtime/ReflectionAttribute.php' => '0b4b78277eb6545955d2ce5e09bff28f1f8052c8',
    'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/runtime/ReflectionIntersectionType.php' => 'a3e6299b87ee5d407dae7651758edfa11a74cb11',
    'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/runtime/ReflectionUnionType.php' => '1b349aa997a834faeafe05fa21bc31cae22bf2e2',
  ),
  'phpExtensions' => 
  array (
    0 => 'Core',
    1 => 'Phar',
    2 => 'Reflection',
    3 => 'SPL',
    4 => 'SimpleXML',
    5 => 'Zend OPcache',
    6 => 'apcu',
    7 => 'ctype',
    8 => 'curl',
    9 => 'date',
    10 => 'dom',
    11 => 'filter',
    12 => 'gd',
    13 => 'hash',
    14 => 'iconv',
    15 => 'igbinary',
    16 => 'json',
    17 => 'libxml',
    18 => 'mbstring',
    19 => 'openssl',
    20 => 'pcntl',
    21 => 'pcre',
    22 => 'pgsql',
    23 => 'posix',
    24 => 'random',
    25 => 'readline',
    26 => 'redis',
    27 => 'session',
    28 => 'sockets',
    29 => 'sodium',
    30 => 'standard',
    31 => 'tideways',
    32 => 'tokenizer',
    33 => 'xml',
    34 => 'xmlwriter',
    35 => 'zlib',
  ),
  'stubFiles' => 
  array (
  ),
  'level' => '9',
),
	'projectExtensionFiles' => array (
),
	'errorsCallback' => static function (): array { return array (
  '/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/src/php/DemoClass.php' => 
  array (
    0 => 
    \PHPStan\Analyser\Error::__set_state(array(
       'message' => 'Method DemoClass::strUnion() has no return type specified.',
       'file' => '/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/src/php/DemoClass.php',
       'line' => 11,
       'canBeIgnored' => true,
       'filePath' => '/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/src/php/DemoClass.php',
       'traitFilePath' => NULL,
       'tip' => NULL,
       'nodeLine' => 11,
       'nodeType' => 'PHPStan\\Node\\InClassMethodNode',
       'identifier' => 'missingType.return',
       'metadata' => 
      array (
      ),
    )),
  ),
); },
	'locallyIgnoredErrorsCallback' => static function (): array { return array (
); },
	'linesToIgnore' => array (
),
	'unmatchedLineIgnores' => array (
),
	'collectedDataCallback' => static function (): array { return array (
); },
	'dependencies' => array (
  '/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/src/php/DemoClass.php' => 
  array (
    'fileHash' => 'b8afe744d312c0f350468bc372aa3e12b22de586',
    'dependentFiles' => 
    array (
    ),
  ),
),
	'exportedNodesCallback' => static function (): array { return array (
  '/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/src/php/DemoClass.php' => 
  array (
    0 => 
    \PHPStan\Dependency\ExportedNode\ExportedClassNode::__set_state(array(
       'name' => 'X',
       'phpDoc' => NULL,
       'abstract' => false,
       'final' => false,
       'extends' => NULL,
       'implements' => 
      array (
      ),
       'usedTraits' => 
      array (
      ),
       'traitUseAdaptations' => 
      array (
      ),
       'statements' => 
      array (
        0 => 
        \PHPStan\Dependency\ExportedNode\ExportedPropertiesNode::__set_state(array(
           'names' => 
          array (
            0 => 'y',
          ),
           'phpDoc' => NULL,
           'type' => 'string',
           'public' => true,
           'private' => false,
           'static' => false,
           'readonly' => false,
           'attributes' => 
          array (
          ),
        )),
      ),
       'attributes' => 
      array (
      ),
    )),
    1 => 
    \PHPStan\Dependency\ExportedNode\ExportedClassNode::__set_state(array(
       'name' => 'DemoClass',
       'phpDoc' => NULL,
       'abstract' => false,
       'final' => false,
       'extends' => NULL,
       'implements' => 
      array (
      ),
       'usedTraits' => 
      array (
      ),
       'traitUseAdaptations' => 
      array (
      ),
       'statements' => 
      array (
        0 => 
        \PHPStan\Dependency\ExportedNode\ExportedMethodNode::__set_state(array(
           'name' => 'strUnion',
           'phpDoc' => 
          \PHPStan\Dependency\ExportedNode\ExportedPhpDocNode::__set_state(array(
             'phpDocString' => '/**
	 * @param \'a\'|\'b\'|\'c\'|\'d\'|\'e\'|\'f\' $initialStr
	 */',
             'namespace' => NULL,
             'uses' => 
            array (
            ),
             'constUses' => 
            array (
            ),
          )),
           'byRef' => false,
           'public' => true,
           'private' => false,
           'abstract' => false,
           'final' => false,
           'static' => false,
           'returnType' => NULL,
           'parameters' => 
          array (
            0 => 
            \PHPStan\Dependency\ExportedNode\ExportedParameterNode::__set_state(array(
               'name' => 'initialStr',
               'type' => 'string',
               'byRef' => false,
               'variadic' => false,
               'hasDefault' => false,
               'attributes' => 
              array (
              ),
            )),
          ),
           'attributes' => 
          array (
          ),
        )),
      ),
       'attributes' => 
      array (
      ),
    )),
  ),
); },
];
