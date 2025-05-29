<?php

use PhpParser\Node;
use PhpParser\Node\Expr\ArrowFunction;
use PhpParser\Node\Expr\Assign;
use PhpParser\Node\Expr\PropertyFetch;
use PhpParser\Node\Expr\Variable;
use PhpParser\Node\FunctionLike;
use PhpParser\Node\Param;
use PHPStan\Analyser\Scope;
use PHPStan\Collectors\Collector;
use PHPStan\Node\CollectedDataNode;
use PHPStan\Node\InForeachNode;
use PHPStan\Reflection\ParametersAcceptor;
use PHPStan\Reflection\Php\PhpMethodFromParserNodeReflection;
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

	public static function binarySearch(&$array, $target) {
    $left = 0;
    $right = count($array) - 1;

    while ($left <= $right) {
			$mid = floor(($left + $right) / 2);

			if ($array[$mid] <= $target) {
				if ($mid == count($array) - 1 || $array[$mid + 1] > $target) {
					return $mid; // Closest index that is less than or equal to the target
				} else {
					$left = $mid + 1;
				}
			} else {
				$right = $mid - 1;
			}
    }

    return -1; // Target not found
}

	/**
	 * @param array<string, list<list<array{
	 *   typeDescr: string,
	 *   name: string,
	 *   pos: array{
	 *     start: int,
	 *     end: int
	 *   }
	 * }>>> $nodeDatas
	 * @return array<string, list<array{
	 *  typeDescr: string,
	 * 	name: string,
	 * 	pos: array{
	 * 		start: array{
	 * 			line: int,
	 * 			char: int
	 * 		},
	 * 		end: array{
	 * 			line: int,
	 * 			char: int
	 * 		}
	 * 	}
	 * }>>
	 */
	public static function convertCharIndicesToPositions(array $fileDatas): array {
		$results = [];
		foreach ($fileDatas as $filePath => $fileData) {
			if (count($fileData) === 0) {
				continue;
			}
			$file = file_get_contents($filePath);
			$results[$filePath] = [];

			$lineOffsets = [0]; // Initialize with the first line starting at index 0
			for ($i = 0; $i < strlen($file); $i++) {
				if ($file[$i] === "\n") {
					$lineOffsets[] = $i + 1; // Add 1 to include the newline character
				}
			}

			// Use binary search to find the line number efficiently
			$findPos = static function (int $filePos) use ($lineOffsets) {
				$line = self::binarySearch($lineOffsets, $filePos);
				$lineStart = $lineOffsets[$line];
				$char = $filePos - $lineStart;
				return [
					'line' => $line,
					'char' => $char
				];
			};

			foreach ($fileData as $nodeData) {
				foreach ($nodeData as $datum) {
					$endPos = $findPos($datum['pos']['end']);
					$results[$filePath][] = [
						'typeDescr' => $datum['typeDescr'],
						'name' => $datum['name'],
						'pos' => [
							'start' => $findPos($datum['pos']['start']),
							'end' => [
								'line' => $endPos['line'],
								'char' => $endPos['char']
							]
						]
					];
				}
			}
		}

		return $results;
	}

	/** @param CollectedDataNode $node */
	public function processNode(Node $node, Scope $scope): array {
		$collectedData = $node->get(PHPStanVSCodeTreeFetcherCollector::class);
		file_put_contents(self::REPORTER_FILE, json_encode(self::convertCharIndicesToPositions($collectedData)));
		return [];
	}
}

/**
 * @phpstan-type CollectedData array{
 *   typeDescr: string,
 *   name: string,
 *   pos: array{
 *     start: int,
 *     end: int
 *   }
 * }
 * @implements Collector<Node, list<CollectedData>>
 */
class PHPStanVSCodeTreeFetcherCollector {
	/** @var list<array{ClosureType, list<array{startPos: int, endPos: int, isUsed: false, closureNode: Closure|ArrowFunction}}}>> */
	private $closureTypeToNode = [];

