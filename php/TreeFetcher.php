<?php

use PhpParser\Node;
use PhpParser\Node\Expr\Variable;
use PhpParser\Node\Param;
use PHPStan\Analyser\Scope;
use PHPStan\Rules\Rule;
use PHPStan\Type\VerbosityLevel;

class TreeFetcher implements Rule {
	// Replaced at runtime with a tmp file
	public const REPORTER_FILE = 'reported.json';
	private static int $_startedAt;

	public function __construct() {
		self::$_startedAt = time();
	}

	public function getNodeType(): string {
		return Variable::class;
	}

	/** @var array<string, string> */
	private static array $_fileCache = [];
	private static function readFile(string $fileName) {
		if (isset(self::$_fileCache[$fileName])) {
			return self::$_fileCache[$fileName];
		}
		return (self::$_fileCache[$fileName] = file_get_contents($fileName));
	}

	/** @var array<string, array<int, array<string, int>>> */
	private static array $_varPositions;
	/**
	 * Unfortunately PHPStan doesn't have the char-in-line setting enabled for PHParser
	 * so we can't use that. Instead we just get the source string and scan it for `$varName`
	 * and hope someone doesn't mention the same variable in a comment in a line or something.
	 */
	private static function bestEffortFindPos(string $fileName, int $lineNumber, string $line, string $varName): int {
		self::$_varPositions[$fileName] ??= [];
		self::$_varPositions[$fileName][$lineNumber] ??= [];
		self::$_varPositions[$fileName][$lineNumber][$varName] ??= 0;
		$positionOnLine = self::$_varPositions[$fileName][$lineNumber][$varName];
		self::$_varPositions[$fileName][$lineNumber][$varName] = $positionOnLine + 1;

		// Find the nth occurrence of this variable on given line
		$offset = -1;
		$remainingPositions = $positionOnLine + 1;
		do {
			$remainingPositions -= 1;
			$offset = strpos($line, "$$varName", $offset + 1);
		} while ($remainingPositions > 0);

		return $offset === false ? 0 : $offset;
	}

	private static array $_accessedFileMap = [];
	private static array $_disableWriteForFile = [];
	private static function reportVariable(string $fileName, array $data) {
		if (self::$_disableWriteForFile[$fileName] ?? null) {
			return;
		}
		$reporterData = file_get_contents(self::REPORTER_FILE);
		if ($reporterData === false) {
			$reporterData = '{}';
		}
		$parsedData = json_decode($reporterData, true);

		if (!isset(self::$_accessedFileMap[$fileName])) {
			// Not accessed before, prep for this file to be scanned
			$parsedData[$fileName] ??= [];
			$timestamp = $parsedData[$fileName]['timestamp'] ?? null;
			if ($timestamp && $timestamp >= self::$_startedAt) {
				self::$_disableWriteForFile[$fileName] = true;
				return;
			}
			$parsedData[$fileName] = [
				'timestamp' => self::$_startedAt,
				'data' => []
			];
			self::$_accessedFileMap[$fileName] = true;
		}

		$parsedData[$fileName]['data'][] = $data;
		file_put_contents(self::REPORTER_FILE, json_encode($parsedData));
	}

	public function processNode(Node $node, Scope $scope): array {
		assert($node instanceof Variable);

		$lineNumber = $node->getStartLine();
		$file = self::readFile($scope->getFile());
		$line = explode("\n", $file)[$lineNumber - 1];
		$index = self::bestEffortFindPos($scope->getFile(), $lineNumber, $line, $node->name);
		$type = $scope->getType($node);
		$typeDescr = $type->describe(VerbosityLevel::precise());
		self::reportVariable($scope->getFile(), [
			'typeDescription' => $typeDescr,
			'name' => $node->name,
			'pos' => [
				'start' => [
					'line' => $lineNumber - 1,
					'char' => $index
				],
				'end' => [
					'line' => $node->getEndLine(),
					'char' => $index + strlen($node->name) + 1 // +1 for the $
				]
			]
		]);
		return [];
	}
}
