<?php

use PhpParser\Node;
use PhpParser\Node\Expr\Assign;
use PhpParser\Node\Expr\PropertyFetch;
use PhpParser\Node\Expr\Variable;
use PHPStan\Analyser\Scope;
use PHPStan\Node\InForeachNode;
use PHPStan\Rules\Rule;
use PHPStan\Type\ArrayType;
use PHPStan\Type\ErrorType;
use PHPStan\Type\Type;
use PHPStan\Type\VerbosityLevel;

class Logger {
	public static function log(...$args) {
		foreach ($args as $arg) {
			print_r($arg);
			print(" ");
		}
		print("\n");
	}
}

class TreeFetcher implements Rule {
	// Replaced at runtime with a tmp file
	public const REPORTER_FILE = 'reported.json';
	public const DEV = true;
	private array $_visitedNodes = [];

	public function __construct() {
		if (self::DEV) {
			if (file_exists(self::REPORTER_FILE)) {
				unlink(self::REPORTER_FILE);
			}
		}
	}

	public function getNodeType(): string {
		return Node::class;
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
	private array $_varPositions;
	/**
	 * Unfortunately PHPStan doesn't have the char-in-line setting enabled for PHParser
	 * so we can't use that. Instead we just get the source string and scan it for `$varName`
	 * and hope someone doesn't mention the same variable in a comment in a line or something.
	 */
	private function bestEffortFindPos(string $fileName, int $lineNumber, string $line, string $varName, bool $isVar): int {
		$this->_varPositions[$fileName] ??= [];
		$this->_varPositions[$fileName][$lineNumber] ??= [];
		$this->_varPositions[$fileName][$lineNumber][$varName] ??= 0;
		$positionOnLine = $this->_varPositions[$fileName][$lineNumber][$varName];
		$this->_varPositions[$fileName][$lineNumber][$varName] = $positionOnLine + 1;

		// Find the nth occurrence of this variable on given line
		$offset = -1;
		$remainingPositions = $positionOnLine + 1;
		do {
			$remainingPositions -= 1;
			$offset = strpos($line, $isVar ? "$$varName" : $varName, $offset + 1);
		} while ($remainingPositions > 0);

		return $offset === false ? 0 : $offset;
	}

	/**
	 * Records a variable usage and its associated data
	 */
	private static function reportVariable(array $data) {
		$reporterData = file_get_contents(self::REPORTER_FILE);
		if ($reporterData === false) {
			$reporterData = '[]';
		}
		$parsedData = json_decode($reporterData, true);
		$parsedData[] = $data;
		$json = json_encode($parsedData, self::DEV ? JSON_PRETTY_PRINT : 0);
		file_put_contents(self::REPORTER_FILE, $json);
	}

	private function processNodeWithType(Node $node, Scope $scope, Type $type): void {
		$isVar = $node instanceof Variable;

		$lineNumber = $node->getStartLine();
		$file = self::readFile($scope->getFile());
		$line = explode("\n", $file)[$lineNumber - 1];
		$index = $this->bestEffortFindPos($scope->getFile(), $lineNumber, $line, $node->name, $isVar);
		$typeDescr = $type->describe(VerbosityLevel::precise());
		self::reportVariable([
			'typeDescription' => $typeDescr,
			'name' => $isVar ? $node->name : $node->name->name,
			'pos' => [
				'start' => [
					'line' => $lineNumber - 1,
					'char' => $index - 1
				],
				'end' => [
					'line' => $node->getEndLine(),
					'char' => $index + strlen($node->name) + ($isVar ? 1 : 0) // +1 for the $
				]
			]
		]);
	}

	public function processNode(Node $node, Scope $scope): array {
		$this->_visitedNodes[] = $node;
		if ($node instanceof InForeachNode) {
			$keyVar = $node->getOriginalNode()->keyVar;
			$valueVar = $node->getOriginalNode()->valueVar;
			$exprType = $scope->getType($node->getOriginalNode()->expr);
			if (!($exprType instanceof ArrayType)) {
				return [];
			}
			if ($keyVar) {
				$this->processNodeWithType($keyVar, $scope, $exprType->getKeyType());
			}
			if ($valueVar) {
				$this->processNodeWithType($valueVar, $scope, $exprType->getItemType());
			}
			return [];
		}
		if (!($node instanceof Variable) && !($node instanceof PropertyFetch)) {
			return [];
			InForeachNode::class;
		}

		$type = $scope->getType($node);
		$parent = $node->getAttribute('parent');
		if ($parent && $parent instanceof Assign) {
			$type = $scope->getType($parent->expr);
		}
		if ($type instanceof ErrorType) {
			return [];
		}

		$this->processNodeWithType($node, $scope, $type);
		return [];
	}
}