	/**
	 * @return ?list<array{startPos: int, endPos: int, isUsed: false, closureNode: Closure|ArrowFunction}}}>
	 */
	protected function getClosuresFromScope(Scope $scope): ?array
	{
		$anonymousFunctionReflection = $scope->getAnonymousFunctionReflection();
		if ($anonymousFunctionReflection) {
			foreach ($this->closureTypeToNode as $closureTypeToNode) {
				list($closureType, $closureClosures) = $closureTypeToNode;
				if ($anonymousFunctionReflection !== $closureType) {
					continue;
				}

				return $closureClosures;
			}
		}
		return null;
	}

	protected function processClosures(Node $node, Scope $scope): void
	{
		if ($node instanceof Closure || $node instanceof ArrowFunction) {
			// We grab the type as well as the node and connect the two so that later
			// callers inside this closure can resolve to the node from the type.
			$closureType = $scope->getType($node);
			$existingClosures = $this->getClosuresFromScope($scope) ?? [];
			$existingClosures[] = [
				'startPos' => $node->getStartFilePos(),
				'endPos' => $node->getEndFilePos() + 1,
				'isUsed' => false,
				'closureNode' => $node
			];
			$this->closureTypeToNode[] = [$closureType, $existingClosures];
		}
	}

	/** @var list<string> */
	private $visitedFunctions = [];

	/**
	 * @return list<CollectedData>
	 */
	private function _processFunction(Scope $scope): array {
		$functionKey = implode('.', [
			$scope->getFile(),
			$scope->getClassReflection() ? $scope->getClassReflection()->getName() : null,
			$scope->getFunctionName()
		]);
		if (in_array($functionKey, $this->visitedFunctions, true)) {
			return [];
		}
		$this->visitedFunctions[] = $functionKey;

		$function = $scope->getFunction();
		assert($function !== null);
		if (!($function instanceof PhpMethodFromParserNodeReflection)) {
			return [];
		}

		$reflectionClass = new ReflectionClass(PhpMethodFromParserNodeReflection ::class);
		$reflectionMethod = $reflectionClass->getMethod('getFunctionLike');
		$reflectionMethod->setAccessible(true);
		$fnLike = $reflectionMethod->invoke($function);
		return $this->onFunction($fnLike, $function);
	}

	/**
	 * @param list<array{startPos: int, endPos: int, isUsed: false, closureNode: Closure|ArrowFunction}}}> $closures
	 * @return list<CollectedData>
	 */
	private function _processClosure(Scope $scope, array $closures): array {
		$functionKey = implode('.', [
			$scope->getFile(),
			$scope->getClassReflection() ? $scope->getClassReflection()->getName() : null,
			json_encode($closures)
		]);
		if (in_array($functionKey, $this->visitedMethods, true)) {
			return [];
		}
		$this->visitedMethods[] = $functionKey;

		$lastClosure = end($closures);
		/** @var Closure|ArrowFunction */
		$lastClosureNode = $lastClosure['closureNode'];
		$fnReflection = $scope->getAnonymousFunctionReflection();
		assert($fnReflection !== null);
		return $this->onClosure($lastClosureNode, $fnReflection);
	}

	/**
	 * @return list<CollectedData>
	 */
	public function processFunctionTrackings(Node $node, Scope $scope): array
	{
		/** @var list<CollectedData> */
		$data = [];
		$this->processClosures($node, $scope);
		if ($scope->getFunctionName()) {
			$data = array_merge($data, $this->_processFunction($scope));
		}

		$closures = $this->getClosuresFromScope($scope);
		if ($closures) {
			$data = array_merge($data, $this->_processClosure($scope, $closures));
		}
		return $data;
	}

	/** @var list<string> */
	private $visitedMethods = [];

	public function getNodeType(): string
	{
		return Node::class;
	}

	/**
	 * @return ?CollectedData
	 */
	private function processNodeWithType($node, Type $type): ?array
	{
		$varName = $node instanceof Variable ? $node->name : $node->name->name;
		$typeDescr = $type->describe(VerbosityLevel::precise());
		if (!is_string($varName)) {
			// Not a plain string, can't handle this
			return null;
		}

		if ($node->getStartFilePos() === -1 || $node->getEndFilePos() === -1) {
			return null;
		}

		return [
			'typeDescr' => $typeDescr,
			'name' => $varName,
			'pos' => [
				// Include `$` for variables
				'start' => $node->getStartFilePos() - ($node instanceof Variable ? 1 : 0),
				'end' => $node->getEndFilePos() + 1
			]
		];
	}

