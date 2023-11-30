<?php

use PhpParser\Node;
use PhpParser\Node\Expr\Assign;
use PhpParser\Node\Expr\PropertyFetch;
use PhpParser\Node\Expr\Variable;
use PhpParser\Node\Param;
use PHPStan\Analyser\Scope;
use PHPStan\Collectors\Collector;
use PHPStan\Node\CollectedDataNode;
use PHPStan\Node\InForeachNode;
use PHPStan\Rules\Rule;
use PHPStan\Type\ArrayType;
use PHPStan\Type\ErrorType;
use PHPStan\Type\Type;
use PHPStan\Type\VerbosityLevel;

class PHPStanVSCodeLogger {
	public static function log(...$args) {
		foreach ($args as $arg) {
			print_r($arg);
			print(" ");
		}
		print("\n");
	}
}

class PHPStanVSCodeTreeFetcher implements Rule {
	// Replaced at runtime with a tmp file
	public const REPORTER_FILE = 'reported.json';

	public function getNodeType(): string {
		return CollectedDataNode::class;
	}

	/** @param CollectedDataNode $node */
	public function processNode(Node $node, Scope $scope): array {
		$collectedData = $node->get(PHPStanVSCodeTreeFetcherCollector::class);
		file_put_contents(self::REPORTER_FILE, json_encode($collectedData));
		return [];
	}
}

/**
 * @implements Collector<Node, list<array{
 *   typeDescr: string,
 *   name: string,
 *   pos: array{
 *     start: array{
 *       line: int,
 *       char: int
 *     },
 *     end: array{
 *       line: int,
 *       char: int
 *     }
 *   }
 * }>>
 */
class PHPStanVSCodeTreeFetcherCollector {
	private $_visitedNodes = [];

	public function getNodeType(): string {
		return Node::class;
	}


	/** @var array<string, array<int, array<string, int>>> */
	private $_varPositions;
	/**
	 * Unfortunately PHPStan doesn't have the char-in-line setting enabled for PHParser
	 * so we can't use that. Instead we just get the source string and scan it for `$varName`
	 * and hope someone doesn't mention the same variable in a comment in a line or something.
	 */
	private function bestEffortFindPos(string $fileName, int $lineNumber, string $line, string $varName, bool $isVar): int {
		$this->_varPositions[$fileName] = $this->_varPositions[$fileName] ?? [];
		$this->_varPositions[$fileName][$lineNumber] = $this->_varPositions[$fileName][$lineNumber] ?? [];
		$this->_varPositions[$fileName][$lineNumber][$varName] = $this->_varPositions[$fileName][$lineNumber][$varName] ?? 0;
		$positionOnLine = $this->_varPositions[$fileName][$lineNumber][$varName];
		$this->_varPositions[$fileName][$lineNumber][$varName] = $positionOnLine + 1;

		// Find the nth occurrence of this variable on given line
		$offset = 0;
		$remainingPositions = $positionOnLine + 1;
		do {
			$remainingPositions -= 1;
			$matches = [];
			$name = $isVar ? '\$' . $varName : $varName;
			preg_match("/{$name}[^a-zA-Z0-9_]/", $line, $matches, PREG_OFFSET_CAPTURE, $offset + 1);
			if (!$matches[0]) {
				$offset = false;
				break;
			}
			$offset = $matches[0][1];
		} while ($remainingPositions > 0 && $offset !== false);

		return $offset === false ? 0 : $offset;
	}

	/** @var array<string, string> */
	private static $_fileCache = [];
	private static function readFile(string $fileName) {
		if (isset(self::$_fileCache[$fileName])) {
			return self::$_fileCache[$fileName];
		}
		return (self::$_fileCache[$fileName] = file_get_contents($fileName));
	}

	private function getLine(Scope $scope, int $lineNumber): string {
		$file = self::readFile($scope->getFile());
		$line = explode("\n", $file)[$lineNumber - 1];
		return $line;
	}

	/**
	 * @return array{
	 *   typeDescr: string,
	 *   name: string,
	 *   pos: array{
	 *     start: array{
	 *       line: int,
	 *       char: int
	 *     },
	 *     end: array{
	 *       line: int,
	 *       char: int
	 *     }
	 *   }
	 * }
	 */
	private function processNodeWithType(Node $node, Scope $scope, Type $type): array {
		$isVar = $node instanceof Variable;

		$lineNumber = $node->getStartLine();
		$line = $this->getLine($scope, $lineNumber);
		$varName = $isVar ? $node->name : $node->name->name;
		$index = $this->bestEffortFindPos($scope->getFile(), $lineNumber, $line, $varName, $isVar);
		$typeDescr = $type->describe(VerbosityLevel::precise());
		return [
			'typeDescr' => $typeDescr,
			'name' => $varName,
			'pos' => [
				'start' => [
					'line' => $lineNumber - 1,
					'char' => $index - 1
				],
				'end' => [
					'line' => $node->getEndLine(),
					'char' => $index + strlen($varName) + ($isVar ? 1 : 0) // +1 for the $
				]
			]
		];
	}

	/**
	 * @return ?list<array{
	 *   typeDescr: string,
	 *   name: string,
	 *   pos: array{
	 *     start: array{
	 *       line: int,
	 *       char: int
	 *     },
	 *     end: array{
	 *       line: int,
	 *       char: int
	 *     }
	 *   }
	 * }>
	 */
	public function processNode(Node $node, Scope $scope): ?array {
		if ($scope->getTraitReflection() !== null) {
			// Inside of a trait being applied to a class. We skip these since
			// they're not actually inside the current file.
			return null;
		}

		$this->_visitedNodes[] = $node;
		if ($node instanceof InForeachNode) {
			$keyVar = $node->getOriginalNode()->keyVar;
			$valueVar = $node->getOriginalNode()->valueVar;
			$exprType = $scope->getType($node->getOriginalNode()->expr);
			if (!($exprType instanceof ArrayType)) {
				return null;
			}
			if ($keyVar && $keyVar instanceof Variable) {
				return [$this->processNodeWithType($keyVar, $scope, $exprType->getKeyType())];
			}
			if ($valueVar && $valueVar instanceof Variable) {
				return [$this->processNodeWithType($valueVar, $scope, $exprType->getItemType())];
			}
			return null;
		}

		// TODO:(sander) can we find these too?
		if ($node instanceof Param) {
			// Only mark these as instances of a variable in our fancy char-index-finder.
			// PHPStan will somehow always see these are of type *ERROR*
			$line = $this->getLine($scope, $node->getStartLine());
			$this->bestEffortFindPos($scope->getFile(), $node->getStartLine(), $line, $node->var->name, true);
			return null;
		}

		if (!($node instanceof Variable) && !($node instanceof PropertyFetch)) {
			return null;
		}

		$type = $scope->getType($node);
		$parent = $node->getAttribute('parent');
		if ($parent && $parent instanceof Assign) {
			$type = $scope->getType($parent->expr);
		}
		if ($type instanceof ErrorType) {
			return null;
		}

		return [$this->processNodeWithType($node, $scope, $type)];
	}
}
