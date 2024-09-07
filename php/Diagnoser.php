<?php

use PHPStan\Command\Output;
use PHPStan\DependencyInjection\Container;
use PHPStan\File\FileExcluder;
use PHPStan\Diagnose\DiagnoseExtension;
use PHPStan\File\FileFinder;
use PHPStan\File\FileHelper;
use PHPStan\Parser\PathRoutingParser;
use PHPStan\PhpDoc\StubFilesProvider;

class PHPStanVSCodeDiagnoser implements DiagnoseExtension {
	public function __construct(
		private FileHelper $fileHelper,
		private array $analysedPaths,
		private Container $container,
		private string $currentWorkingDirectory,
	) {
	}

	/**
	 * @return string[]
	 */
	public function getFiles(): array {
		/** @var FileFinder $fileFinder */
		$fileFinder = $this->container->getService('fileFinderAnalyse');
		$fileFinderResult = $fileFinder->findFiles($this->analysedPaths);
		$files = $fileFinderResult->getFiles();

		/** @var PathRoutingParser $pathRoutingParser */
		$pathRoutingParser = $this->container->getService('pathRoutingParser');

		$pathRoutingParser->setAnalysedFiles($files);

		$currentWorkingDirectoryFileHelper = new FileHelper($this->currentWorkingDirectory);
		/** @var StubFilesProvider $stubFilesProvider */
		$stubFilesProvider = $this->container->getByType(StubFilesProvider::class);
		$stubFilesExcluder = new FileExcluder($currentWorkingDirectoryFileHelper, $stubFilesProvider->getProjectStubFiles(), true);

		$files = array_values(array_filter($files, static fn(string $file) => !$stubFilesExcluder->isExcludedFromAnalysing($file)));

		return $files;
	}

	public function print(Output $output): void {
		$output->writeLineFormatted("PHPStanVSCodeDiagnoser:" . json_encode($this->getFiles()));
	}
}