	/**
	 * @param list<array{startPos: int, endPos: int, isUsed: false, closureNode: Closure|ArrowFunction}}}> $closures
	 */
	protected function onClosure($node, ParametersAcceptor $type): array {
		/** @var array<string, Param> */
		$paramNodesByName = [];
		foreach ($node->getParams() as $param) {
			$paramNodesByName[$param->var->name] = $param;
		}

		/** @var list<CollectedData> */
		$data = [];
		foreach ($type->getParameters() as $parameter) {
			$paramNode = $paramNodesByName[$parameter->getName()] ?? null;
			if (!$paramNode) {
				continue;
			}

			$typeDescr = $parameter->getType()->describe(VerbosityLevel::precise());
			if ($paramNode->getStartFilePos() === -1 || $paramNode->getEndFilePos() === -1) {
				// Implicit parameter
				continue;
			}

			$data[] = [
				'typeDescr' => $typeDescr,
				'name' => $parameter->getName(),
				'pos' => [
					'start' => $paramNode->getStartFilePos(),
					'end' => $paramNode->getEndFilePos() + 1
				]
			];
		}

		return $data;
	}

	/** @var list<CollectedData> */
	protected function onFunction(FunctionLike $node, PhpMethodFromParserNodeReflection $type): array {
		/** @var list<CollectedData> $data */
		$data = [];

		/** @var array<string, Param> */
		$paramNodesByName = [];
		foreach ($node->getParams() as $param) {
			$paramNodesByName[$param->var->name] = $param;
		}

		foreach ($type->getVariants() as $variant) {
			foreach ($variant->getParameters() as $parameter) {
				$paramNode = $paramNodesByName[$parameter->getName()] ?? null;
				if (!$paramNode) {
					continue;
				}

				$typeDescr = $parameter->getType()->describe(VerbosityLevel::precise());

				if ($paramNode->getStartFilePos() === -1 || $paramNode->getEndFilePos() === -1) {
					// Implicit parameter
					continue;
				}
				$data[] = [
					'typeDescr' => $typeDescr,
					'name' => $parameter->getName(),
					'pos' => [
						'start' => $paramNode->getStartFilePos(),
						'end' => $paramNode->getEndFilePos() + 1
					]
				];
			}
		}

		return $data;
	}

	/** @var list<CollectedData> */
	public function processNode(Node $node, Scope $scope): ?array
	{
		if ($scope->getTraitReflection()) {
			return null;
		}
		/** @var list<CollectedData> $data */
		$data = [];

		$data = array_merge($data, $this->processFunctionTrackings($node, $scope));

		if ($node instanceof InForeachNode) {
			$keyVar = $node->getOriginalNode()->keyVar;
			$valueVar = $node->getOriginalNode()->valueVar;
			$exprType = $scope->getType($node->getOriginalNode()->expr);
			if ($exprType instanceof ArrayType) {
				if ($keyVar && $keyVar instanceof Variable) {
					$nodeWithType = $this->processNodeWithType($keyVar, $exprType->getKeyType());
					if ($nodeWithType) {
						$data[] = $nodeWithType;
					}
				} else if ($valueVar && $valueVar instanceof Variable) {
					$nodeWithType = $this->processNodeWithType($valueVar, $exprType->getItemType());
					if ($nodeWithType) {
						$data[] = $nodeWithType;
					}
				}
			}
		}

		if ($node instanceof Variable || $node instanceof PropertyFetch) {
			$type = $scope->getType($node);
			$parent = $node->getAttribute('parent');
			if ($parent && $parent instanceof Assign) {
				$type = $scope->getType($parent->expr);
			}
			if (!($type instanceof ErrorType)) {
				$nodeWithType = $this->processNodeWithType($node, $type);
				if ($nodeWithType) {
					$data[] = $nodeWithType;
				}
			}
		}

		if ($data === []) {
			return null;
		}
		return $data;
	}
}
