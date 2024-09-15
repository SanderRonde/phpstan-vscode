<?php
// source: phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.neon
// source: phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level9.neon
// source: /home/sanderronde/git/phpstan-vscode/test/multi-config-demo/test/phpstan.neon
// source: array

/** @noinspection PhpParamsInspection,PhpMethodMayBeStaticInspection */

declare(strict_types=1);

class Container_9bdc8b8877 extends _PHPStan_4f7beffdf\Nette\DI\Container
{
	protected $tags = [
		'phpstan.parser.richParserNodeVisitor' => [
			'04' => true,
			'05' => true,
			'06' => true,
			'07' => true,
			'08' => true,
			'09' => true,
			'010' => true,
			'013' => true,
			'014' => true,
			'015' => true,
			'016' => true,
			'017' => true,
			'018' => true,
			'019' => true,
			'082' => true,
		],
		'phpstan.stubFilesExtension' => ['039' => true, '040' => true, '042' => true, '043' => true],
		'phpstan.diagnoseExtension' => ['084' => true],
		'phpstan.broker.methodsClassReflectionExtension' => ['0101' => true, '0105' => true],
		'phpstan.broker.propertiesClassReflectionExtension' => ['0102' => true, '0107' => true, '0258' => true],
		'phpstan.broker.allowedSubTypesClassReflectionExtension' => ['0106' => true],
		'phpstan.broker.dynamicMethodReturnTypeExtension' => [
			'0108' => true,
			'0109' => true,
			'0206' => true,
			'0217' => true,
			'0223' => true,
			'0224' => true,
			'0228' => true,
			'0260' => true,
			'0287' => true,
			'0313' => true,
			'0314' => true,
			'0321' => true,
			'0322' => true,
			'0323' => true,
			'0324' => true,
			'0325' => true,
			'0326' => true,
		],
		'phpstan.broker.dynamicFunctionReturnTypeExtension' => [
			'0170' => true,
			'0171' => true,
			'0172' => true,
			'0173' => true,
			'0174' => true,
			'0175' => true,
			'0176' => true,
			'0177' => true,
			'0178' => true,
			'0179' => true,
			'0180' => true,
			'0181' => true,
			'0183' => true,
			'0184' => true,
			'0185' => true,
			'0186' => true,
			'0187' => true,
			'0188' => true,
			'0189' => true,
			'0190' => true,
			'0191' => true,
			'0192' => true,
			'0193' => true,
			'0194' => true,
			'0195' => true,
			'0196' => true,
			'0197' => true,
			'0199' => true,
			'0200' => true,
			'0203' => true,
			'0204' => true,
			'0208' => true,
			'0209' => true,
			'0211' => true,
			'0213' => true,
			'0214' => true,
			'0216' => true,
			'0218' => true,
			'0221' => true,
			'0222' => true,
			'0230' => true,
			'0231' => true,
			'0233' => true,
			'0234' => true,
			'0235' => true,
			'0236' => true,
			'0237' => true,
			'0238' => true,
			'0239' => true,
			'0240' => true,
			'0241' => true,
			'0242' => true,
			'0243' => true,
			'0245' => true,
			'0260' => true,
			'0263' => true,
			'0264' => true,
			'0265' => true,
			'0266' => true,
			'0267' => true,
			'0269' => true,
			'0270' => true,
			'0271' => true,
			'0272' => true,
			'0273' => true,
			'0274' => true,
			'0275' => true,
			'0276' => true,
			'0277' => true,
			'0278' => true,
			'0279' => true,
			'0281' => true,
			'0282' => true,
			'0283' => true,
			'0284' => true,
			'0285' => true,
			'0286' => true,
			'0288' => true,
			'0289' => true,
			'0290' => true,
			'0291' => true,
			'0292' => true,
			'0293' => true,
			'0294' => true,
			'0295' => true,
			'0298' => true,
			'0307' => true,
			'0311' => true,
			'0312' => true,
			'0315' => true,
			'0316' => true,
			'0317' => true,
			'0318' => true,
			'0319' => true,
			'0320' => true,
		],
		'phpstan.typeSpecifier.functionTypeSpecifyingExtension' => [
			'0182' => true,
			'0198' => true,
			'0212' => true,
			'0247' => true,
			'0257' => true,
			'0261' => true,
			'0262' => true,
			'0280' => true,
			'0296' => true,
			'0297' => true,
			'0299' => true,
			'0300' => true,
			'0301' => true,
			'0302' => true,
			'0303' => true,
			'0304' => true,
			'0305' => true,
			'0306' => true,
			'0308' => true,
			'0310' => true,
		],
		'phpstan.dynamicFunctionThrowTypeExtension' => ['0201' => true, '0244' => true, '0246' => true],
		'phpstan.broker.dynamicStaticMethodReturnTypeExtension' => [
			'0202' => true,
			'0205' => true,
			'0207' => true,
			'0220' => true,
			'0321' => true,
			'0327' => true,
		],
		'phpstan.dynamicStaticMethodThrowTypeExtension' => [
			'0219' => true,
			'0225' => true,
			'0227' => true,
			'0253' => true,
			'0254' => true,
			'0255' => true,
			'0256' => true,
			'0259' => true,
		],
		'phpstan.dynamicMethodThrowTypeExtension' => ['0226' => true, '0229' => true],
		'phpstan.functionParameterOutTypeExtension' => ['0248' => true],
		'phpstan.functionParameterClosureTypeExtension' => ['0249' => true],
		'phpstan.typeSpecifier.methodTypeSpecifyingExtension' => ['0268' => true],
		'phpstan.rules.rule' => [
			'0340' => true,
			'0344' => true,
			'0345' => true,
			'0346' => true,
			'0347' => true,
			'0348' => true,
			'0349' => true,
			'0351' => true,
			'0352' => true,
			'0353' => true,
			'0354' => true,
			'0355' => true,
			'0356' => true,
			'0357' => true,
			'0358' => true,
			'0360' => true,
			'0363' => true,
			'0364' => true,
			'0365' => true,
			'0366' => true,
			'0367' => true,
			'0374' => true,
			'0380' => true,
			'0383' => true,
			'0386' => true,
			'0387' => true,
			'0388' => true,
			'0390' => true,
			'0394' => true,
			'0395' => true,
			'0396' => true,
			'0397' => true,
			'0398' => true,
			'0399' => true,
			'0400' => true,
			'0401' => true,
			'0402' => true,
			'0408' => true,
			'0409' => true,
			'0410' => true,
			'0411' => true,
			'0412' => true,
			'0424' => true,
			'0425' => true,
			'0426' => true,
			'0427' => true,
			'0428' => true,
			'0429' => true,
			'0430' => true,
			'0433' => true,
			'0434' => true,
			'0435' => true,
			'0437' => true,
			'0438' => true,
			'0439' => true,
			'0440' => true,
			'0441' => true,
			'0442' => true,
			'0443' => true,
			'0444' => true,
			'0448' => true,
			'0452' => true,
			'0456' => true,
			'0460' => true,
			'0461' => true,
			'rules.0' => true,
			'rules.1' => true,
			'rules.10' => true,
			'rules.100' => true,
			'rules.101' => true,
			'rules.102' => true,
			'rules.103' => true,
			'rules.104' => true,
			'rules.105' => true,
			'rules.106' => true,
			'rules.107' => true,
			'rules.108' => true,
			'rules.109' => true,
			'rules.11' => true,
			'rules.110' => true,
			'rules.111' => true,
			'rules.112' => true,
			'rules.113' => true,
			'rules.114' => true,
			'rules.115' => true,
			'rules.116' => true,
			'rules.117' => true,
			'rules.118' => true,
			'rules.119' => true,
			'rules.12' => true,
			'rules.120' => true,
			'rules.121' => true,
			'rules.122' => true,
			'rules.123' => true,
			'rules.124' => true,
			'rules.125' => true,
			'rules.126' => true,
			'rules.127' => true,
			'rules.128' => true,
			'rules.129' => true,
			'rules.13' => true,
			'rules.130' => true,
			'rules.131' => true,
			'rules.132' => true,
			'rules.133' => true,
			'rules.134' => true,
			'rules.135' => true,
			'rules.136' => true,
			'rules.137' => true,
			'rules.138' => true,
			'rules.139' => true,
			'rules.14' => true,
			'rules.140' => true,
			'rules.141' => true,
			'rules.142' => true,
			'rules.143' => true,
			'rules.144' => true,
			'rules.145' => true,
			'rules.146' => true,
			'rules.147' => true,
			'rules.148' => true,
			'rules.149' => true,
			'rules.15' => true,
			'rules.150' => true,
			'rules.151' => true,
			'rules.152' => true,
			'rules.153' => true,
			'rules.154' => true,
			'rules.155' => true,
			'rules.156' => true,
			'rules.157' => true,
			'rules.158' => true,
			'rules.159' => true,
			'rules.16' => true,
			'rules.160' => true,
			'rules.161' => true,
			'rules.162' => true,
			'rules.163' => true,
			'rules.164' => true,
			'rules.165' => true,
			'rules.17' => true,
			'rules.18' => true,
			'rules.19' => true,
			'rules.2' => true,
			'rules.20' => true,
			'rules.21' => true,
			'rules.22' => true,
			'rules.23' => true,
			'rules.24' => true,
			'rules.25' => true,
			'rules.26' => true,
			'rules.27' => true,
			'rules.28' => true,
			'rules.29' => true,
			'rules.3' => true,
			'rules.30' => true,
			'rules.31' => true,
			'rules.32' => true,
			'rules.33' => true,
			'rules.34' => true,
			'rules.35' => true,
			'rules.36' => true,
			'rules.37' => true,
			'rules.38' => true,
			'rules.39' => true,
			'rules.4' => true,
			'rules.40' => true,
			'rules.41' => true,
			'rules.42' => true,
			'rules.43' => true,
			'rules.44' => true,
			'rules.45' => true,
			'rules.46' => true,
			'rules.47' => true,
			'rules.48' => true,
			'rules.49' => true,
			'rules.5' => true,
			'rules.50' => true,
			'rules.51' => true,
			'rules.52' => true,
			'rules.53' => true,
			'rules.54' => true,
			'rules.55' => true,
			'rules.56' => true,
			'rules.57' => true,
			'rules.58' => true,
			'rules.59' => true,
			'rules.6' => true,
			'rules.60' => true,
			'rules.61' => true,
			'rules.62' => true,
			'rules.63' => true,
			'rules.64' => true,
			'rules.65' => true,
			'rules.66' => true,
			'rules.67' => true,
			'rules.68' => true,
			'rules.69' => true,
			'rules.7' => true,
			'rules.70' => true,
			'rules.71' => true,
			'rules.72' => true,
			'rules.73' => true,
			'rules.74' => true,
			'rules.75' => true,
			'rules.76' => true,
			'rules.77' => true,
			'rules.78' => true,
			'rules.79' => true,
			'rules.8' => true,
			'rules.80' => true,
			'rules.81' => true,
			'rules.82' => true,
			'rules.83' => true,
			'rules.84' => true,
			'rules.85' => true,
			'rules.86' => true,
			'rules.87' => true,
			'rules.88' => true,
			'rules.89' => true,
			'rules.9' => true,
			'rules.90' => true,
			'rules.91' => true,
			'rules.92' => true,
			'rules.93' => true,
			'rules.94' => true,
			'rules.95' => true,
			'rules.96' => true,
			'rules.97' => true,
			'rules.98' => true,
			'rules.99' => true,
		],
	];

	protected $types = ['container' => '_PHPStan_4f7beffdf\Nette\DI\Container'];
	protected $aliases = [];

	protected $wiring = [
		'_PHPStan_4f7beffdf\Nette\DI\Container' => [['container']],
		'PHPStan\Rules\Rule' => [
			[
				'0129',
				'0130',
				'0132',
				'0133',
				'0147',
				'0338',
				'0339',
				'0340',
				'0341',
				'0342',
				'0343',
				'0344',
				'0345',
				'0346',
				'0347',
				'0348',
				'0349',
				'0350',
				'0351',
				'0352',
				'0353',
				'0354',
				'0355',
				'0356',
				'0357',
				'0358',
				'0359',
				'0360',
				'0361',
				'0362',
				'0363',
				'0364',
				'0365',
				'0366',
				'0367',
				'0369',
				'0370',
				'0371',
				'0372',
				'0373',
				'0374',
				'0375',
				'0376',
				'0377',
				'0378',
				'0380',
				'0381',
				'0382',
				'0383',
				'0384',
				'0385',
				'0386',
				'0387',
				'0388',
				'0389',
				'0390',
				'0391',
				'0392',
				'0393',
				'0394',
				'0395',
				'0396',
				'0397',
				'0398',
				'0399',
				'0400',
				'0401',
				'0402',
				'0403',
				'0404',
				'0405',
				'0406',
				'0407',
				'0408',
				'0409',
				'0410',
				'0411',
				'0412',
				'0413',
				'0416',
				'0419',
				'0422',
				'0424',
				'0425',
				'0426',
				'0427',
				'0428',
				'0429',
				'0430',
				'0431',
				'0432',
				'0433',
				'0434',
				'0435',
				'0436',
				'0437',
				'0438',
				'0439',
				'0440',
				'0441',
				'0442',
				'0443',
				'0444',
				'0447',
				'0448',
				'0449',
				'0450',
				'0451',
				'0452',
				'0453',
				'0454',
				'0455',
				'0456',
				'0457',
				'0458',
				'0459',
				'0460',
				'0461',
				'0462',
			],
			[
				'rules.0',
				'rules.1',
				'rules.2',
				'rules.3',
				'rules.4',
				'rules.5',
				'rules.6',
				'rules.7',
				'rules.8',
				'rules.9',
				'rules.10',
				'rules.11',
				'rules.12',
				'rules.13',
				'rules.14',
				'rules.15',
				'rules.16',
				'rules.17',
				'rules.18',
				'rules.19',
				'rules.20',
				'rules.21',
				'rules.22',
				'rules.23',
				'rules.24',
				'rules.25',
				'rules.26',
				'rules.27',
				'rules.28',
				'rules.29',
				'rules.30',
				'rules.31',
				'rules.32',
				'rules.33',
				'rules.34',
				'rules.35',
				'rules.36',
				'rules.37',
				'rules.38',
				'rules.39',
				'rules.40',
				'rules.41',
				'rules.42',
				'rules.43',
				'rules.44',
				'rules.45',
				'rules.46',
				'rules.47',
				'rules.48',
				'rules.49',
				'rules.50',
				'rules.51',
				'rules.52',
				'rules.53',
				'rules.54',
				'rules.55',
				'rules.56',
				'rules.57',
				'rules.58',
				'rules.59',
				'rules.60',
				'rules.61',
				'rules.62',
				'rules.63',
				'rules.64',
				'rules.65',
				'rules.66',
				'rules.67',
				'rules.68',
				'rules.69',
				'rules.70',
				'rules.71',
				'rules.72',
				'rules.73',
				'rules.74',
				'rules.75',
				'rules.76',
				'rules.77',
				'rules.78',
				'rules.79',
				'rules.80',
				'rules.81',
				'rules.82',
				'rules.83',
				'rules.84',
				'rules.85',
				'rules.86',
				'rules.87',
				'rules.88',
				'rules.89',
				'rules.90',
				'rules.91',
				'rules.92',
				'rules.93',
				'rules.94',
				'rules.95',
				'rules.96',
				'rules.97',
				'rules.98',
				'rules.99',
				'rules.100',
				'rules.101',
				'rules.102',
				'rules.103',
				'rules.104',
				'rules.105',
				'rules.106',
				'rules.107',
				'rules.108',
				'rules.109',
				'rules.110',
				'rules.111',
				'rules.112',
				'rules.113',
				'rules.114',
				'rules.115',
				'rules.116',
				'rules.117',
				'rules.118',
				'rules.119',
				'rules.120',
				'rules.121',
				'rules.122',
				'rules.123',
				'rules.124',
				'rules.125',
				'rules.126',
				'rules.127',
				'rules.128',
				'rules.129',
				'rules.130',
				'rules.131',
				'rules.132',
				'rules.133',
				'rules.134',
				'rules.135',
				'rules.136',
				'rules.137',
				'rules.138',
				'rules.139',
				'rules.140',
				'rules.141',
				'rules.142',
				'rules.143',
				'rules.144',
				'rules.145',
				'rules.146',
				'rules.147',
				'rules.148',
				'rules.149',
				'rules.150',
				'rules.151',
				'rules.152',
				'rules.153',
				'rules.154',
				'rules.155',
				'rules.156',
				'rules.157',
				'rules.158',
				'rules.159',
				'rules.160',
				'rules.161',
				'rules.162',
				'rules.163',
				'rules.164',
				'rules.165',
			],
		],
		'PHPStan\Rules\Debug\DumpTypeRule' => [['rules.0']],
		'PHPStan\Rules\Debug\FileAssertRule' => [['rules.1']],
		'PHPStan\Rules\Api\ApiInstantiationRule' => [['rules.2']],
		'PHPStan\Rules\Api\ApiClassExtendsRule' => [['rules.3']],
		'PHPStan\Rules\Api\ApiClassImplementsRule' => [['rules.4']],
		'PHPStan\Rules\Api\ApiInterfaceExtendsRule' => [['rules.5']],
		'PHPStan\Rules\Api\ApiMethodCallRule' => [['rules.6']],
		'PHPStan\Rules\Api\ApiStaticCallRule' => [['rules.7']],
		'PHPStan\Rules\Api\ApiTraitUseRule' => [['rules.8']],
		'PHPStan\Rules\Api\GetTemplateTypeRule' => [['rules.9']],
		'PHPStan\Rules\Api\PhpStanNamespaceIn3rdPartyPackageRule' => [['rules.10']],
		'PHPStan\Rules\Arrays\DuplicateKeysInLiteralArraysRule' => [['rules.11']],
		'PHPStan\Rules\Arrays\EmptyArrayItemRule' => [['rules.12']],
		'PHPStan\Rules\Arrays\OffsetAccessWithoutDimForReadingRule' => [['rules.13']],
		'PHPStan\Rules\Cast\UnsetCastRule' => [['rules.14']],
		'PHPStan\Rules\Classes\AllowedSubTypesRule' => [['rules.15']],
		'PHPStan\Rules\Classes\ClassAttributesRule' => [['rules.16']],
		'PHPStan\Rules\Classes\ClassConstantAttributesRule' => [['rules.17']],
		'PHPStan\Rules\Classes\ClassConstantRule' => [['rules.18']],
		'PHPStan\Rules\Classes\DuplicateDeclarationRule' => [['rules.19']],
		'PHPStan\Rules\Classes\EnumSanityRule' => [['rules.20']],
		'PHPStan\Rules\Classes\ExistingClassesInClassImplementsRule' => [['rules.21']],
		'PHPStan\Rules\Classes\ExistingClassesInEnumImplementsRule' => [['rules.22']],
		'PHPStan\Rules\Classes\ExistingClassesInInterfaceExtendsRule' => [['rules.23']],
		'PHPStan\Rules\Classes\ExistingClassInTraitUseRule' => [['rules.24']],
		'PHPStan\Rules\Classes\InstantiationRule' => [['rules.25']],
		'PHPStan\Rules\Classes\InstantiationCallableRule' => [['rules.26']],
		'PHPStan\Rules\Classes\InvalidPromotedPropertiesRule' => [['rules.27']],
		'PHPStan\Rules\Classes\LocalTypeAliasesRule' => [['rules.28']],
		'PHPStan\Rules\Classes\LocalTypeTraitAliasesRule' => [['rules.29']],
		'PHPStan\Rules\Classes\NewStaticRule' => [['rules.30']],
		'PHPStan\Rules\Classes\NonClassAttributeClassRule' => [['rules.31']],
		'PHPStan\Rules\Classes\ReadOnlyClassRule' => [['rules.32']],
		'PHPStan\Rules\Classes\TraitAttributeClassRule' => [['rules.33']],
		'PHPStan\Rules\Constants\DynamicClassConstantFetchRule' => [['rules.34']],
		'PHPStan\Rules\Constants\FinalConstantRule' => [['rules.35']],
		'PHPStan\Rules\Constants\NativeTypedClassConstantRule' => [['rules.36']],
		'PHPStan\Rules\EnumCases\EnumCaseAttributesRule' => [['rules.37']],
		'PHPStan\Rules\Exceptions\NoncapturingCatchRule' => [['rules.38']],
		'PHPStan\Rules\Exceptions\ThrowExpressionRule' => [['rules.39']],
		'PHPStan\Rules\Functions\ArrowFunctionAttributesRule' => [['rules.40']],
		'PHPStan\Rules\Functions\ArrowFunctionReturnNullsafeByRefRule' => [['rules.41']],
		'PHPStan\Rules\Functions\ClosureAttributesRule' => [['rules.42']],
		'PHPStan\Rules\Functions\DefineParametersRule' => [['rules.43']],
		'PHPStan\Rules\Functions\ExistingClassesInArrowFunctionTypehintsRule' => [['rules.44']],
		'PHPStan\Rules\Functions\CallToFunctionParametersRule' => [['rules.45']],
		'PHPStan\Rules\Functions\ExistingClassesInClosureTypehintsRule' => [['rules.46']],
		'PHPStan\Rules\Functions\ExistingClassesInTypehintsRule' => [['rules.47']],
		'PHPStan\Rules\Functions\FunctionAttributesRule' => [['rules.48']],
		'PHPStan\Rules\Functions\InnerFunctionRule' => [['rules.49']],
		'PHPStan\Rules\Functions\InvalidLexicalVariablesInClosureUseRule' => [['rules.50']],
		'PHPStan\Rules\Functions\ParamAttributesRule' => [['rules.51']],
		'PHPStan\Rules\Functions\PrintfParametersRule' => [['rules.52']],
		'PHPStan\Rules\Functions\RedefinedParametersRule' => [['rules.53']],
		'PHPStan\Rules\Functions\ReturnNullsafeByRefRule' => [['rules.54']],
		'PHPStan\Rules\Ignore\IgnoreParseErrorRule' => [['rules.55']],
		'PHPStan\Rules\Functions\VariadicParametersDeclarationRule' => [['rules.56']],
		'PHPStan\Rules\Keywords\ContinueBreakInLoopRule' => [['rules.57']],
		'PHPStan\Rules\Keywords\DeclareStrictTypesRule' => [['rules.58']],
		'PHPStan\Rules\Methods\AbstractMethodInNonAbstractClassRule' => [['rules.59']],
		'PHPStan\Rules\Methods\AbstractPrivateMethodRule' => [['rules.60']],
		'PHPStan\Rules\Methods\CallMethodsRule' => [['rules.61']],
		'PHPStan\Rules\Methods\CallStaticMethodsRule' => [['rules.62']],
		'PHPStan\Rules\Methods\ConstructorReturnTypeRule' => [['rules.63']],
		'PHPStan\Rules\Methods\ExistingClassesInTypehintsRule' => [['rules.64']],
		'PHPStan\Rules\Methods\FinalPrivateMethodRule' => [['rules.65']],
		'PHPStan\Rules\Methods\MethodCallableRule' => [['rules.66']],
		'PHPStan\Rules\Methods\MethodVisibilityInInterfaceRule' => [['rules.67']],
		'PHPStan\Rules\Methods\MissingMethodImplementationRule' => [['rules.68']],
		'PHPStan\Rules\Methods\MethodAttributesRule' => [['rules.69']],
		'PHPStan\Rules\Methods\StaticMethodCallableRule' => [['rules.70']],
		'PHPStan\Rules\Names\UsedNamesRule' => [['rules.71']],
		'PHPStan\Rules\Operators\InvalidAssignVarRule' => [['rules.72']],
		'PHPStan\Rules\Properties\AccessPropertiesInAssignRule' => [['rules.73']],
		'PHPStan\Rules\Properties\AccessStaticPropertiesInAssignRule' => [['rules.74']],
		'PHPStan\Rules\Properties\InvalidCallablePropertyTypeRule' => [['rules.75']],
		'PHPStan\Rules\Properties\MissingReadOnlyPropertyAssignRule' => [['rules.76']],
		'PHPStan\Rules\Properties\PropertiesInInterfaceRule' => [['rules.77']],
		'PHPStan\Rules\Properties\PropertyAttributesRule' => [['rules.78']],
		'PHPStan\Rules\Properties\ReadOnlyPropertyRule' => [['rules.79']],
		'PHPStan\Rules\Traits\ConflictingTraitConstantsRule' => [['rules.80']],
		'PHPStan\Rules\Traits\ConstantsInTraitsRule' => [['rules.81']],
		'PHPStan\Rules\Types\InvalidTypesInUnionRule' => [['rules.82']],
		'PHPStan\Rules\Variables\UnsetRule' => [['rules.83']],
		'PHPStan\Rules\Whitespace\FileWhitespaceRule' => [['rules.84']],
		'PHPStan\Rules\Classes\UnusedConstructorParametersRule' => [['rules.85']],
		'PHPStan\Rules\Constants\ConstantRule' => [['rules.86']],
		'PHPStan\Rules\Functions\UnusedClosureUsesRule' => [['rules.87']],
		'PHPStan\Rules\Variables\EmptyRule' => [['rules.88']],
		'PHPStan\Rules\Variables\IssetRule' => [['rules.89']],
		'PHPStan\Rules\Variables\NullCoalesceRule' => [['rules.90']],
		'PHPStan\Rules\Cast\EchoRule' => [['rules.91']],
		'PHPStan\Rules\Cast\InvalidCastRule' => [['rules.92']],
		'PHPStan\Rules\Cast\InvalidPartOfEncapsedStringRule' => [['rules.93']],
		'PHPStan\Rules\Cast\PrintRule' => [['rules.94']],
		'PHPStan\Rules\Classes\AccessPrivateConstantThroughStaticRule' => [['rules.95']],
		'PHPStan\Rules\Comparison\UsageOfVoidMatchExpressionRule' => [['rules.96']],
		'PHPStan\Rules\Constants\ValueAssignedToClassConstantRule' => [['rules.97']],
		'PHPStan\Rules\Functions\IncompatibleDefaultParameterTypeRule' => [['rules.98']],
		'PHPStan\Rules\Generics\ClassAncestorsRule' => [['rules.99']],
		'PHPStan\Rules\Generics\ClassTemplateTypeRule' => [['rules.100']],
		'PHPStan\Rules\Generics\EnumAncestorsRule' => [['rules.101']],
		'PHPStan\Rules\Generics\EnumTemplateTypeRule' => [['rules.102']],
		'PHPStan\Rules\Generics\FunctionTemplateTypeRule' => [['rules.103']],
		'PHPStan\Rules\Generics\FunctionSignatureVarianceRule' => [['rules.104']],
		'PHPStan\Rules\Generics\InterfaceAncestorsRule' => [['rules.105']],
		'PHPStan\Rules\Generics\InterfaceTemplateTypeRule' => [['rules.106']],
		'PHPStan\Rules\Generics\MethodTemplateTypeRule' => [['rules.107']],
		'PHPStan\Rules\Generics\MethodTagTemplateTypeRule' => [['rules.108']],
		'PHPStan\Rules\Generics\MethodSignatureVarianceRule' => [['rules.109']],
		'PHPStan\Rules\Generics\TraitTemplateTypeRule' => [['rules.110']],
		'PHPStan\Rules\Generics\UsedTraitsRule' => [['rules.111']],
		'PHPStan\Rules\Methods\CallPrivateMethodThroughStaticRule' => [['rules.112']],
		'PHPStan\Rules\Methods\IncompatibleDefaultParameterTypeRule' => [['rules.113']],
		'PHPStan\Rules\Operators\InvalidComparisonOperationRule' => [['rules.114']],
		'PHPStan\Rules\PhpDoc\FunctionConditionalReturnTypeRule' => [['rules.115']],
		'PHPStan\Rules\PhpDoc\MethodConditionalReturnTypeRule' => [['rules.116']],
		'PHPStan\Rules\PhpDoc\FunctionAssertRule' => [['rules.117']],
		'PHPStan\Rules\PhpDoc\MethodAssertRule' => [['rules.118']],
		'PHPStan\Rules\PhpDoc\IncompatibleSelfOutTypeRule' => [['rules.119']],
		'PHPStan\Rules\PhpDoc\IncompatibleClassConstantPhpDocTypeRule' => [['rules.120']],
		'PHPStan\Rules\PhpDoc\IncompatiblePhpDocTypeRule' => [['rules.121']],
		'PHPStan\Rules\PhpDoc\IncompatiblePropertyPhpDocTypeRule' => [['rules.122']],
		'PHPStan\Rules\PhpDoc\InvalidThrowsPhpDocValueRule' => [['rules.123']],
		'PHPStan\Rules\PhpDoc\IncompatibleParamImmediatelyInvokedCallableRule' => [['rules.124']],
		'PHPStan\Rules\Properties\AccessPrivatePropertyThroughStaticRule' => [['rules.125']],
		'PHPStan\Rules\Classes\RequireImplementsRule' => [['rules.126']],
		'PHPStan\Rules\Classes\RequireExtendsRule' => [['rules.127']],
		'PHPStan\Rules\PhpDoc\RequireImplementsDefinitionClassRule' => [['rules.128']],
		'PHPStan\Rules\PhpDoc\RequireExtendsDefinitionClassRule' => [['rules.129']],
		'PHPStan\Rules\PhpDoc\RequireExtendsDefinitionTraitRule' => [['rules.130']],
		'PHPStan\Rules\Arrays\ArrayDestructuringRule' => [['rules.131']],
		'PHPStan\Rules\Arrays\IterableInForeachRule' => [['rules.132']],
		'PHPStan\Rules\Arrays\OffsetAccessAssignmentRule' => [['rules.133']],
		'PHPStan\Rules\Arrays\OffsetAccessAssignOpRule' => [['rules.134']],
		'PHPStan\Rules\Arrays\OffsetAccessValueAssignmentRule' => [['rules.135']],
		'PHPStan\Rules\Arrays\UnpackIterableInArrayRule' => [['rules.136']],
		'PHPStan\Rules\Exceptions\ThrowExprTypeRule' => [['rules.137']],
		'PHPStan\Rules\Functions\ArrowFunctionReturnTypeRule' => [['rules.138']],
		'PHPStan\Rules\Functions\ClosureReturnTypeRule' => [['rules.139']],
		'PHPStan\Rules\Functions\ReturnTypeRule' => [['rules.140']],
		'PHPStan\Rules\Generators\YieldTypeRule' => [['rules.141']],
		'PHPStan\Rules\Methods\ReturnTypeRule' => [['rules.142']],
		'PHPStan\Rules\Properties\DefaultValueTypesAssignedToPropertiesRule' => [['rules.143']],
		'PHPStan\Rules\Properties\ReadOnlyPropertyAssignRule' => [['rules.144']],
		'PHPStan\Rules\Properties\ReadOnlyPropertyAssignRefRule' => [['rules.145']],
		'PHPStan\Rules\Properties\TypesAssignedToPropertiesRule' => [['rules.146']],
		'PHPStan\Rules\Variables\ThrowTypeRule' => [['rules.147']],
		'PHPStan\Rules\Variables\VariableCloningRule' => [['rules.148']],
		'PHPStan\Rules\Arrays\DeadForeachRule' => [['rules.149']],
		'PHPStan\Rules\DeadCode\UnreachableStatementRule' => [['rules.150']],
		'PHPStan\Rules\DeadCode\UnusedPrivateConstantRule' => [['rules.151']],
		'PHPStan\Rules\DeadCode\UnusedPrivateMethodRule' => [['rules.152']],
		'PHPStan\Rules\Exceptions\OverwrittenExitPointByFinallyRule' => [['rules.153']],
		'PHPStan\Rules\Functions\CallToFunctionStatementWithoutSideEffectsRule' => [['rules.154']],
		'PHPStan\Rules\Methods\CallToMethodStatementWithoutSideEffectsRule' => [['rules.155']],
		'PHPStan\Rules\Methods\CallToStaticMethodStatementWithoutSideEffectsRule' => [['rules.156']],
		'PHPStan\Rules\Methods\NullsafeMethodCallRule' => [['rules.157']],
		'PHPStan\Rules\TooWideTypehints\TooWideArrowFunctionReturnTypehintRule' => [['rules.158']],
		'PHPStan\Rules\TooWideTypehints\TooWideClosureReturnTypehintRule' => [['rules.159']],
		'PHPStan\Rules\TooWideTypehints\TooWideFunctionReturnTypehintRule' => [['rules.160']],
		'PHPStan\Rules\DateTimeInstantiationRule' => [['rules.161']],
		'PHPStan\Rules\Constants\MissingClassConstantTypehintRule' => [['rules.162']],
		'PHPStan\Rules\Functions\MissingFunctionReturnTypehintRule' => [['rules.163']],
		'PHPStan\Rules\Methods\MissingMethodReturnTypehintRule' => [['rules.164']],
		'PHPStan\Rules\Properties\MissingPropertyTypehintRule' => [['rules.165']],
		'PhpParser\BuilderFactory' => [['01']],
		'PHPStan\Parser\LexerFactory' => [['02']],
		'PhpParser\NodeVisitorAbstract' => [
			[
				'03',
				'04',
				'05',
				'06',
				'07',
				'08',
				'09',
				'010',
				'011',
				'012',
				'013',
				'014',
				'015',
				'016',
				'017',
				'018',
				'019',
				'067',
				'082',
				'091',
			],
		],
		'PhpParser\NodeVisitor' => [
			[
				'03',
				'04',
				'05',
				'06',
				'07',
				'08',
				'09',
				'010',
				'011',
				'012',
				'013',
				'014',
				'015',
				'016',
				'017',
				'018',
				'019',
				'067',
				'082',
				'091',
			],
		],
		'PhpParser\NodeVisitor\NameResolver' => [['03']],
		'PHPStan\Parser\AnonymousClassVisitor' => [['04']],
		'PHPStan\Parser\ArrayFilterArgVisitor' => [['05']],
		'PHPStan\Parser\ArrayMapArgVisitor' => [['06']],
		'PHPStan\Parser\ArrayWalkArgVisitor' => [['07']],
		'PHPStan\Parser\ClosureArgVisitor' => [['08']],
		'PHPStan\Parser\ClosureBindToVarVisitor' => [['09']],
		'PHPStan\Parser\ClosureBindArgVisitor' => [['010']],
		'PHPStan\Parser\CurlSetOptArgVisitor' => [['011']],
		'PHPStan\Parser\TypeTraverserInstanceofVisitor' => [['012']],
		'PHPStan\Parser\ArrowFunctionArgVisitor' => [['013']],
		'PHPStan\Parser\MagicConstantParamDefaultVisitor' => [['014']],
		'PHPStan\Parser\NewAssignedToPropertyVisitor' => [['015']],
		'PHPStan\Parser\ParentStmtTypesVisitor' => [['016']],
		'PHPStan\Parser\TryCatchTypeVisitor' => [['017']],
		'PHPStan\Parser\LastConditionVisitor' => [['018']],
		'PhpParser\NodeVisitor\NodeConnectingVisitor' => [['019']],
		'PHPStan\Node\Printer\ExprPrinter' => [['020']],
		'PhpParser\PrettyPrinter\Standard' => [['021']],
		'PhpParser\PrettyPrinterAbstract' => [['021']],
		'PHPStan\Node\Printer\Printer' => [['021']],
		'PHPStan\Broker\AnonymousClassNameHelper' => [['022']],
		'PHPStan\Php\PhpVersion' => [['023']],
		'PHPStan\Php\PhpVersionFactory' => [['024']],
		'PHPStan\Php\PhpVersionFactoryFactory' => [['025']],
		'PHPStan\PhpDocParser\Lexer\Lexer' => [['026']],
		'PHPStan\PhpDocParser\Parser\TypeParser' => [['027']],
		'PHPStan\PhpDocParser\Parser\ConstExprParser' => [['028']],
		'PHPStan\PhpDocParser\Parser\PhpDocParser' => [['029']],
		'PHPStan\PhpDoc\ConstExprParserFactory' => [['030']],
		'PHPStan\PhpDoc\PhpDocInheritanceResolver' => [['031']],
		'PHPStan\PhpDoc\PhpDocNodeResolver' => [['032']],
		'PHPStan\PhpDoc\PhpDocStringResolver' => [['033']],
		'PHPStan\PhpDoc\ConstExprNodeResolver' => [['034']],
		'PHPStan\PhpDoc\TypeNodeResolver' => [['035']],
		'PHPStan\PhpDoc\TypeNodeResolverExtensionRegistryProvider' => [['036']],
		'PHPStan\PhpDoc\TypeStringResolver' => [['037']],
		'PHPStan\PhpDoc\StubValidator' => [['038']],
		'PHPStan\PhpDoc\StubFilesExtension' => [['039', '040', '042', '043']],
		'PHPStan\PhpDoc\CountableStubFilesExtension' => [['039']],
		'PHPStan\PhpDoc\SocketSelectStubFilesExtension' => [['040']],
		'PHPStan\PhpDoc\StubFilesProvider' => [['041']],
		'PHPStan\PhpDoc\DefaultStubFilesProvider' => [['041']],
		'PHPStan\PhpDoc\JsonValidateStubFilesExtension' => [['042']],
		'PHPStan\PhpDoc\ReflectionEnumStubFilesExtension' => [['043']],
		'PHPStan\Analyser\Analyser' => [['044']],
		'PHPStan\Analyser\AnalyserResultFinalizer' => [['045']],
		'PHPStan\Analyser\FileAnalyser' => [['046']],
		'PHPStan\Analyser\LocalIgnoresProcessor' => [['047']],
		'PHPStan\Analyser\RuleErrorTransformer' => [['048']],
		'PHPStan\Analyser\Ignore\IgnoredErrorHelper' => [['049']],
		'PHPStan\Analyser\Ignore\IgnoreLexer' => [['050']],
		'PHPStan\Analyser\InternalScopeFactory' => [['051']],
		'PHPStan\Analyser\LazyInternalScopeFactory' => [['051']],
		'PHPStan\Analyser\ScopeFactory' => [['052']],
		'PHPStan\Analyser\NodeScopeResolver' => [['053']],
		'PHPStan\Analyser\ConstantResolver' => [['054']],
		'PHPStan\Analyser\ConstantResolverFactory' => [['055']],
		'PHPStan\Analyser\ResultCache\ResultCacheManagerFactory' => [['056']],
		'PHPStan\Analyser\ResultCache\ResultCacheClearer' => [['057']],
		'PHPStan\Cache\Cache' => [['058']],
		'PHPStan\Collectors\Registry' => [['059']],
		'PHPStan\Collectors\RegistryFactory' => [['060']],
		'PHPStan\Command\AnalyseApplication' => [['061']],
		'PHPStan\Command\AnalyserRunner' => [['062']],
		'PHPStan\Command\FixerApplication' => [['063']],
		'PHPStan\Dependency\DependencyResolver' => [['064']],
		'PHPStan\Dependency\ExportedNodeFetcher' => [['065']],
		'PHPStan\Dependency\ExportedNodeResolver' => [['066']],
		'PHPStan\Dependency\ExportedNodeVisitor' => [['067']],
		'PHPStan\DependencyInjection\Container' => [['068'], ['069']],
		'PHPStan\DependencyInjection\Nette\NetteContainer' => [['069']],
		'PHPStan\DependencyInjection\DerivativeContainerFactory' => [['070']],
		'PHPStan\DependencyInjection\Reflection\ClassReflectionExtensionRegistryProvider' => [['071']],
		'PHPStan\DependencyInjection\Type\DynamicReturnTypeExtensionRegistryProvider' => [['072']],
		'PHPStan\DependencyInjection\Type\ParameterOutTypeExtensionProvider' => [['073']],
		'PHPStan\DependencyInjection\Type\ExpressionTypeResolverExtensionRegistryProvider' => [['074']],
		'PHPStan\DependencyInjection\Type\OperatorTypeSpecifyingExtensionRegistryProvider' => [['075']],
		'PHPStan\DependencyInjection\Type\DynamicThrowTypeExtensionProvider' => [['076']],
		'PHPStan\DependencyInjection\Type\ParameterClosureTypeExtensionProvider' => [['077']],
		'PHPStan\File\FileHelper' => [['078']],
		'PHPStan\File\FileExcluderFactory' => [['079']],
		'PHPStan\File\FileExcluderRawFactory' => [['080']],
		'PHPStan\File\FileExcluder' => [2 => ['fileExcluderAnalyse', 'fileExcluderScan']],
		'PHPStan\File\FileFinder' => [2 => ['fileFinderAnalyse', 'fileFinderScan']],
		'PHPStan\File\FileMonitor' => [['081']],
		'PHPStan\Parser\DeclarePositionVisitor' => [['082']],
		'PHPStan\Parallel\ParallelAnalyser' => [['083']],
		'PHPStan\Diagnose\DiagnoseExtension' => [0 => ['084'], 2 => [1 => 'phpstanDiagnoseExtension']],
		'PHPStan\Parallel\Scheduler' => [['084']],
		'PHPStan\Parser\FunctionCallStatementFinder' => [['085']],
		'PHPStan\Process\CpuCoreCounter' => [['086']],
		'PHPStan\Reflection\FunctionReflectionFactory' => [['087']],
		'PHPStan\Reflection\InitializerExprTypeResolver' => [['088']],
		'PHPStan\Reflection\MethodsClassReflectionExtension' => [['089', '099', '0101', '0103', '0105']],
		'PHPStan\Reflection\Annotations\AnnotationsMethodsClassReflectionExtension' => [['089']],
		'PHPStan\Reflection\PropertiesClassReflectionExtension' => [['090', '0100', '0102', '0103', '0107', '0258']],
		'PHPStan\Reflection\Annotations\AnnotationsPropertiesClassReflectionExtension' => [['090']],
		'PHPStan\Reflection\BetterReflection\SourceLocator\CachingVisitor' => [['091']],
		'PHPStan\Reflection\BetterReflection\SourceLocator\FileNodesFetcher' => [['092']],
		'PHPStan\Reflection\BetterReflection\SourceLocator\ComposerJsonAndInstalledJsonSourceLocatorMaker' => [['093']],
		'PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedDirectorySourceLocatorFactory' => [['094']],
		'PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedDirectorySourceLocatorRepository' => [['095']],
		'PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedPsrAutoloaderLocatorFactory' => [['096']],
		'PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedSingleFileSourceLocatorFactory' => [['097']],
		'PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedSingleFileSourceLocatorRepository' => [['098']],
		'PHPStan\Reflection\RequireExtension\RequireExtendsMethodsClassReflectionExtension' => [['099']],
		'PHPStan\Reflection\RequireExtension\RequireExtendsPropertiesClassReflectionExtension' => [['0100']],
		'PHPStan\Reflection\Mixin\MixinMethodsClassReflectionExtension' => [['0101']],
		'PHPStan\Reflection\Mixin\MixinPropertiesClassReflectionExtension' => [['0102']],
		'PHPStan\Reflection\Php\PhpClassReflectionExtension' => [['0103']],
		'PHPStan\Reflection\Php\PhpMethodReflectionFactory' => [['0104']],
		'PHPStan\Reflection\Php\Soap\SoapClientMethodsClassReflectionExtension' => [['0105']],
		'PHPStan\Reflection\AllowedSubTypesClassReflectionExtension' => [['0106']],
		'PHPStan\Reflection\Php\EnumAllowedSubTypesClassReflectionExtension' => [['0106']],
		'PHPStan\Reflection\Php\UniversalObjectCratesClassReflectionExtension' => [['0107']],
		'PHPStan\Type\DynamicMethodReturnTypeExtension' => [
			[
				'0108',
				'0109',
				'0206',
				'0217',
				'0223',
				'0224',
				'0228',
				'0260',
				'0287',
				'0313',
				'0314',
				'0321',
				'0322',
				'0323',
				'0324',
				'0325',
				'0326',
			],
		],
		'PHPStan\Reflection\PHPStan\NativeReflectionEnumReturnDynamicReturnTypeExtension' => [['0108', '0109']],
		'PHPStan\Reflection\ReflectionProvider\ReflectionProviderProvider' => [['0110']],
		'PHPStan\Reflection\SignatureMap\NativeFunctionReflectionProvider' => [['0111']],
		'PHPStan\Reflection\SignatureMap\SignatureMapParser' => [['0112']],
		'PHPStan\Reflection\SignatureMap\SignatureMapProvider' => [['0116'], ['0113', '0114']],
		'PHPStan\Reflection\SignatureMap\FunctionSignatureMapProvider' => [['0113']],
		'PHPStan\Reflection\SignatureMap\Php8SignatureMapProvider' => [['0114']],
		'PHPStan\Reflection\SignatureMap\SignatureMapProviderFactory' => [['0115']],
		'PHPStan\Rules\Api\ApiRuleHelper' => [['0117']],
		'PHPStan\Rules\AttributesCheck' => [['0118']],
		'PHPStan\Rules\Arrays\NonexistentOffsetInArrayDimFetchCheck' => [['0119']],
		'PHPStan\Rules\ClassNameCheck' => [['0120']],
		'PHPStan\Rules\ClassCaseSensitivityCheck' => [['0121']],
		'PHPStan\Rules\ClassForbiddenNameCheck' => [['0122']],
		'PHPStan\Rules\Classes\LocalTypeAliasesCheck' => [['0123']],
		'PHPStan\Rules\Classes\MethodTagCheck' => [['0124']],
		'PHPStan\Rules\Classes\PropertyTagCheck' => [['0125']],
		'PHPStan\Rules\Comparison\ConstantConditionRuleHelper' => [['0126']],
		'PHPStan\Rules\Comparison\ImpossibleCheckTypeHelper' => [['0127']],
		'PHPStan\Rules\Exceptions\ExceptionTypeResolver' => [1 => ['0128'], [1 => 'exceptionTypeResolver']],
		'PHPStan\Rules\Exceptions\DefaultExceptionTypeResolver' => [['0128']],
		'PHPStan\Rules\Exceptions\MissingCheckedExceptionInFunctionThrowsRule' => [['0129']],
		'PHPStan\Rules\Exceptions\MissingCheckedExceptionInMethodThrowsRule' => [['0130']],
		'PHPStan\Rules\Exceptions\MissingCheckedExceptionInThrowsCheck' => [['0131']],
		'PHPStan\Rules\Exceptions\TooWideFunctionThrowTypeRule' => [['0132']],
		'PHPStan\Rules\Exceptions\TooWideMethodThrowTypeRule' => [['0133']],
		'PHPStan\Rules\Exceptions\TooWideThrowTypeCheck' => [['0134']],
		'PHPStan\Rules\FunctionCallParametersCheck' => [['0135']],
		'PHPStan\Rules\FunctionDefinitionCheck' => [['0136']],
		'PHPStan\Rules\FunctionReturnTypeCheck' => [['0137']],
		'PHPStan\Rules\ParameterCastableToStringCheck' => [['0138']],
		'PHPStan\Rules\Generics\CrossCheckInterfacesHelper' => [['0139']],
		'PHPStan\Rules\Generics\GenericAncestorsCheck' => [['0140']],
		'PHPStan\Rules\Generics\GenericObjectTypeCheck' => [['0141']],
		'PHPStan\Rules\Generics\TemplateTypeCheck' => [['0142']],
		'PHPStan\Rules\Generics\VarianceCheck' => [['0143']],
		'PHPStan\Rules\IssetCheck' => [['0144']],
		'PHPStan\Rules\Methods\MethodCallCheck' => [['0145']],
		'PHPStan\Rules\Methods\StaticMethodCallCheck' => [['0146']],
		'PHPStan\Rules\Methods\MethodSignatureRule' => [['0147']],
		'PHPStan\Rules\Methods\MethodParameterComparisonHelper' => [['0148']],
		'PHPStan\Rules\MissingTypehintCheck' => [['0149']],
		'PHPStan\Rules\NullsafeCheck' => [['0150']],
		'PHPStan\Rules\Constants\AlwaysUsedClassConstantsExtensionProvider' => [['0151']],
		'PHPStan\Rules\Constants\LazyAlwaysUsedClassConstantsExtensionProvider' => [['0151']],
		'PHPStan\Rules\Methods\AlwaysUsedMethodExtensionProvider' => [['0152']],
		'PHPStan\Rules\Methods\LazyAlwaysUsedMethodExtensionProvider' => [['0152']],
		'PHPStan\Rules\PhpDoc\ConditionalReturnTypeRuleHelper' => [['0153']],
		'PHPStan\Rules\PhpDoc\AssertRuleHelper' => [['0154']],
		'PHPStan\Rules\PhpDoc\UnresolvableTypeHelper' => [['0155']],
		'PHPStan\Rules\PhpDoc\GenericCallableRuleHelper' => [['0156']],
		'PHPStan\Rules\PhpDoc\VarTagTypeRuleHelper' => [['0157']],
		'PHPStan\Rules\Playground\NeverRuleHelper' => [['0158']],
		'PHPStan\Rules\Properties\ReadWritePropertiesExtensionProvider' => [['0159']],
		'PHPStan\Rules\Properties\LazyReadWritePropertiesExtensionProvider' => [['0159']],
		'PHPStan\Rules\Properties\PropertyDescriptor' => [['0160']],
		'PHPStan\Rules\Properties\PropertyReflectionFinder' => [['0161']],
		'PHPStan\Rules\Pure\FunctionPurityCheck' => [['0162']],
		'PHPStan\Rules\RuleLevelHelper' => [['0163']],
		'PHPStan\Rules\UnusedFunctionParametersCheck' => [['0164']],
		'PHPStan\Rules\TooWideTypehints\TooWideParameterOutTypeCheck' => [['0165']],
		'PHPStan\Type\FileTypeMapper' => [['0166']],
		'PHPStan\Type\TypeAliasResolver' => [['0167']],
		'PHPStan\Type\TypeAliasResolverProvider' => [['0168']],
		'PHPStan\Type\BitwiseFlagHelper' => [['0169']],
		'PHPStan\Type\DynamicFunctionReturnTypeExtension' => [
			[
				'0170',
				'0171',
				'0172',
				'0173',
				'0174',
				'0175',
				'0176',
				'0177',
				'0178',
				'0179',
				'0180',
				'0181',
				'0183',
				'0184',
				'0185',
				'0186',
				'0187',
				'0188',
				'0189',
				'0190',
				'0191',
				'0192',
				'0193',
				'0194',
				'0195',
				'0196',
				'0197',
				'0199',
				'0200',
				'0203',
				'0204',
				'0208',
				'0209',
				'0211',
				'0213',
				'0214',
				'0216',
				'0218',
				'0221',
				'0222',
				'0230',
				'0231',
				'0233',
				'0234',
				'0235',
				'0236',
				'0237',
				'0238',
				'0239',
				'0240',
				'0241',
				'0242',
				'0243',
				'0245',
				'0260',
				'0263',
				'0264',
				'0265',
				'0266',
				'0267',
				'0269',
				'0270',
				'0271',
				'0272',
				'0273',
				'0274',
				'0275',
				'0276',
				'0277',
				'0278',
				'0279',
				'0281',
				'0282',
				'0283',
				'0284',
				'0285',
				'0286',
				'0288',
				'0289',
				'0290',
				'0291',
				'0292',
				'0293',
				'0294',
				'0295',
				'0298',
				'0307',
				'0311',
				'0312',
				'0315',
				'0316',
				'0317',
				'0318',
				'0319',
				'0320',
			],
		],
		'PHPStan\Type\Php\AbsFunctionDynamicReturnTypeExtension' => [['0170']],
		'PHPStan\Type\Php\ArgumentBasedFunctionReturnTypeExtension' => [['0171']],
		'PHPStan\Type\Php\ArrayIntersectKeyFunctionReturnTypeExtension' => [['0172']],
		'PHPStan\Type\Php\ArrayChunkFunctionReturnTypeExtension' => [['0173']],
		'PHPStan\Type\Php\ArrayColumnFunctionReturnTypeExtension' => [['0174']],
		'PHPStan\Type\Php\ArrayCombineFunctionReturnTypeExtension' => [['0175']],
		'PHPStan\Type\Php\ArrayCurrentDynamicReturnTypeExtension' => [['0176']],
		'PHPStan\Type\Php\ArrayFillFunctionReturnTypeExtension' => [['0177']],
		'PHPStan\Type\Php\ArrayFillKeysFunctionReturnTypeExtension' => [['0178']],
		'PHPStan\Type\Php\ArrayFilterFunctionReturnTypeReturnTypeExtension' => [['0179']],
		'PHPStan\Type\Php\ArrayFlipFunctionReturnTypeExtension' => [['0180']],
		'PHPStan\Type\Php\ArrayKeyDynamicReturnTypeExtension' => [['0181']],
		'PHPStan\Type\FunctionTypeSpecifyingExtension' => [
			[
				'0182',
				'0198',
				'0212',
				'0247',
				'0257',
				'0261',
				'0262',
				'0280',
				'0296',
				'0297',
				'0299',
				'0300',
				'0301',
				'0302',
				'0303',
				'0304',
				'0305',
				'0306',
				'0308',
				'0310',
			],
		],
		'PHPStan\Analyser\TypeSpecifierAwareExtension' => [
			[
				'0182',
				'0198',
				'0212',
				'0247',
				'0257',
				'0261',
				'0262',
				'0268',
				'0280',
				'0296',
				'0297',
				'0299',
				'0300',
				'0301',
				'0302',
				'0303',
				'0304',
				'0305',
				'0306',
				'0308',
				'0310',
				'0312',
			],
		],
		'PHPStan\Type\Php\ArrayKeyExistsFunctionTypeSpecifyingExtension' => [['0182']],
		'PHPStan\Type\Php\ArrayKeyFirstDynamicReturnTypeExtension' => [['0183']],
		'PHPStan\Type\Php\ArrayKeyLastDynamicReturnTypeExtension' => [['0184']],
		'PHPStan\Type\Php\ArrayKeysFunctionDynamicReturnTypeExtension' => [['0185']],
		'PHPStan\Type\Php\ArrayMapFunctionReturnTypeExtension' => [['0186']],
		'PHPStan\Type\Php\ArrayMergeFunctionDynamicReturnTypeExtension' => [['0187']],
		'PHPStan\Type\Php\ArrayNextDynamicReturnTypeExtension' => [['0188']],
		'PHPStan\Type\Php\ArrayPopFunctionReturnTypeExtension' => [['0189']],
		'PHPStan\Type\Php\ArrayRandFunctionReturnTypeExtension' => [['0190']],
		'PHPStan\Type\Php\ArrayReduceFunctionReturnTypeExtension' => [['0191']],
		'PHPStan\Type\Php\ArrayReplaceFunctionReturnTypeExtension' => [['0192']],
		'PHPStan\Type\Php\ArrayReverseFunctionReturnTypeExtension' => [['0193']],
		'PHPStan\Type\Php\ArrayShiftFunctionReturnTypeExtension' => [['0194']],
		'PHPStan\Type\Php\ArraySliceFunctionReturnTypeExtension' => [['0195']],
		'PHPStan\Type\Php\ArraySpliceFunctionReturnTypeExtension' => [['0196']],
		'PHPStan\Type\Php\ArraySearchFunctionDynamicReturnTypeExtension' => [['0197']],
		'PHPStan\Type\Php\ArraySearchFunctionTypeSpecifyingExtension' => [['0198']],
		'PHPStan\Type\Php\ArrayValuesFunctionDynamicReturnTypeExtension' => [['0199']],
		'PHPStan\Type\Php\ArraySumFunctionDynamicReturnTypeExtension' => [['0200']],
		'PHPStan\Type\DynamicFunctionThrowTypeExtension' => [['0201', '0244', '0246']],
		'PHPStan\Type\Php\AssertThrowTypeExtension' => [['0201']],
		'PHPStan\Type\DynamicStaticMethodReturnTypeExtension' => [['0202', '0205', '0207', '0220', '0321', '0327']],
		'PHPStan\Type\Php\BackedEnumFromMethodDynamicReturnTypeExtension' => [['0202']],
		'PHPStan\Type\Php\Base64DecodeDynamicFunctionReturnTypeExtension' => [['0203']],
		'PHPStan\Type\Php\BcMathStringOrNullReturnTypeExtension' => [['0204']],
		'PHPStan\Type\Php\ClosureBindDynamicReturnTypeExtension' => [['0205']],
		'PHPStan\Type\Php\ClosureBindToDynamicReturnTypeExtension' => [['0206']],
		'PHPStan\Type\Php\ClosureFromCallableDynamicReturnTypeExtension' => [['0207']],
		'PHPStan\Type\Php\CompactFunctionReturnTypeExtension' => [['0208']],
		'PHPStan\Type\Php\ConstantFunctionReturnTypeExtension' => [['0209']],
		'PHPStan\Type\Php\ConstantHelper' => [['0210']],
		'PHPStan\Type\Php\CountFunctionReturnTypeExtension' => [['0211']],
		'PHPStan\Type\Php\CountFunctionTypeSpecifyingExtension' => [['0212']],
		'PHPStan\Type\Php\CurlGetinfoFunctionDynamicReturnTypeExtension' => [['0213']],
		'PHPStan\Type\Php\CurlInitReturnTypeExtension' => [['0214']],
		'PHPStan\Type\Php\DateFunctionReturnTypeHelper' => [['0215']],
		'PHPStan\Type\Php\DateFormatFunctionReturnTypeExtension' => [['0216']],
		'PHPStan\Type\Php\DateFormatMethodReturnTypeExtension' => [['0217']],
		'PHPStan\Type\Php\DateFunctionReturnTypeExtension' => [['0218']],
		'PHPStan\Type\DynamicStaticMethodThrowTypeExtension' => [
			['0219', '0225', '0227', '0253', '0254', '0255', '0256', '0259'],
		],
		'PHPStan\Type\Php\DateIntervalConstructorThrowTypeExtension' => [['0219']],
		'PHPStan\Type\Php\DateIntervalDynamicReturnTypeExtension' => [['0220']],
		'PHPStan\Type\Php\DateTimeCreateDynamicReturnTypeExtension' => [['0221']],
		'PHPStan\Type\Php\DateTimeDynamicReturnTypeExtension' => [['0222']],
		'PHPStan\Type\Php\DateTimeModifyReturnTypeExtension' => [['0223', '0224']],
		'PHPStan\Type\Php\DateTimeConstructorThrowTypeExtension' => [['0225']],
		'PHPStan\Type\DynamicMethodThrowTypeExtension' => [['0226', '0229']],
		'PHPStan\Type\Php\DateTimeModifyMethodThrowTypeExtension' => [['0226']],
		'PHPStan\Type\Php\DateTimeZoneConstructorThrowTypeExtension' => [['0227']],
		'PHPStan\Type\Php\DsMapDynamicReturnTypeExtension' => [['0228']],
		'PHPStan\Type\Php\DsMapDynamicMethodThrowTypeExtension' => [['0229']],
		'PHPStan\Type\Php\DioStatDynamicFunctionReturnTypeExtension' => [['0230']],
		'PHPStan\Type\Php\ExplodeFunctionDynamicReturnTypeExtension' => [['0231']],
		'PHPStan\Type\Php\FilterFunctionReturnTypeHelper' => [['0232']],
		'PHPStan\Type\Php\FilterInputDynamicReturnTypeExtension' => [['0233']],
		'PHPStan\Type\Php\FilterVarDynamicReturnTypeExtension' => [['0234']],
		'PHPStan\Type\Php\FilterVarArrayDynamicReturnTypeExtension' => [['0235']],
		'PHPStan\Type\Php\GetCalledClassDynamicReturnTypeExtension' => [['0236']],
		'PHPStan\Type\Php\GetClassDynamicReturnTypeExtension' => [['0237']],
		'PHPStan\Type\Php\GetDebugTypeFunctionReturnTypeExtension' => [['0238']],
		'PHPStan\Type\Php\GetParentClassDynamicFunctionReturnTypeExtension' => [['0239']],
		'PHPStan\Type\Php\GettypeFunctionReturnTypeExtension' => [['0240']],
		'PHPStan\Type\Php\GettimeofdayDynamicFunctionReturnTypeExtension' => [['0241']],
		'PHPStan\Type\Php\HashFunctionsReturnTypeExtension' => [['0242']],
		'PHPStan\Type\Php\HighlightStringDynamicReturnTypeExtension' => [['0243']],
		'PHPStan\Type\Php\IntdivThrowTypeExtension' => [['0244']],
		'PHPStan\Type\Php\IniGetReturnTypeExtension' => [['0245']],
		'PHPStan\Type\Php\JsonThrowTypeExtension' => [['0246']],
		'PHPStan\Type\Php\PregMatchTypeSpecifyingExtension' => [['0247']],
		'PHPStan\Type\FunctionParameterOutTypeExtension' => [['0248']],
		'PHPStan\Type\Php\PregMatchParameterOutTypeExtension' => [['0248']],
		'PHPStan\Type\FunctionParameterClosureTypeExtension' => [['0249']],
		'PHPStan\Type\Php\PregReplaceCallbackClosureTypeExtension' => [['0249']],
		'PHPStan\Type\Php\RegexArrayShapeMatcher' => [['0250']],
		'PHPStan\Type\Regex\RegexGroupParser' => [['0251']],
		'PHPStan\Type\Regex\RegexExpressionHelper' => [['0252']],
		'PHPStan\Type\Php\ReflectionClassConstructorThrowTypeExtension' => [['0253']],
		'PHPStan\Type\Php\ReflectionFunctionConstructorThrowTypeExtension' => [['0254']],
		'PHPStan\Type\Php\ReflectionMethodConstructorThrowTypeExtension' => [['0255']],
		'PHPStan\Type\Php\ReflectionPropertyConstructorThrowTypeExtension' => [['0256']],
		'PHPStan\Type\Php\StrContainingTypeSpecifyingExtension' => [['0257']],
		'PHPStan\Type\Php\SimpleXMLElementClassPropertyReflectionExtension' => [['0258']],
		'PHPStan\Type\Php\SimpleXMLElementConstructorThrowTypeExtension' => [['0259']],
		'PHPStan\Type\Php\StatDynamicReturnTypeExtension' => [['0260']],
		'PHPStan\Type\Php\MethodExistsTypeSpecifyingExtension' => [['0261']],
		'PHPStan\Type\Php\PropertyExistsTypeSpecifyingExtension' => [['0262']],
		'PHPStan\Type\Php\MinMaxFunctionReturnTypeExtension' => [['0263']],
		'PHPStan\Type\Php\NumberFormatFunctionDynamicReturnTypeExtension' => [['0264']],
		'PHPStan\Type\Php\PathinfoFunctionDynamicReturnTypeExtension' => [['0265']],
		'PHPStan\Type\Php\PregFilterFunctionReturnTypeExtension' => [['0266']],
		'PHPStan\Type\Php\PregSplitDynamicReturnTypeExtension' => [['0267']],
		'PHPStan\Type\MethodTypeSpecifyingExtension' => [['0268']],
		'PHPStan\Type\Php\ReflectionClassIsSubclassOfTypeSpecifyingExtension' => [['0268']],
		'PHPStan\Type\Php\ReplaceFunctionsDynamicReturnTypeExtension' => [['0269']],
		'PHPStan\Type\Php\ArrayPointerFunctionsDynamicReturnTypeExtension' => [['0270']],
		'PHPStan\Type\Php\LtrimFunctionReturnTypeExtension' => [['0271']],
		'PHPStan\Type\Php\MbFunctionsReturnTypeExtension' => [['0272']],
		'PHPStan\Type\Php\MbConvertEncodingFunctionReturnTypeExtension' => [['0273']],
		'PHPStan\Type\Php\MbSubstituteCharacterDynamicReturnTypeExtension' => [['0274']],
		'PHPStan\Type\Php\MbStrlenFunctionReturnTypeExtension' => [['0275']],
		'PHPStan\Type\Php\MicrotimeFunctionReturnTypeExtension' => [['0276']],
		'PHPStan\Type\Php\HrtimeFunctionReturnTypeExtension' => [['0277']],
		'PHPStan\Type\Php\ImplodeFunctionReturnTypeExtension' => [['0278']],
		'PHPStan\Type\Php\NonEmptyStringFunctionsReturnTypeExtension' => [['0279']],
		'PHPStan\Type\Php\SetTypeFunctionTypeSpecifyingExtension' => [['0280']],
		'PHPStan\Type\Php\StrCaseFunctionsReturnTypeExtension' => [['0281']],
		'PHPStan\Type\Php\StrlenFunctionReturnTypeExtension' => [['0282']],
		'PHPStan\Type\Php\StrIncrementDecrementFunctionReturnTypeExtension' => [['0283']],
		'PHPStan\Type\Php\StrPadFunctionReturnTypeExtension' => [['0284']],
		'PHPStan\Type\Php\StrRepeatFunctionReturnTypeExtension' => [['0285']],
		'PHPStan\Type\Php\SubstrDynamicReturnTypeExtension' => [['0286']],
		'PHPStan\Type\Php\ThrowableReturnTypeExtension' => [['0287']],
		'PHPStan\Type\Php\ParseUrlFunctionDynamicReturnTypeExtension' => [['0288']],
		'PHPStan\Type\Php\TriggerErrorDynamicReturnTypeExtension' => [['0289']],
		'PHPStan\Type\Php\VersionCompareFunctionDynamicReturnTypeExtension' => [['0290']],
		'PHPStan\Type\Php\PowFunctionReturnTypeExtension' => [['0291']],
		'PHPStan\Type\Php\RoundFunctionReturnTypeExtension' => [['0292']],
		'PHPStan\Type\Php\StrtotimeFunctionReturnTypeExtension' => [['0293']],
		'PHPStan\Type\Php\RandomIntFunctionReturnTypeExtension' => [['0294']],
		'PHPStan\Type\Php\RangeFunctionReturnTypeExtension' => [['0295']],
		'PHPStan\Type\Php\AssertFunctionTypeSpecifyingExtension' => [['0296']],
		'PHPStan\Type\Php\ClassExistsFunctionTypeSpecifyingExtension' => [['0297']],
		'PHPStan\Type\Php\ClassImplementsFunctionReturnTypeExtension' => [['0298']],
		'PHPStan\Type\Php\DefineConstantTypeSpecifyingExtension' => [['0299']],
		'PHPStan\Type\Php\DefinedConstantTypeSpecifyingExtension' => [['0300']],
		'PHPStan\Type\Php\FunctionExistsFunctionTypeSpecifyingExtension' => [['0301']],
		'PHPStan\Type\Php\InArrayFunctionTypeSpecifyingExtension' => [['0302']],
		'PHPStan\Type\Php\IsArrayFunctionTypeSpecifyingExtension' => [['0303']],
		'PHPStan\Type\Php\IsCallableFunctionTypeSpecifyingExtension' => [['0304']],
		'PHPStan\Type\Php\IsIterableFunctionTypeSpecifyingExtension' => [['0305']],
		'PHPStan\Type\Php\IsSubclassOfFunctionTypeSpecifyingExtension' => [['0306']],
		'PHPStan\Type\Php\IteratorToArrayFunctionReturnTypeExtension' => [['0307']],
		'PHPStan\Type\Php\IsAFunctionTypeSpecifyingExtension' => [['0308']],
		'PHPStan\Type\Php\IsAFunctionTypeSpecifyingHelper' => [['0309']],
		'PHPStan\Type\Php\CtypeDigitFunctionTypeSpecifyingExtension' => [['0310']],
		'PHPStan\Type\Php\JsonThrowOnErrorDynamicReturnTypeExtension' => [['0311']],
		'PHPStan\Type\Php\TypeSpecifyingFunctionsDynamicReturnTypeExtension' => [['0312']],
		'PHPStan\Type\Php\SimpleXMLElementAsXMLMethodReturnTypeExtension' => [['0313']],
		'PHPStan\Type\Php\SimpleXMLElementXpathMethodReturnTypeExtension' => [['0314']],
		'PHPStan\Type\Php\StrSplitFunctionReturnTypeExtension' => [['0315']],
		'PHPStan\Type\Php\StrTokFunctionReturnTypeExtension' => [['0316']],
		'PHPStan\Type\Php\SprintfFunctionDynamicReturnTypeExtension' => [['0317']],
		'PHPStan\Type\Php\SscanfFunctionDynamicReturnTypeExtension' => [['0318']],
		'PHPStan\Type\Php\StrvalFamilyFunctionReturnTypeExtension' => [['0319']],
		'PHPStan\Type\Php\StrWordCountFunctionDynamicReturnTypeExtension' => [['0320']],
		'PHPStan\Type\Php\XMLReaderOpenReturnTypeExtension' => [['0321']],
		'PHPStan\Type\Php\ReflectionGetAttributesMethodReturnTypeExtension' => [['0322', '0323', '0324', '0325', '0326']],
		'PHPStan\Type\Php\DatePeriodConstructorReturnTypeExtension' => [['0327']],
		'PHPStan\Type\ClosureTypeFactory' => [['0328']],
		'PHPStan\Type\Constant\OversizedArrayBuilder' => [['0329']],
		'PHPStan\Rules\Functions\PrintfHelper' => [['0330']],
		'PHPStan\Analyser\TypeSpecifier' => [['typeSpecifier']],
		'PHPStan\Analyser\TypeSpecifierFactory' => [['typeSpecifierFactory']],
		'PHPStan\File\RelativePathHelper' => [
			0 => ['relativePathHelper'],
			2 => [1 => 'simpleRelativePathHelper', 'parentDirectoryRelativePathHelper'],
		],
		'PHPStan\File\ParentDirectoryRelativePathHelper' => [2 => ['parentDirectoryRelativePathHelper']],
		'PHPStan\Reflection\ReflectionProvider' => [['reflectionProvider'], ['broker'], [2 => 'betterReflectionProvider']],
		'PHPStan\Broker\Broker' => [['broker']],
		'PHPStan\Broker\BrokerFactory' => [['brokerFactory']],
		'PHPStan\Cache\CacheStorage' => [2 => ['cacheStorage']],
		'PHPStan\Cache\FileCacheStorage' => [2 => ['cacheStorage']],
		'PHPStan\Parser\Parser' => [
			2 => [
				'currentPhpVersionRichParser',
				'currentPhpVersionSimpleParser',
				'currentPhpVersionSimpleDirectParser',
				'defaultAnalysisParser',
				'php8Parser',
				'pathRoutingParser',
			],
		],
		'PHPStan\Parser\RichParser' => [2 => ['currentPhpVersionRichParser']],
		'PHPStan\Parser\CleaningParser' => [2 => ['currentPhpVersionSimpleParser']],
		'PHPStan\Parser\SimpleParser' => [2 => ['currentPhpVersionSimpleDirectParser', 'php8Parser']],
		'PHPStan\Parser\CachedParser' => [2 => ['defaultAnalysisParser']],
		'PhpParser\Parser' => [2 => ['phpParserDecorator', 'currentPhpVersionPhpParser', 'php8PhpParser']],
		'PHPStan\Parser\PhpParserDecorator' => [2 => ['phpParserDecorator']],
		'PhpParser\Lexer' => [2 => ['currentPhpVersionLexer', 'php8Lexer']],
		'PhpParser\ParserAbstract' => [2 => ['currentPhpVersionPhpParser', 'php8PhpParser']],
		'PhpParser\Parser\Php7' => [2 => ['currentPhpVersionPhpParser', 'php8PhpParser']],
		'PHPStan\Rules\Registry' => [['registry']],
		'PHPStan\Rules\LazyRegistry' => [['registry']],
		'PHPStan\PhpDoc\StubPhpDocProvider' => [['stubPhpDocProvider']],
		'PHPStan\Reflection\ReflectionProvider\ReflectionProviderFactory' => [['reflectionProviderFactory']],
		'PHPStan\BetterReflection\SourceLocator\Type\SourceLocator' => [2 => ['betterReflectionSourceLocator']],
		'PHPStan\BetterReflection\Reflector\Reflector' => [
			0 => ['originalBetterReflectionReflector'],
			2 => [
				1 => 'betterReflectionReflector',
				'betterReflectionClassReflector',
				'betterReflectionFunctionReflector',
				'betterReflectionConstantReflector',
				'nodeScopeResolverReflector',
			],
		],
		'PHPStan\BetterReflection\Reflector\DefaultReflector' => [['originalBetterReflectionReflector']],
		'PHPStan\Reflection\BetterReflection\Reflector\MemoizingReflector' => [
			2 => ['betterReflectionReflector', 'nodeScopeResolverReflector'],
		],
		'PHPStan\BetterReflection\Reflector\ClassReflector' => [2 => ['betterReflectionClassReflector']],
		'PHPStan\BetterReflection\Reflector\FunctionReflector' => [2 => ['betterReflectionFunctionReflector']],
		'PHPStan\BetterReflection\Reflector\ConstantReflector' => [2 => ['betterReflectionConstantReflector']],
		'PHPStan\Reflection\BetterReflection\BetterReflectionProvider' => [2 => ['betterReflectionProvider']],
		'PHPStan\Reflection\BetterReflection\BetterReflectionSourceLocatorFactory' => [['0331']],
		'PHPStan\Reflection\BetterReflection\BetterReflectionProviderFactory' => [['0332']],
		'PHPStan\Reflection\BetterReflection\SourceStubber\PhpStormStubsSourceStubberFactory' => [['0333']],
		'PHPStan\BetterReflection\SourceLocator\SourceStubber\SourceStubber' => [1 => ['0334', '0335']],
		'PHPStan\BetterReflection\SourceLocator\SourceStubber\PhpStormStubsSourceStubber' => [['0334']],
		'PHPStan\BetterReflection\SourceLocator\SourceStubber\ReflectionSourceStubber' => [['0335']],
		'PHPStan\Reflection\BetterReflection\SourceStubber\ReflectionSourceStubberFactory' => [['0336']],
		'PhpParser\Lexer\Emulative' => [2 => ['php8Lexer']],
		'PHPStan\Parser\PathRoutingParser' => [2 => ['pathRoutingParser']],
		'PHPStan\Diagnose\PHPStanDiagnoseExtension' => [2 => ['phpstanDiagnoseExtension']],
		'PHPStan\Command\ErrorFormatter\ErrorFormatter' => [
			[
				'errorFormatter.raw',
				'errorFormatter.table',
				'errorFormatter.checkstyle',
				'errorFormatter.json',
				'errorFormatter.junit',
				'errorFormatter.prettyJson',
				'errorFormatter.gitlab',
				'errorFormatter.github',
				'errorFormatter.teamcity',
			],
			['0337'],
		],
		'PHPStan\Command\ErrorFormatter\CiDetectedErrorFormatter' => [['0337']],
		'PHPStan\Command\ErrorFormatter\RawErrorFormatter' => [['errorFormatter.raw']],
		'PHPStan\Command\ErrorFormatter\TableErrorFormatter' => [['errorFormatter.table']],
		'PHPStan\Command\ErrorFormatter\CheckstyleErrorFormatter' => [['errorFormatter.checkstyle']],
		'PHPStan\Command\ErrorFormatter\JsonErrorFormatter' => [['errorFormatter.json', 'errorFormatter.prettyJson']],
		'PHPStan\Command\ErrorFormatter\JunitErrorFormatter' => [['errorFormatter.junit']],
		'PHPStan\Command\ErrorFormatter\GitlabErrorFormatter' => [['errorFormatter.gitlab']],
		'PHPStan\Command\ErrorFormatter\GithubErrorFormatter' => [['errorFormatter.github']],
		'PHPStan\Command\ErrorFormatter\TeamcityErrorFormatter' => [['errorFormatter.teamcity']],
		'PHPStan\Rules\Api\ApiClassConstFetchRule' => [['0338']],
		'PHPStan\Rules\Api\ApiInstanceofRule' => [['0339']],
		'PHPStan\Rules\Api\ApiInstanceofTypeRule' => [['0340']],
		'PHPStan\Rules\Api\NodeConnectingVisitorAttributesRule' => [['0341']],
		'PHPStan\Rules\Api\RuntimeReflectionFunctionRule' => [['0342']],
		'PHPStan\Rules\Api\RuntimeReflectionInstantiationRule' => [['0343']],
		'PHPStan\Rules\Classes\ExistingClassInClassExtendsRule' => [['0344']],
		'PHPStan\Rules\Classes\ExistingClassInInstanceOfRule' => [['0345']],
		'PHPStan\Rules\Exceptions\CaughtExceptionExistenceRule' => [['0346']],
		'PHPStan\Rules\Functions\CallToNonExistentFunctionRule' => [['0347']],
		'PHPStan\Rules\Constants\OverridingConstantRule' => [['0348']],
		'PHPStan\Rules\Methods\OverridingMethodRule' => [['0349']],
		'PHPStan\Rules\Methods\ConsistentConstructorRule' => [['0350']],
		'PHPStan\Rules\Missing\MissingReturnRule' => [['0351']],
		'PHPStan\Rules\Namespaces\ExistingNamesInGroupUseRule' => [['0352']],
		'PHPStan\Rules\Namespaces\ExistingNamesInUseRule' => [['0353']],
		'PHPStan\Rules\Operators\InvalidIncDecOperationRule' => [['0354']],
		'PHPStan\Rules\Properties\AccessPropertiesRule' => [['0355']],
		'PHPStan\Rules\Properties\AccessStaticPropertiesRule' => [['0356']],
		'PHPStan\Rules\Properties\ExistingClassesInPropertiesRule' => [['0357']],
		'PHPStan\Rules\Functions\FunctionCallableRule' => [['0358']],
		'PHPStan\Rules\Properties\MissingReadOnlyByPhpDocPropertyAssignRule' => [['0359']],
		'PHPStan\Rules\Properties\OverridingPropertyRule' => [['0360']],
		'PHPStan\Rules\Properties\ReadOnlyByPhpDocPropertyRule' => [['0361']],
		'PHPStan\Rules\Properties\UninitializedPropertyRule' => [['0362']],
		'PHPStan\Rules\Properties\WritingToReadOnlyPropertiesRule' => [['0363']],
		'PHPStan\Rules\Properties\ReadingWriteOnlyPropertiesRule' => [['0364']],
		'PHPStan\Rules\Variables\CompactVariablesRule' => [['0365']],
		'PHPStan\Rules\Variables\DefinedVariableRule' => [['0366']],
		'PHPStan\Rules\Regexp\RegularExpressionPatternRule' => [['0367']],
		'PHPStan\Reflection\ConstructorsHelper' => [['0368']],
		'PHPStan\Rules\Methods\MissingMagicSerializationMethodsRule' => [['0369']],
		'PHPStan\Rules\Constants\MagicConstantContextRule' => [['0370']],
		'PHPStan\Rules\Functions\UselessFunctionReturnValueRule' => [['0371']],
		'PHPStan\Rules\Functions\PrintfArrayParametersRule' => [['0372']],
		'PHPStan\Rules\Regexp\RegularExpressionQuotingRule' => [['0373']],
		'PHPStan\Rules\Classes\MixinRule' => [['0374']],
		'PHPStan\Rules\Classes\MethodTagRule' => [['0375']],
		'PHPStan\Rules\Classes\MethodTagTraitRule' => [['0376']],
		'PHPStan\Rules\Classes\PropertyTagRule' => [['0377']],
		'PHPStan\Rules\Classes\PropertyTagTraitRule' => [['0378']],
		'PHPStan\Rules\PhpDoc\RequireExtendsCheck' => [['0379']],
		'PHPStan\Rules\PhpDoc\RequireImplementsDefinitionTraitRule' => [['0380']],
		'PHPStan\Rules\Functions\IncompatibleArrowFunctionDefaultParameterTypeRule' => [['0381']],
		'PHPStan\Rules\Functions\IncompatibleClosureDefaultParameterTypeRule' => [['0382']],
		'PHPStan\Rules\Functions\CallCallablesRule' => [['0383']],
		'PHPStan\Rules\Methods\IllegalConstructorMethodCallRule' => [['0384']],
		'PHPStan\Rules\Methods\IllegalConstructorStaticCallRule' => [['0385']],
		'PHPStan\Rules\PhpDoc\InvalidPhpDocTagValueRule' => [['0386']],
		'PHPStan\Rules\PhpDoc\InvalidPhpDocVarTagTypeRule' => [['0387']],
		'PHPStan\Rules\PhpDoc\InvalidPHPStanDocTagRule' => [['0388']],
		'PHPStan\Rules\PhpDoc\VarTagChangedExpressionTypeRule' => [['0389']],
		'PHPStan\Rules\PhpDoc\WrongVariableNameInVarTagRule' => [['0390']],
		'PHPStan\Rules\Generics\PropertyVarianceRule' => [['0391']],
		'PHPStan\Rules\Pure\PureFunctionRule' => [['0392']],
		'PHPStan\Rules\Pure\PureMethodRule' => [['0393']],
		'PHPStan\Rules\Operators\InvalidBinaryOperationRule' => [['0394']],
		'PHPStan\Rules\Operators\InvalidUnaryOperationRule' => [['0395']],
		'PHPStan\Rules\Arrays\InvalidKeyInArrayDimFetchRule' => [['0396']],
		'PHPStan\Rules\Arrays\InvalidKeyInArrayItemRule' => [['0397']],
		'PHPStan\Rules\Arrays\NonexistentOffsetInArrayDimFetchRule' => [['0398']],
		'PHPStan\Rules\Exceptions\ThrowsVoidFunctionWithExplicitThrowPointRule' => [['0399']],
		'PHPStan\Rules\Exceptions\ThrowsVoidMethodWithExplicitThrowPointRule' => [['0400']],
		'PHPStan\Rules\Generators\YieldFromTypeRule' => [['0401']],
		'PHPStan\Rules\Generators\YieldInGeneratorRule' => [['0402']],
		'PHPStan\Rules\Arrays\ArrayUnpackingRule' => [['0403']],
		'PHPStan\Rules\Properties\ReadOnlyByPhpDocPropertyAssignRefRule' => [['0404']],
		'PHPStan\Rules\Properties\ReadOnlyByPhpDocPropertyAssignRule' => [['0405']],
		'PHPStan\Rules\Variables\ParameterOutAssignedTypeRule' => [['0406']],
		'PHPStan\Rules\Variables\ParameterOutExecutionEndTypeRule' => [['0407']],
		'PHPStan\Rules\Classes\ImpossibleInstanceOfRule' => [['0408']],
		'PHPStan\Rules\Comparison\BooleanAndConstantConditionRule' => [['0409']],
		'PHPStan\Rules\Comparison\BooleanOrConstantConditionRule' => [['0410']],
		'PHPStan\Rules\Comparison\BooleanNotConstantConditionRule' => [['0411']],
		'PHPStan\Rules\DeadCode\NoopRule' => [['0412']],
		'PHPStan\Rules\DeadCode\CallToConstructorStatementWithoutImpurePointsRule' => [['0413']],
		'PHPStan\Collectors\Collector' => [['0414', '0415', '0417', '0418', '0420', '0421', '0423', '0445', '0446']],
		'PHPStan\Rules\DeadCode\ConstructorWithoutImpurePointsCollector' => [['0414']],
		'PHPStan\Rules\DeadCode\PossiblyPureNewCollector' => [['0415']],
		'PHPStan\Rules\DeadCode\CallToFunctionStatementWithoutImpurePointsRule' => [['0416']],
		'PHPStan\Rules\DeadCode\FunctionWithoutImpurePointsCollector' => [['0417']],
		'PHPStan\Rules\DeadCode\PossiblyPureFuncCallCollector' => [['0418']],
		'PHPStan\Rules\DeadCode\CallToMethodStatementWithoutImpurePointsRule' => [['0419']],
		'PHPStan\Rules\DeadCode\MethodWithoutImpurePointsCollector' => [['0420']],
		'PHPStan\Rules\DeadCode\PossiblyPureMethodCallCollector' => [['0421']],
		'PHPStan\Rules\DeadCode\CallToStaticMethodStatementWithoutImpurePointsRule' => [['0422']],
		'PHPStan\Rules\DeadCode\PossiblyPureStaticCallCollector' => [['0423']],
		'PHPStan\Rules\DeadCode\UnusedPrivatePropertyRule' => [['0424']],
		'PHPStan\Rules\Comparison\DoWhileLoopConstantConditionRule' => [['0425']],
		'PHPStan\Rules\Comparison\ElseIfConstantConditionRule' => [['0426']],
		'PHPStan\Rules\Comparison\IfConstantConditionRule' => [['0427']],
		'PHPStan\Rules\Comparison\ImpossibleCheckTypeFunctionCallRule' => [['0428']],
		'PHPStan\Rules\Comparison\ImpossibleCheckTypeMethodCallRule' => [['0429']],
		'PHPStan\Rules\Comparison\ImpossibleCheckTypeStaticMethodCallRule' => [['0430']],
		'PHPStan\Rules\Comparison\LogicalXorConstantConditionRule' => [['0431']],
		'PHPStan\Rules\DeadCode\BetterNoopRule' => [['0432']],
		'PHPStan\Rules\Comparison\MatchExpressionRule' => [['0433']],
		'PHPStan\Rules\Comparison\NumberComparisonOperatorsConstantConditionRule' => [['0434']],
		'PHPStan\Rules\Comparison\StrictComparisonOfDifferentTypesRule' => [['0435']],
		'PHPStan\Rules\Comparison\ConstantLooseComparisonRule' => [['0436']],
		'PHPStan\Rules\Comparison\TernaryOperatorConstantConditionRule' => [['0437']],
		'PHPStan\Rules\Comparison\UnreachableIfBranchesRule' => [['0438']],
		'PHPStan\Rules\Comparison\UnreachableTernaryElseBranchRule' => [['0439']],
		'PHPStan\Rules\Comparison\WhileLoopAlwaysFalseConditionRule' => [['0440']],
		'PHPStan\Rules\Comparison\WhileLoopAlwaysTrueConditionRule' => [['0441']],
		'PHPStan\Rules\Methods\CallToConstructorStatementWithoutSideEffectsRule' => [['0442']],
		'PHPStan\Rules\TooWideTypehints\TooWideMethodReturnTypehintRule' => [['0443']],
		'PHPStan\Rules\Properties\NullsafePropertyFetchRule' => [['0444']],
		'PHPStan\Rules\Traits\TraitDeclarationCollector' => [['0445']],
		'PHPStan\Rules\Traits\TraitUseCollector' => [['0446']],
		'PHPStan\Rules\Traits\NotAnalysedTraitRule' => [['0447']],
		'PHPStan\Rules\Exceptions\CatchWithUnthrownExceptionRule' => [['0448']],
		'PHPStan\Rules\TooWideTypehints\TooWideFunctionParameterOutTypeRule' => [['0449']],
		'PHPStan\Rules\TooWideTypehints\TooWideMethodParameterOutTypeRule' => [['0450']],
		'PHPStan\Rules\TooWideTypehints\TooWidePropertyTypeRule' => [['0451']],
		'PHPStan\Rules\Functions\RandomIntParametersRule' => [['0452']],
		'PHPStan\Rules\Functions\ArrayFilterRule' => [['0453']],
		'PHPStan\Rules\Functions\ArrayValuesRule' => [['0454']],
		'PHPStan\Rules\Functions\CallUserFuncRule' => [['0455']],
		'PHPStan\Rules\Functions\ImplodeFunctionRule' => [['0456']],
		'PHPStan\Rules\Functions\ParameterCastableToStringRule' => [['0457']],
		'PHPStan\Rules\Functions\ImplodeParameterCastableToStringRule' => [['0458']],
		'PHPStan\Rules\Functions\SortParameterCastableToStringRule' => [['0459']],
		'PHPStan\Rules\Functions\MissingFunctionParameterTypehintRule' => [['0460']],
		'PHPStan\Rules\Methods\MissingMethodParameterTypehintRule' => [['0461']],
		'PHPStan\Rules\Methods\MissingMethodSelfOutTypeRule' => [['0462']],
	];


	public function __construct(array $params = [])
	{
		parent::__construct($params);
	}


	public function createService01(): PhpParser\BuilderFactory
	{
		return new PhpParser\BuilderFactory;
	}


	public function createService02(): PHPStan\Parser\LexerFactory
	{
		return new PHPStan\Parser\LexerFactory($this->getService('023'));
	}


	public function createService03(): PhpParser\NodeVisitor\NameResolver
	{
		return new PhpParser\NodeVisitor\NameResolver(options: ['preserveOriginalNames' => true]);
	}


	public function createService04(): PHPStan\Parser\AnonymousClassVisitor
	{
		return new PHPStan\Parser\AnonymousClassVisitor;
	}


	public function createService05(): PHPStan\Parser\ArrayFilterArgVisitor
	{
		return new PHPStan\Parser\ArrayFilterArgVisitor;
	}


	public function createService06(): PHPStan\Parser\ArrayMapArgVisitor
	{
		return new PHPStan\Parser\ArrayMapArgVisitor;
	}


	public function createService07(): PHPStan\Parser\ArrayWalkArgVisitor
	{
		return new PHPStan\Parser\ArrayWalkArgVisitor;
	}


	public function createService08(): PHPStan\Parser\ClosureArgVisitor
	{
		return new PHPStan\Parser\ClosureArgVisitor;
	}


	public function createService09(): PHPStan\Parser\ClosureBindToVarVisitor
	{
		return new PHPStan\Parser\ClosureBindToVarVisitor;
	}


	public function createService010(): PHPStan\Parser\ClosureBindArgVisitor
	{
		return new PHPStan\Parser\ClosureBindArgVisitor;
	}


	public function createService011(): PHPStan\Parser\CurlSetOptArgVisitor
	{
		return new PHPStan\Parser\CurlSetOptArgVisitor;
	}


	public function createService012(): PHPStan\Parser\TypeTraverserInstanceofVisitor
	{
		return new PHPStan\Parser\TypeTraverserInstanceofVisitor;
	}


	public function createService013(): PHPStan\Parser\ArrowFunctionArgVisitor
	{
		return new PHPStan\Parser\ArrowFunctionArgVisitor;
	}


	public function createService014(): PHPStan\Parser\MagicConstantParamDefaultVisitor
	{
		return new PHPStan\Parser\MagicConstantParamDefaultVisitor;
	}


	public function createService015(): PHPStan\Parser\NewAssignedToPropertyVisitor
	{
		return new PHPStan\Parser\NewAssignedToPropertyVisitor;
	}


	public function createService016(): PHPStan\Parser\ParentStmtTypesVisitor
	{
		return new PHPStan\Parser\ParentStmtTypesVisitor;
	}


	public function createService017(): PHPStan\Parser\TryCatchTypeVisitor
	{
		return new PHPStan\Parser\TryCatchTypeVisitor;
	}


	public function createService018(): PHPStan\Parser\LastConditionVisitor
	{
		return new PHPStan\Parser\LastConditionVisitor;
	}


	public function createService019(): PhpParser\NodeVisitor\NodeConnectingVisitor
	{
		return new PhpParser\NodeVisitor\NodeConnectingVisitor;
	}


	public function createService020(): PHPStan\Node\Printer\ExprPrinter
	{
		return new PHPStan\Node\Printer\ExprPrinter($this->getService('021'));
	}


	public function createService021(): PHPStan\Node\Printer\Printer
	{
		return new PHPStan\Node\Printer\Printer;
	}


	public function createService022(): PHPStan\Broker\AnonymousClassNameHelper
	{
		return new PHPStan\Broker\AnonymousClassNameHelper($this->getService('078'), $this->getService('simpleRelativePathHelper'));
	}


	public function createService023(): PHPStan\Php\PhpVersion
	{
		return $this->getService('024')->create();
	}


	public function createService024(): PHPStan\Php\PhpVersionFactory
	{
		return $this->getService('025')->create();
	}


	public function createService025(): PHPStan\Php\PhpVersionFactoryFactory
	{
		return new PHPStan\Php\PhpVersionFactoryFactory(null, ['/home/sanderronde/git/phpstan-vscode/test/multi-config-demo']);
	}


	public function createService026(): PHPStan\PhpDocParser\Lexer\Lexer
	{
		return new PHPStan\PhpDocParser\Lexer\Lexer;
	}


	public function createService027(): PHPStan\PhpDocParser\Parser\TypeParser
	{
		return new PHPStan\PhpDocParser\Parser\TypeParser($this->getService('028'), false);
	}


	public function createService028(): PHPStan\PhpDocParser\Parser\ConstExprParser
	{
		return $this->getService('030')->create();
	}


	public function createService029(): PHPStan\PhpDocParser\Parser\PhpDocParser
	{
		return new PHPStan\PhpDocParser\Parser\PhpDocParser(
			$this->getService('027'),
			$this->getService('028'),
			false,
			true,
			['lines' => false]
		);
	}


	public function createService030(): PHPStan\PhpDoc\ConstExprParserFactory
	{
		return new PHPStan\PhpDoc\ConstExprParserFactory(false);
	}


	public function createService031(): PHPStan\PhpDoc\PhpDocInheritanceResolver
	{
		return new PHPStan\PhpDoc\PhpDocInheritanceResolver($this->getService('0166'), $this->getService('stubPhpDocProvider'));
	}


	public function createService032(): PHPStan\PhpDoc\PhpDocNodeResolver
	{
		return new PHPStan\PhpDoc\PhpDocNodeResolver($this->getService('035'), $this->getService('034'), $this->getService('0155'));
	}


	public function createService033(): PHPStan\PhpDoc\PhpDocStringResolver
	{
		return new PHPStan\PhpDoc\PhpDocStringResolver($this->getService('026'), $this->getService('029'));
	}


	public function createService034(): PHPStan\PhpDoc\ConstExprNodeResolver
	{
		return new PHPStan\PhpDoc\ConstExprNodeResolver($this->getService('0110'), $this->getService('088'));
	}


	public function createService035(): PHPStan\PhpDoc\TypeNodeResolver
	{
		return new PHPStan\PhpDoc\TypeNodeResolver(
			$this->getService('036'),
			$this->getService('0110'),
			$this->getService('0168'),
			$this->getService('054'),
			$this->getService('088')
		);
	}


	public function createService036(): PHPStan\PhpDoc\TypeNodeResolverExtensionRegistryProvider
	{
		return new PHPStan\PhpDoc\LazyTypeNodeResolverExtensionRegistryProvider($this->getService('068'));
	}


	public function createService037(): PHPStan\PhpDoc\TypeStringResolver
	{
		return new PHPStan\PhpDoc\TypeStringResolver($this->getService('026'), $this->getService('027'), $this->getService('035'));
	}


	public function createService038(): PHPStan\PhpDoc\StubValidator
	{
		return new PHPStan\PhpDoc\StubValidator($this->getService('070'), false);
	}


	public function createService039(): PHPStan\PhpDoc\CountableStubFilesExtension
	{
		return new PHPStan\PhpDoc\CountableStubFilesExtension(false);
	}


	public function createService040(): PHPStan\PhpDoc\SocketSelectStubFilesExtension
	{
		return new PHPStan\PhpDoc\SocketSelectStubFilesExtension($this->getService('023'));
	}


	public function createService041(): PHPStan\PhpDoc\DefaultStubFilesProvider
	{
		return new PHPStan\PhpDoc\DefaultStubFilesProvider(
			$this->getService('068'),
			[
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ReflectionAttribute.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ReflectionClass.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ReflectionClassConstant.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ReflectionFunctionAbstract.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ReflectionMethod.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ReflectionParameter.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ReflectionProperty.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/iterable.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ArrayObject.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/WeakReference.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ext-ds.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ImagickPixel.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/PDOStatement.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/date.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ibm_db2.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/mysqli.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/zip.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/dom.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/spl.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/SplObjectStorage.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/Exception.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/arrayFunctions.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/core.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/typeCheckingFunctions.stub',
			],
			['/home/sanderronde/git/phpstan-vscode/test/multi-config-demo']
		);
	}


	public function createService042(): PHPStan\PhpDoc\JsonValidateStubFilesExtension
	{
		return new PHPStan\PhpDoc\JsonValidateStubFilesExtension($this->getService('023'));
	}


	public function createService043(): PHPStan\PhpDoc\ReflectionEnumStubFilesExtension
	{
		return new PHPStan\PhpDoc\ReflectionEnumStubFilesExtension($this->getService('023'));
	}


	public function createService044(): PHPStan\Analyser\Analyser
	{
		return new PHPStan\Analyser\Analyser(
			$this->getService('046'),
			$this->getService('registry'),
			$this->getService('059'),
			$this->getService('053'),
			50
		);
	}


	public function createService045(): PHPStan\Analyser\AnalyserResultFinalizer
	{
		return new PHPStan\Analyser\AnalyserResultFinalizer(
			$this->getService('registry'),
			$this->getService('048'),
			$this->getService('052'),
			$this->getService('047'),
			true
		);
	}


	public function createService046(): PHPStan\Analyser\FileAnalyser
	{
		return new PHPStan\Analyser\FileAnalyser(
			$this->getService('052'),
			$this->getService('053'),
			$this->getService('defaultAnalysisParser'),
			$this->getService('064'),
			$this->getService('048'),
			$this->getService('047')
		);
	}


	public function createService047(): PHPStan\Analyser\LocalIgnoresProcessor
	{
		return new PHPStan\Analyser\LocalIgnoresProcessor;
	}


	public function createService048(): PHPStan\Analyser\RuleErrorTransformer
	{
		return new PHPStan\Analyser\RuleErrorTransformer;
	}


	public function createService049(): PHPStan\Analyser\Ignore\IgnoredErrorHelper
	{
		return new PHPStan\Analyser\Ignore\IgnoredErrorHelper($this->getService('078'), [], true);
	}


	public function createService050(): PHPStan\Analyser\Ignore\IgnoreLexer
	{
		return new PHPStan\Analyser\Ignore\IgnoreLexer;
	}


	public function createService051(): PHPStan\Analyser\LazyInternalScopeFactory
	{
		return new PHPStan\Analyser\LazyInternalScopeFactory('PHPStan\Analyser\MutatingScope', $this->getService('068'));
	}


	public function createService052(): PHPStan\Analyser\ScopeFactory
	{
		return new PHPStan\Analyser\ScopeFactory($this->getService('051'));
	}


	public function createService053(): PHPStan\Analyser\NodeScopeResolver
	{
		return new PHPStan\Analyser\NodeScopeResolver(
			$this->getService('reflectionProvider'),
			$this->getService('088'),
			$this->getService('nodeScopeResolverReflector'),
			$this->getService('071'),
			$this->getService('073'),
			$this->getService('defaultAnalysisParser'),
			$this->getService('0166'),
			$this->getService('stubPhpDocProvider'),
			$this->getService('023'),
			$this->getService('0116'),
			$this->getService('031'),
			$this->getService('078'),
			$this->getService('typeSpecifier'),
			$this->getService('076'),
			$this->getService('0159'),
			$this->getService('077'),
			$this->getService('052'),
			true,
			true,
			[],
			[],
			['stdClass'],
			true,
			true,
			false,
			false,
			false,
			false
		);
	}


	public function createService054(): PHPStan\Analyser\ConstantResolver
	{
		return $this->getService('055')->create();
	}


	public function createService055(): PHPStan\Analyser\ConstantResolverFactory
	{
		return new PHPStan\Analyser\ConstantResolverFactory($this->getService('0110'), $this->getService('068'));
	}


	public function createService056(): PHPStan\Analyser\ResultCache\ResultCacheManagerFactory
	{
		return new class ($this) implements PHPStan\Analyser\ResultCache\ResultCacheManagerFactory {
			private $container;


			public function __construct(Container_9bdc8b8877 $container)
			{
				$this->container = $container;
			}


			public function create(): PHPStan\Analyser\ResultCache\ResultCacheManager
			{
				return new PHPStan\Analyser\ResultCache\ResultCacheManager(
					$this->container->getService('065'),
					$this->container->getService('fileFinderScan'),
					$this->container->getService('reflectionProvider'),
					$this->container->getService('041'),
					$this->container->getService('078'),
					'/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/../cache/phpstan/resultCache.php',
					$this->container->getParameter('analysedPaths'),
					['/home/sanderronde/git/phpstan-vscode/test/multi-config-demo'],
					'9',
					null,
					[
						'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/runtime/ReflectionUnionType.php',
						'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/runtime/ReflectionAttribute.php',
						'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/runtime/Attribute.php',
						'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/runtime/ReflectionIntersectionType.php',
					],
					[],
					['/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/test/php'],
					false
				);
			}
		};
	}


	public function createService057(): PHPStan\Analyser\ResultCache\ResultCacheClearer
	{
		return new PHPStan\Analyser\ResultCache\ResultCacheClearer('/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/../cache/phpstan/resultCache.php');
	}


	public function createService058(): PHPStan\Cache\Cache
	{
		return new PHPStan\Cache\Cache($this->getService('cacheStorage'));
	}


	public function createService059(): PHPStan\Collectors\Registry
	{
		return $this->getService('060')->create();
	}


	public function createService060(): PHPStan\Collectors\RegistryFactory
	{
		return new PHPStan\Collectors\RegistryFactory($this->getService('068'));
	}


	public function createService061(): PHPStan\Command\AnalyseApplication
	{
		return new PHPStan\Command\AnalyseApplication(
			$this->getService('062'),
			$this->getService('045'),
			$this->getService('038'),
			$this->getService('056'),
			$this->getService('049'),
			$this->getService('041')
		);
	}


	public function createService062(): PHPStan\Command\AnalyserRunner
	{
		return new PHPStan\Command\AnalyserRunner(
			$this->getService('084'),
			$this->getService('044'),
			$this->getService('083'),
			$this->getService('086')
		);
	}


	public function createService063(): PHPStan\Command\FixerApplication
	{
		return new PHPStan\Command\FixerApplication(
			$this->getService('081'),
			$this->getService('049'),
			$this->getService('041'),
			$this->getParameter('analysedPaths'),
			'/home/sanderronde/git/phpstan-vscode/test/multi-config-demo',
			($this->getParameter('sysGetTempDir')) . '/phpstan-fixer',
			['1.1.1.2'],
			['/home/sanderronde/git/phpstan-vscode/test/multi-config-demo'],
			[
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/parametersSchema.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level9.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level8.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level7.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level6.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level5.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level4.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level3.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level2.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level1.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level0.neon',
				'/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/test/phpstan.neon',
			],
			null,
			[
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/runtime/ReflectionUnionType.php',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/runtime/ReflectionAttribute.php',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/runtime/Attribute.php',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/runtime/ReflectionIntersectionType.php',
			],
			null,
			'9'
		);
	}


	public function createService064(): PHPStan\Dependency\DependencyResolver
	{
		return new PHPStan\Dependency\DependencyResolver(
			$this->getService('078'),
			$this->getService('reflectionProvider'),
			$this->getService('066'),
			$this->getService('0166')
		);
	}


	public function createService065(): PHPStan\Dependency\ExportedNodeFetcher
	{
		return new PHPStan\Dependency\ExportedNodeFetcher($this->getService('defaultAnalysisParser'), $this->getService('067'));
	}


	public function createService066(): PHPStan\Dependency\ExportedNodeResolver
	{
		return new PHPStan\Dependency\ExportedNodeResolver($this->getService('0166'), $this->getService('020'));
	}


	public function createService067(): PHPStan\Dependency\ExportedNodeVisitor
	{
		return new PHPStan\Dependency\ExportedNodeVisitor($this->getService('066'));
	}


	public function createService068(): PHPStan\DependencyInjection\Container
	{
		return new PHPStan\DependencyInjection\MemoizingContainer($this->getService('069'));
	}


	public function createService069(): PHPStan\DependencyInjection\Nette\NetteContainer
	{
		return new PHPStan\DependencyInjection\Nette\NetteContainer($this);
	}


	public function createService070(): PHPStan\DependencyInjection\DerivativeContainerFactory
	{
		return new PHPStan\DependencyInjection\DerivativeContainerFactory(
			'/home/sanderronde/git/phpstan-vscode/test/multi-config-demo',
			'/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/../cache/phpstan',
			[
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level9.neon',
				'/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/test/phpstan.neon',
			],
			$this->getParameter('analysedPaths'),
			['/home/sanderronde/git/phpstan-vscode/test/multi-config-demo'],
			$this->getParameter('analysedPathsFromConfig'),
			'9',
			null,
			null
		);
	}


	public function createService071(): PHPStan\DependencyInjection\Reflection\ClassReflectionExtensionRegistryProvider
	{
		return new PHPStan\DependencyInjection\Reflection\LazyClassReflectionExtensionRegistryProvider($this->getService('068'));
	}


	public function createService072(): PHPStan\DependencyInjection\Type\DynamicReturnTypeExtensionRegistryProvider
	{
		return new PHPStan\DependencyInjection\Type\LazyDynamicReturnTypeExtensionRegistryProvider($this->getService('068'));
	}


	public function createService073(): PHPStan\DependencyInjection\Type\ParameterOutTypeExtensionProvider
	{
		return new PHPStan\DependencyInjection\Type\LazyParameterOutTypeExtensionProvider($this->getService('068'));
	}


	public function createService074(): PHPStan\DependencyInjection\Type\ExpressionTypeResolverExtensionRegistryProvider
	{
		return new PHPStan\DependencyInjection\Type\LazyExpressionTypeResolverExtensionRegistryProvider($this->getService('068'));
	}


	public function createService075(): PHPStan\DependencyInjection\Type\OperatorTypeSpecifyingExtensionRegistryProvider
	{
		return new PHPStan\DependencyInjection\Type\LazyOperatorTypeSpecifyingExtensionRegistryProvider($this->getService('068'));
	}


	public function createService076(): PHPStan\DependencyInjection\Type\DynamicThrowTypeExtensionProvider
	{
		return new PHPStan\DependencyInjection\Type\LazyDynamicThrowTypeExtensionProvider($this->getService('068'));
	}


	public function createService077(): PHPStan\DependencyInjection\Type\ParameterClosureTypeExtensionProvider
	{
		return new PHPStan\DependencyInjection\Type\LazyParameterClosureTypeExtensionProvider($this->getService('068'));
	}


	public function createService078(): PHPStan\File\FileHelper
	{
		return new PHPStan\File\FileHelper('/home/sanderronde/git/phpstan-vscode/test/multi-config-demo');
	}


	public function createService079(): PHPStan\File\FileExcluderFactory
	{
		return new PHPStan\File\FileExcluderFactory($this->getService('080'), [], null);
	}


	public function createService080(): PHPStan\File\FileExcluderRawFactory
	{
		return new class ($this) implements PHPStan\File\FileExcluderRawFactory {
			private $container;


			public function __construct(Container_9bdc8b8877 $container)
			{
				$this->container = $container;
			}


			public function create(array $analyseExcludes): PHPStan\File\FileExcluder
			{
				return new PHPStan\File\FileExcluder($this->container->getService('078'), $analyseExcludes, false);
			}
		};
	}


	public function createService081(): PHPStan\File\FileMonitor
	{
		return new PHPStan\File\FileMonitor($this->getService('fileFinderAnalyse'));
	}


	public function createService082(): PHPStan\Parser\DeclarePositionVisitor
	{
		return new PHPStan\Parser\DeclarePositionVisitor;
	}


	public function createService083(): PHPStan\Parallel\ParallelAnalyser
	{
		return new PHPStan\Parallel\ParallelAnalyser(50, 600.0, 134217728);
	}


	public function createService084(): PHPStan\Parallel\Scheduler
	{
		return new PHPStan\Parallel\Scheduler(20, 32, 2);
	}


	public function createService085(): PHPStan\Parser\FunctionCallStatementFinder
	{
		return new PHPStan\Parser\FunctionCallStatementFinder;
	}


	public function createService086(): PHPStan\Process\CpuCoreCounter
	{
		return new PHPStan\Process\CpuCoreCounter;
	}


	public function createService087(): PHPStan\Reflection\FunctionReflectionFactory
	{
		return new class ($this) implements PHPStan\Reflection\FunctionReflectionFactory {
			private $container;


			public function __construct(Container_9bdc8b8877 $container)
			{
				$this->container = $container;
			}


			public function create(
				PHPStan\BetterReflection\Reflection\Adapter\ReflectionFunction $reflection,
				PHPStan\Type\Generic\TemplateTypeMap $templateTypeMap,
				array $phpDocParameterTypes,
				?PHPStan\Type\Type $phpDocReturnType,
				?PHPStan\Type\Type $phpDocThrowType,
				?string $deprecatedDescription,
				bool $isDeprecated,
				bool $isInternal,
				bool $isFinal,
				?string $filename,
				?bool $isPure,
				PHPStan\Reflection\Assertions $asserts,
				bool $acceptsNamedArguments,
				?string $phpDocComment,
				array $phpDocParameterOutTypes,
				array $phpDocParameterImmediatelyInvokedCallable,
				array $phpDocParameterClosureThisTypes
			): PHPStan\Reflection\Php\PhpFunctionReflection {
				return new PHPStan\Reflection\Php\PhpFunctionReflection(
					$this->container->getService('088'),
					$reflection,
					$this->container->getService('defaultAnalysisParser'),
					$this->container->getService('085'),
					$this->container->getService('058'),
					$templateTypeMap,
					$phpDocParameterTypes,
					$phpDocReturnType,
					$phpDocThrowType,
					$deprecatedDescription,
					$isDeprecated,
					$isInternal,
					$isFinal,
					$filename,
					$isPure,
					$asserts,
					$acceptsNamedArguments,
					$phpDocComment,
					$phpDocParameterOutTypes,
					$phpDocParameterImmediatelyInvokedCallable,
					$phpDocParameterClosureThisTypes
				);
			}
		};
	}


	public function createService088(): PHPStan\Reflection\InitializerExprTypeResolver
	{
		return new PHPStan\Reflection\InitializerExprTypeResolver(
			$this->getService('054'),
			$this->getService('0110'),
			$this->getService('023'),
			$this->getService('075'),
			$this->getService('0329'),
			false
		);
	}


	public function createService089(): PHPStan\Reflection\Annotations\AnnotationsMethodsClassReflectionExtension
	{
		return new PHPStan\Reflection\Annotations\AnnotationsMethodsClassReflectionExtension;
	}


	public function createService090(): PHPStan\Reflection\Annotations\AnnotationsPropertiesClassReflectionExtension
	{
		return new PHPStan\Reflection\Annotations\AnnotationsPropertiesClassReflectionExtension;
	}


	public function createService091(): PHPStan\Reflection\BetterReflection\SourceLocator\CachingVisitor
	{
		return new PHPStan\Reflection\BetterReflection\SourceLocator\CachingVisitor;
	}


	public function createService092(): PHPStan\Reflection\BetterReflection\SourceLocator\FileNodesFetcher
	{
		return new PHPStan\Reflection\BetterReflection\SourceLocator\FileNodesFetcher(
			$this->getService('091'),
			$this->getService('defaultAnalysisParser')
		);
	}


	public function createService093(): PHPStan\Reflection\BetterReflection\SourceLocator\ComposerJsonAndInstalledJsonSourceLocatorMaker
	{
		return new PHPStan\Reflection\BetterReflection\SourceLocator\ComposerJsonAndInstalledJsonSourceLocatorMaker(
			$this->getService('095'),
			$this->getService('096'),
			$this->getService('094'),
			$this->getService('023')
		);
	}


	public function createService094(): PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedDirectorySourceLocatorFactory
	{
		return new PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedDirectorySourceLocatorFactory(
			$this->getService('092'),
			$this->getService('fileFinderScan'),
			$this->getService('023'),
			$this->getService('058')
		);
	}


	public function createService095(): PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedDirectorySourceLocatorRepository
	{
		return new PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedDirectorySourceLocatorRepository($this->getService('094'));
	}


	public function createService096(): PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedPsrAutoloaderLocatorFactory
	{
		return new class ($this) implements PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedPsrAutoloaderLocatorFactory {
			private $container;


			public function __construct(Container_9bdc8b8877 $container)
			{
				$this->container = $container;
			}


			public function create(PHPStan\BetterReflection\SourceLocator\Type\Composer\Psr\PsrAutoloaderMapping $mapping): PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedPsrAutoloaderLocator
			{
				return new PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedPsrAutoloaderLocator($mapping, $this->container->getService('098'));
			}
		};
	}


	public function createService097(): PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedSingleFileSourceLocatorFactory
	{
		return new class ($this) implements PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedSingleFileSourceLocatorFactory {
			private $container;


			public function __construct(Container_9bdc8b8877 $container)
			{
				$this->container = $container;
			}


			public function create(string $fileName): PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedSingleFileSourceLocator
			{
				return new PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedSingleFileSourceLocator(
					$this->container->getService('092'),
					$fileName
				);
			}
		};
	}


	public function createService098(): PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedSingleFileSourceLocatorRepository
	{
		return new PHPStan\Reflection\BetterReflection\SourceLocator\OptimizedSingleFileSourceLocatorRepository($this->getService('097'));
	}


	public function createService099(): PHPStan\Reflection\RequireExtension\RequireExtendsMethodsClassReflectionExtension
	{
		return new PHPStan\Reflection\RequireExtension\RequireExtendsMethodsClassReflectionExtension;
	}


	public function createService0100(): PHPStan\Reflection\RequireExtension\RequireExtendsPropertiesClassReflectionExtension
	{
		return new PHPStan\Reflection\RequireExtension\RequireExtendsPropertiesClassReflectionExtension;
	}


	public function createService0101(): PHPStan\Reflection\Mixin\MixinMethodsClassReflectionExtension
	{
		return new PHPStan\Reflection\Mixin\MixinMethodsClassReflectionExtension([]);
	}


	public function createService0102(): PHPStan\Reflection\Mixin\MixinPropertiesClassReflectionExtension
	{
		return new PHPStan\Reflection\Mixin\MixinPropertiesClassReflectionExtension([]);
	}


	public function createService0103(): PHPStan\Reflection\Php\PhpClassReflectionExtension
	{
		return new PHPStan\Reflection\Php\PhpClassReflectionExtension(
			$this->getService('052'),
			$this->getService('053'),
			$this->getService('0104'),
			$this->getService('031'),
			$this->getService('089'),
			$this->getService('090'),
			$this->getService('0116'),
			$this->getService('defaultAnalysisParser'),
			$this->getService('stubPhpDocProvider'),
			$this->getService('0110'),
			$this->getService('0166'),
			false
		);
	}


	public function createService0104(): PHPStan\Reflection\Php\PhpMethodReflectionFactory
	{
		return new class ($this) implements PHPStan\Reflection\Php\PhpMethodReflectionFactory {
			private $container;


			public function __construct(Container_9bdc8b8877 $container)
			{
				$this->container = $container;
			}


			public function create(
				PHPStan\Reflection\ClassReflection $declaringClass,
				?PHPStan\Reflection\ClassReflection $declaringTrait,
				PHPStan\Reflection\Php\BuiltinMethodReflection $reflection,
				PHPStan\Type\Generic\TemplateTypeMap $templateTypeMap,
				array $phpDocParameterTypes,
				?PHPStan\Type\Type $phpDocReturnType,
				?PHPStan\Type\Type $phpDocThrowType,
				?string $deprecatedDescription,
				bool $isDeprecated,
				bool $isInternal,
				bool $isFinal,
				?bool $isPure,
				PHPStan\Reflection\Assertions $asserts,
				?PHPStan\Type\Type $selfOutType,
				?string $phpDocComment,
				array $phpDocParameterOutTypes,
				array $immediatelyInvokedCallableParameters = [],
				array $phpDocClosureThisTypeParameters = [],
				bool $acceptsNamedArguments = true
			): PHPStan\Reflection\Php\PhpMethodReflection {
				return new PHPStan\Reflection\Php\PhpMethodReflection(
					$this->container->getService('088'),
					$declaringClass,
					$declaringTrait,
					$reflection,
					$this->container->getService('reflectionProvider'),
					$this->container->getService('defaultAnalysisParser'),
					$this->container->getService('085'),
					$this->container->getService('058'),
					$templateTypeMap,
					$phpDocParameterTypes,
					$phpDocReturnType,
					$phpDocThrowType,
					$deprecatedDescription,
					$isDeprecated,
					$isInternal,
					$isFinal,
					$isPure,
					$asserts,
					$acceptsNamedArguments,
					$selfOutType,
					$phpDocComment,
					$phpDocParameterOutTypes,
					$immediatelyInvokedCallableParameters,
					$phpDocClosureThisTypeParameters
				);
			}
		};
	}


	public function createService0105(): PHPStan\Reflection\Php\Soap\SoapClientMethodsClassReflectionExtension
	{
		return new PHPStan\Reflection\Php\Soap\SoapClientMethodsClassReflectionExtension;
	}


	public function createService0106(): PHPStan\Reflection\Php\EnumAllowedSubTypesClassReflectionExtension
	{
		return new PHPStan\Reflection\Php\EnumAllowedSubTypesClassReflectionExtension;
	}


	public function createService0107(): PHPStan\Reflection\Php\UniversalObjectCratesClassReflectionExtension
	{
		return new PHPStan\Reflection\Php\UniversalObjectCratesClassReflectionExtension(
			$this->getService('reflectionProvider'),
			['stdClass'],
			$this->getService('090')
		);
	}


	public function createService0108(): PHPStan\Reflection\PHPStan\NativeReflectionEnumReturnDynamicReturnTypeExtension
	{
		return new PHPStan\Reflection\PHPStan\NativeReflectionEnumReturnDynamicReturnTypeExtension(
			$this->getService('023'),
			'PHPStan\Reflection\ClassReflection',
			'getNativeReflection'
		);
	}


	public function createService0109(): PHPStan\Reflection\PHPStan\NativeReflectionEnumReturnDynamicReturnTypeExtension
	{
		return new PHPStan\Reflection\PHPStan\NativeReflectionEnumReturnDynamicReturnTypeExtension(
			$this->getService('023'),
			'PHPStan\Reflection\Php\BuiltinMethodReflection',
			'getDeclaringClass'
		);
	}


	public function createService0110(): PHPStan\Reflection\ReflectionProvider\ReflectionProviderProvider
	{
		return new PHPStan\Reflection\ReflectionProvider\LazyReflectionProviderProvider($this->getService('068'));
	}


	public function createService0111(): PHPStan\Reflection\SignatureMap\NativeFunctionReflectionProvider
	{
		return new PHPStan\Reflection\SignatureMap\NativeFunctionReflectionProvider(
			$this->getService('0116'),
			$this->getService('betterReflectionReflector'),
			$this->getService('0166'),
			$this->getService('stubPhpDocProvider')
		);
	}


	public function createService0112(): PHPStan\Reflection\SignatureMap\SignatureMapParser
	{
		return new PHPStan\Reflection\SignatureMap\SignatureMapParser($this->getService('037'));
	}


	public function createService0113(): PHPStan\Reflection\SignatureMap\FunctionSignatureMapProvider
	{
		return new PHPStan\Reflection\SignatureMap\FunctionSignatureMapProvider(
			$this->getService('0112'),
			$this->getService('088'),
			$this->getService('023'),
			false
		);
	}


	public function createService0114(): PHPStan\Reflection\SignatureMap\Php8SignatureMapProvider
	{
		return new PHPStan\Reflection\SignatureMap\Php8SignatureMapProvider(
			$this->getService('0113'),
			$this->getService('092'),
			$this->getService('0166'),
			$this->getService('023'),
			$this->getService('088')
		);
	}


	public function createService0115(): PHPStan\Reflection\SignatureMap\SignatureMapProviderFactory
	{
		return new PHPStan\Reflection\SignatureMap\SignatureMapProviderFactory(
			$this->getService('023'),
			$this->getService('0113'),
			$this->getService('0114')
		);
	}


	public function createService0116(): PHPStan\Reflection\SignatureMap\SignatureMapProvider
	{
		return $this->getService('0115')->create();
	}


	public function createService0117(): PHPStan\Rules\Api\ApiRuleHelper
	{
		return new PHPStan\Rules\Api\ApiRuleHelper;
	}


	public function createService0118(): PHPStan\Rules\AttributesCheck
	{
		return new PHPStan\Rules\AttributesCheck(
			$this->getService('reflectionProvider'),
			$this->getService('0135'),
			$this->getService('0120'),
			false
		);
	}


	public function createService0119(): PHPStan\Rules\Arrays\NonexistentOffsetInArrayDimFetchCheck
	{
		return new PHPStan\Rules\Arrays\NonexistentOffsetInArrayDimFetchCheck($this->getService('0163'), true, false, false, false);
	}


	public function createService0120(): PHPStan\Rules\ClassNameCheck
	{
		return new PHPStan\Rules\ClassNameCheck($this->getService('0121'), $this->getService('0122'));
	}


	public function createService0121(): PHPStan\Rules\ClassCaseSensitivityCheck
	{
		return new PHPStan\Rules\ClassCaseSensitivityCheck($this->getService('reflectionProvider'), false);
	}


	public function createService0122(): PHPStan\Rules\ClassForbiddenNameCheck
	{
		return new PHPStan\Rules\ClassForbiddenNameCheck($this->getService('068'));
	}


	public function createService0123(): PHPStan\Rules\Classes\LocalTypeAliasesCheck
	{
		return new PHPStan\Rules\Classes\LocalTypeAliasesCheck(
			[],
			$this->getService('reflectionProvider'),
			$this->getService('035'),
			$this->getService('0149'),
			$this->getService('0120'),
			$this->getService('0155'),
			$this->getService('0141'),
			true,
			true,
			false
		);
	}


	public function createService0124(): PHPStan\Rules\Classes\MethodTagCheck
	{
		return new PHPStan\Rules\Classes\MethodTagCheck(
			$this->getService('reflectionProvider'),
			$this->getService('0120'),
			$this->getService('0141'),
			$this->getService('0149'),
			$this->getService('0155'),
			true
		);
	}


	public function createService0125(): PHPStan\Rules\Classes\PropertyTagCheck
	{
		return new PHPStan\Rules\Classes\PropertyTagCheck(
			$this->getService('reflectionProvider'),
			$this->getService('0120'),
			$this->getService('0141'),
			$this->getService('0149'),
			$this->getService('0155'),
			true
		);
	}


	public function createService0126(): PHPStan\Rules\Comparison\ConstantConditionRuleHelper
	{
		return new PHPStan\Rules\Comparison\ConstantConditionRuleHelper($this->getService('0127'), true, false);
	}


	public function createService0127(): PHPStan\Rules\Comparison\ImpossibleCheckTypeHelper
	{
		return new PHPStan\Rules\Comparison\ImpossibleCheckTypeHelper(
			$this->getService('reflectionProvider'),
			$this->getService('typeSpecifier'),
			['stdClass'],
			true,
			false
		);
	}


	public function createService0128(): PHPStan\Rules\Exceptions\DefaultExceptionTypeResolver
	{
		return new PHPStan\Rules\Exceptions\DefaultExceptionTypeResolver($this->getService('reflectionProvider'), [], [], [], []);
	}


	public function createService0129(): PHPStan\Rules\Exceptions\MissingCheckedExceptionInFunctionThrowsRule
	{
		return new PHPStan\Rules\Exceptions\MissingCheckedExceptionInFunctionThrowsRule($this->getService('0131'));
	}


	public function createService0130(): PHPStan\Rules\Exceptions\MissingCheckedExceptionInMethodThrowsRule
	{
		return new PHPStan\Rules\Exceptions\MissingCheckedExceptionInMethodThrowsRule($this->getService('0131'));
	}


	public function createService0131(): PHPStan\Rules\Exceptions\MissingCheckedExceptionInThrowsCheck
	{
		return new PHPStan\Rules\Exceptions\MissingCheckedExceptionInThrowsCheck($this->getService('exceptionTypeResolver'));
	}


	public function createService0132(): PHPStan\Rules\Exceptions\TooWideFunctionThrowTypeRule
	{
		return new PHPStan\Rules\Exceptions\TooWideFunctionThrowTypeRule($this->getService('0134'));
	}


	public function createService0133(): PHPStan\Rules\Exceptions\TooWideMethodThrowTypeRule
	{
		return new PHPStan\Rules\Exceptions\TooWideMethodThrowTypeRule($this->getService('0166'), $this->getService('0134'));
	}


	public function createService0134(): PHPStan\Rules\Exceptions\TooWideThrowTypeCheck
	{
		return new PHPStan\Rules\Exceptions\TooWideThrowTypeCheck;
	}


	public function createService0135(): PHPStan\Rules\FunctionCallParametersCheck
	{
		return new PHPStan\Rules\FunctionCallParametersCheck(
			$this->getService('0163'),
			$this->getService('0150'),
			$this->getService('023'),
			$this->getService('0155'),
			$this->getService('0161'),
			true,
			true,
			true,
			true,
			false
		);
	}


	public function createService0136(): PHPStan\Rules\FunctionDefinitionCheck
	{
		return new PHPStan\Rules\FunctionDefinitionCheck(
			$this->getService('reflectionProvider'),
			$this->getService('0120'),
			$this->getService('0155'),
			$this->getService('023'),
			true,
			false,
			false
		);
	}


	public function createService0137(): PHPStan\Rules\FunctionReturnTypeCheck
	{
		return new PHPStan\Rules\FunctionReturnTypeCheck($this->getService('0163'));
	}


	public function createService0138(): PHPStan\Rules\ParameterCastableToStringCheck
	{
		return new PHPStan\Rules\ParameterCastableToStringCheck($this->getService('0163'));
	}


	public function createService0139(): PHPStan\Rules\Generics\CrossCheckInterfacesHelper
	{
		return new PHPStan\Rules\Generics\CrossCheckInterfacesHelper;
	}


	public function createService0140(): PHPStan\Rules\Generics\GenericAncestorsCheck
	{
		return new PHPStan\Rules\Generics\GenericAncestorsCheck(
			$this->getService('reflectionProvider'),
			$this->getService('0141'),
			$this->getService('0143'),
			$this->getService('0155'),
			true,
			[
				'DatePeriod',
				'CallbackFilterIterator',
				'FilterIterator',
				'RecursiveCallbackFilterIterator',
				'AppendIterator',
				'NoRewindIterator',
				'LimitIterator',
				'InfiniteIterator',
				'CachingIterator',
				'RegexIterator',
				'ReflectionEnum',
			],
			false
		);
	}


	public function createService0141(): PHPStan\Rules\Generics\GenericObjectTypeCheck
	{
		return new PHPStan\Rules\Generics\GenericObjectTypeCheck;
	}


	public function createService0142(): PHPStan\Rules\Generics\TemplateTypeCheck
	{
		return new PHPStan\Rules\Generics\TemplateTypeCheck(
			$this->getService('reflectionProvider'),
			$this->getService('0120'),
			$this->getService('0141'),
			$this->getService('0167'),
			true
		);
	}


	public function createService0143(): PHPStan\Rules\Generics\VarianceCheck
	{
		return new PHPStan\Rules\Generics\VarianceCheck(false, false);
	}


	public function createService0144(): PHPStan\Rules\IssetCheck
	{
		return new PHPStan\Rules\IssetCheck($this->getService('0160'), $this->getService('0161'), true, true, false);
	}


	public function createService0145(): PHPStan\Rules\Methods\MethodCallCheck
	{
		return new PHPStan\Rules\Methods\MethodCallCheck(
			$this->getService('reflectionProvider'),
			$this->getService('0163'),
			false,
			true
		);
	}


	public function createService0146(): PHPStan\Rules\Methods\StaticMethodCallCheck
	{
		return new PHPStan\Rules\Methods\StaticMethodCallCheck(
			$this->getService('reflectionProvider'),
			$this->getService('0163'),
			$this->getService('0120'),
			false,
			true
		);
	}


	public function createService0147(): PHPStan\Rules\Methods\MethodSignatureRule
	{
		return new PHPStan\Rules\Methods\MethodSignatureRule($this->getService('0103'), false, false, false);
	}


	public function createService0148(): PHPStan\Rules\Methods\MethodParameterComparisonHelper
	{
		return new PHPStan\Rules\Methods\MethodParameterComparisonHelper($this->getService('023'), false);
	}


	public function createService0149(): PHPStan\Rules\MissingTypehintCheck
	{
		return new PHPStan\Rules\MissingTypehintCheck(
			false,
			true,
			true,
			false,
			[
				'DatePeriod',
				'CallbackFilterIterator',
				'FilterIterator',
				'RecursiveCallbackFilterIterator',
				'AppendIterator',
				'NoRewindIterator',
				'LimitIterator',
				'InfiniteIterator',
				'CachingIterator',
				'RegexIterator',
				'ReflectionEnum',
			]
		);
	}


	public function createService0150(): PHPStan\Rules\NullsafeCheck
	{
		return new PHPStan\Rules\NullsafeCheck;
	}


	public function createService0151(): PHPStan\Rules\Constants\LazyAlwaysUsedClassConstantsExtensionProvider
	{
		return new PHPStan\Rules\Constants\LazyAlwaysUsedClassConstantsExtensionProvider($this->getService('068'));
	}


	public function createService0152(): PHPStan\Rules\Methods\LazyAlwaysUsedMethodExtensionProvider
	{
		return new PHPStan\Rules\Methods\LazyAlwaysUsedMethodExtensionProvider($this->getService('068'));
	}


	public function createService0153(): PHPStan\Rules\PhpDoc\ConditionalReturnTypeRuleHelper
	{
		return new PHPStan\Rules\PhpDoc\ConditionalReturnTypeRuleHelper;
	}


	public function createService0154(): PHPStan\Rules\PhpDoc\AssertRuleHelper
	{
		return new PHPStan\Rules\PhpDoc\AssertRuleHelper($this->getService('088'));
	}


	public function createService0155(): PHPStan\Rules\PhpDoc\UnresolvableTypeHelper
	{
		return new PHPStan\Rules\PhpDoc\UnresolvableTypeHelper;
	}


	public function createService0156(): PHPStan\Rules\PhpDoc\GenericCallableRuleHelper
	{
		return new PHPStan\Rules\PhpDoc\GenericCallableRuleHelper($this->getService('0142'));
	}


	public function createService0157(): PHPStan\Rules\PhpDoc\VarTagTypeRuleHelper
	{
		return new PHPStan\Rules\PhpDoc\VarTagTypeRuleHelper(false, false);
	}


	public function createService0158(): PHPStan\Rules\Playground\NeverRuleHelper
	{
		return new PHPStan\Rules\Playground\NeverRuleHelper;
	}


	public function createService0159(): PHPStan\Rules\Properties\LazyReadWritePropertiesExtensionProvider
	{
		return new PHPStan\Rules\Properties\LazyReadWritePropertiesExtensionProvider($this->getService('068'));
	}


	public function createService0160(): PHPStan\Rules\Properties\PropertyDescriptor
	{
		return new PHPStan\Rules\Properties\PropertyDescriptor;
	}


	public function createService0161(): PHPStan\Rules\Properties\PropertyReflectionFinder
	{
		return new PHPStan\Rules\Properties\PropertyReflectionFinder;
	}


	public function createService0162(): PHPStan\Rules\Pure\FunctionPurityCheck
	{
		return new PHPStan\Rules\Pure\FunctionPurityCheck;
	}


	public function createService0163(): PHPStan\Rules\RuleLevelHelper
	{
		return new PHPStan\Rules\RuleLevelHelper($this->getService('reflectionProvider'), true, false, true, true, false, false, false);
	}


	public function createService0164(): PHPStan\Rules\UnusedFunctionParametersCheck
	{
		return new PHPStan\Rules\UnusedFunctionParametersCheck($this->getService('reflectionProvider'));
	}


	public function createService0165(): PHPStan\Rules\TooWideTypehints\TooWideParameterOutTypeCheck
	{
		return new PHPStan\Rules\TooWideTypehints\TooWideParameterOutTypeCheck;
	}


	public function createService0166(): PHPStan\Type\FileTypeMapper
	{
		return new PHPStan\Type\FileTypeMapper(
			$this->getService('0110'),
			$this->getService('defaultAnalysisParser'),
			$this->getService('033'),
			$this->getService('032'),
			$this->getService('022'),
			$this->getService('078')
		);
	}


	public function createService0167(): PHPStan\Type\TypeAliasResolver
	{
		return new PHPStan\Type\UsefulTypeAliasResolver(
			[],
			$this->getService('037'),
			$this->getService('035'),
			$this->getService('reflectionProvider')
		);
	}


	public function createService0168(): PHPStan\Type\TypeAliasResolverProvider
	{
		return new PHPStan\Type\LazyTypeAliasResolverProvider($this->getService('068'));
	}


	public function createService0169(): PHPStan\Type\BitwiseFlagHelper
	{
		return new PHPStan\Type\BitwiseFlagHelper($this->getService('reflectionProvider'));
	}


	public function createService0170(): PHPStan\Type\Php\AbsFunctionDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\AbsFunctionDynamicReturnTypeExtension;
	}


	public function createService0171(): PHPStan\Type\Php\ArgumentBasedFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArgumentBasedFunctionReturnTypeExtension;
	}


	public function createService0172(): PHPStan\Type\Php\ArrayIntersectKeyFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayIntersectKeyFunctionReturnTypeExtension($this->getService('023'));
	}


	public function createService0173(): PHPStan\Type\Php\ArrayChunkFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayChunkFunctionReturnTypeExtension($this->getService('023'));
	}


	public function createService0174(): PHPStan\Type\Php\ArrayColumnFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayColumnFunctionReturnTypeExtension($this->getService('023'));
	}


	public function createService0175(): PHPStan\Type\Php\ArrayCombineFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayCombineFunctionReturnTypeExtension($this->getService('023'));
	}


	public function createService0176(): PHPStan\Type\Php\ArrayCurrentDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayCurrentDynamicReturnTypeExtension;
	}


	public function createService0177(): PHPStan\Type\Php\ArrayFillFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayFillFunctionReturnTypeExtension($this->getService('023'));
	}


	public function createService0178(): PHPStan\Type\Php\ArrayFillKeysFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayFillKeysFunctionReturnTypeExtension($this->getService('023'));
	}


	public function createService0179(): PHPStan\Type\Php\ArrayFilterFunctionReturnTypeReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayFilterFunctionReturnTypeReturnTypeExtension;
	}


	public function createService0180(): PHPStan\Type\Php\ArrayFlipFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayFlipFunctionReturnTypeExtension($this->getService('023'));
	}


	public function createService0181(): PHPStan\Type\Php\ArrayKeyDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayKeyDynamicReturnTypeExtension;
	}


	public function createService0182(): PHPStan\Type\Php\ArrayKeyExistsFunctionTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\ArrayKeyExistsFunctionTypeSpecifyingExtension;
	}


	public function createService0183(): PHPStan\Type\Php\ArrayKeyFirstDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayKeyFirstDynamicReturnTypeExtension;
	}


	public function createService0184(): PHPStan\Type\Php\ArrayKeyLastDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayKeyLastDynamicReturnTypeExtension;
	}


	public function createService0185(): PHPStan\Type\Php\ArrayKeysFunctionDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayKeysFunctionDynamicReturnTypeExtension($this->getService('023'));
	}


	public function createService0186(): PHPStan\Type\Php\ArrayMapFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayMapFunctionReturnTypeExtension;
	}


	public function createService0187(): PHPStan\Type\Php\ArrayMergeFunctionDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayMergeFunctionDynamicReturnTypeExtension;
	}


	public function createService0188(): PHPStan\Type\Php\ArrayNextDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayNextDynamicReturnTypeExtension;
	}


	public function createService0189(): PHPStan\Type\Php\ArrayPopFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayPopFunctionReturnTypeExtension;
	}


	public function createService0190(): PHPStan\Type\Php\ArrayRandFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayRandFunctionReturnTypeExtension;
	}


	public function createService0191(): PHPStan\Type\Php\ArrayReduceFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayReduceFunctionReturnTypeExtension;
	}


	public function createService0192(): PHPStan\Type\Php\ArrayReplaceFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayReplaceFunctionReturnTypeExtension;
	}


	public function createService0193(): PHPStan\Type\Php\ArrayReverseFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayReverseFunctionReturnTypeExtension;
	}


	public function createService0194(): PHPStan\Type\Php\ArrayShiftFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayShiftFunctionReturnTypeExtension;
	}


	public function createService0195(): PHPStan\Type\Php\ArraySliceFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArraySliceFunctionReturnTypeExtension;
	}


	public function createService0196(): PHPStan\Type\Php\ArraySpliceFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArraySpliceFunctionReturnTypeExtension;
	}


	public function createService0197(): PHPStan\Type\Php\ArraySearchFunctionDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArraySearchFunctionDynamicReturnTypeExtension($this->getService('023'));
	}


	public function createService0198(): PHPStan\Type\Php\ArraySearchFunctionTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\ArraySearchFunctionTypeSpecifyingExtension;
	}


	public function createService0199(): PHPStan\Type\Php\ArrayValuesFunctionDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayValuesFunctionDynamicReturnTypeExtension($this->getService('023'));
	}


	public function createService0200(): PHPStan\Type\Php\ArraySumFunctionDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArraySumFunctionDynamicReturnTypeExtension;
	}


	public function createService0201(): PHPStan\Type\Php\AssertThrowTypeExtension
	{
		return new PHPStan\Type\Php\AssertThrowTypeExtension;
	}


	public function createService0202(): PHPStan\Type\Php\BackedEnumFromMethodDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\BackedEnumFromMethodDynamicReturnTypeExtension;
	}


	public function createService0203(): PHPStan\Type\Php\Base64DecodeDynamicFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\Base64DecodeDynamicFunctionReturnTypeExtension;
	}


	public function createService0204(): PHPStan\Type\Php\BcMathStringOrNullReturnTypeExtension
	{
		return new PHPStan\Type\Php\BcMathStringOrNullReturnTypeExtension($this->getService('023'));
	}


	public function createService0205(): PHPStan\Type\Php\ClosureBindDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\ClosureBindDynamicReturnTypeExtension;
	}


	public function createService0206(): PHPStan\Type\Php\ClosureBindToDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\ClosureBindToDynamicReturnTypeExtension;
	}


	public function createService0207(): PHPStan\Type\Php\ClosureFromCallableDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\ClosureFromCallableDynamicReturnTypeExtension;
	}


	public function createService0208(): PHPStan\Type\Php\CompactFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\CompactFunctionReturnTypeExtension(true);
	}


	public function createService0209(): PHPStan\Type\Php\ConstantFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ConstantFunctionReturnTypeExtension($this->getService('0210'));
	}


	public function createService0210(): PHPStan\Type\Php\ConstantHelper
	{
		return new PHPStan\Type\Php\ConstantHelper;
	}


	public function createService0211(): PHPStan\Type\Php\CountFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\CountFunctionReturnTypeExtension;
	}


	public function createService0212(): PHPStan\Type\Php\CountFunctionTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\CountFunctionTypeSpecifyingExtension;
	}


	public function createService0213(): PHPStan\Type\Php\CurlGetinfoFunctionDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\CurlGetinfoFunctionDynamicReturnTypeExtension($this->getService('reflectionProvider'));
	}


	public function createService0214(): PHPStan\Type\Php\CurlInitReturnTypeExtension
	{
		return new PHPStan\Type\Php\CurlInitReturnTypeExtension($this->getService('023'));
	}


	public function createService0215(): PHPStan\Type\Php\DateFunctionReturnTypeHelper
	{
		return new PHPStan\Type\Php\DateFunctionReturnTypeHelper;
	}


	public function createService0216(): PHPStan\Type\Php\DateFormatFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\DateFormatFunctionReturnTypeExtension($this->getService('0215'));
	}


	public function createService0217(): PHPStan\Type\Php\DateFormatMethodReturnTypeExtension
	{
		return new PHPStan\Type\Php\DateFormatMethodReturnTypeExtension($this->getService('0215'));
	}


	public function createService0218(): PHPStan\Type\Php\DateFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\DateFunctionReturnTypeExtension($this->getService('0215'));
	}


	public function createService0219(): PHPStan\Type\Php\DateIntervalConstructorThrowTypeExtension
	{
		return new PHPStan\Type\Php\DateIntervalConstructorThrowTypeExtension($this->getService('023'));
	}


	public function createService0220(): PHPStan\Type\Php\DateIntervalDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\DateIntervalDynamicReturnTypeExtension;
	}


	public function createService0221(): PHPStan\Type\Php\DateTimeCreateDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\DateTimeCreateDynamicReturnTypeExtension;
	}


	public function createService0222(): PHPStan\Type\Php\DateTimeDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\DateTimeDynamicReturnTypeExtension;
	}


	public function createService0223(): PHPStan\Type\Php\DateTimeModifyReturnTypeExtension
	{
		return new PHPStan\Type\Php\DateTimeModifyReturnTypeExtension($this->getService('023'), 'DateTime');
	}


	public function createService0224(): PHPStan\Type\Php\DateTimeModifyReturnTypeExtension
	{
		return new PHPStan\Type\Php\DateTimeModifyReturnTypeExtension($this->getService('023'), 'DateTimeImmutable');
	}


	public function createService0225(): PHPStan\Type\Php\DateTimeConstructorThrowTypeExtension
	{
		return new PHPStan\Type\Php\DateTimeConstructorThrowTypeExtension($this->getService('023'));
	}


	public function createService0226(): PHPStan\Type\Php\DateTimeModifyMethodThrowTypeExtension
	{
		return new PHPStan\Type\Php\DateTimeModifyMethodThrowTypeExtension($this->getService('023'));
	}


	public function createService0227(): PHPStan\Type\Php\DateTimeZoneConstructorThrowTypeExtension
	{
		return new PHPStan\Type\Php\DateTimeZoneConstructorThrowTypeExtension($this->getService('023'));
	}


	public function createService0228(): PHPStan\Type\Php\DsMapDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\DsMapDynamicReturnTypeExtension;
	}


	public function createService0229(): PHPStan\Type\Php\DsMapDynamicMethodThrowTypeExtension
	{
		return new PHPStan\Type\Php\DsMapDynamicMethodThrowTypeExtension;
	}


	public function createService0230(): PHPStan\Type\Php\DioStatDynamicFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\DioStatDynamicFunctionReturnTypeExtension;
	}


	public function createService0231(): PHPStan\Type\Php\ExplodeFunctionDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\ExplodeFunctionDynamicReturnTypeExtension($this->getService('023'));
	}


	public function createService0232(): PHPStan\Type\Php\FilterFunctionReturnTypeHelper
	{
		return new PHPStan\Type\Php\FilterFunctionReturnTypeHelper($this->getService('reflectionProvider'), $this->getService('023'));
	}


	public function createService0233(): PHPStan\Type\Php\FilterInputDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\FilterInputDynamicReturnTypeExtension($this->getService('0232'));
	}


	public function createService0234(): PHPStan\Type\Php\FilterVarDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\FilterVarDynamicReturnTypeExtension($this->getService('0232'));
	}


	public function createService0235(): PHPStan\Type\Php\FilterVarArrayDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\FilterVarArrayDynamicReturnTypeExtension(
			$this->getService('0232'),
			$this->getService('reflectionProvider')
		);
	}


	public function createService0236(): PHPStan\Type\Php\GetCalledClassDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\GetCalledClassDynamicReturnTypeExtension;
	}


	public function createService0237(): PHPStan\Type\Php\GetClassDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\GetClassDynamicReturnTypeExtension;
	}


	public function createService0238(): PHPStan\Type\Php\GetDebugTypeFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\GetDebugTypeFunctionReturnTypeExtension;
	}


	public function createService0239(): PHPStan\Type\Php\GetParentClassDynamicFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\GetParentClassDynamicFunctionReturnTypeExtension($this->getService('reflectionProvider'));
	}


	public function createService0240(): PHPStan\Type\Php\GettypeFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\GettypeFunctionReturnTypeExtension;
	}


	public function createService0241(): PHPStan\Type\Php\GettimeofdayDynamicFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\GettimeofdayDynamicFunctionReturnTypeExtension;
	}


	public function createService0242(): PHPStan\Type\Php\HashFunctionsReturnTypeExtension
	{
		return new PHPStan\Type\Php\HashFunctionsReturnTypeExtension($this->getService('023'));
	}


	public function createService0243(): PHPStan\Type\Php\HighlightStringDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\HighlightStringDynamicReturnTypeExtension($this->getService('023'));
	}


	public function createService0244(): PHPStan\Type\Php\IntdivThrowTypeExtension
	{
		return new PHPStan\Type\Php\IntdivThrowTypeExtension;
	}


	public function createService0245(): PHPStan\Type\Php\IniGetReturnTypeExtension
	{
		return new PHPStan\Type\Php\IniGetReturnTypeExtension;
	}


	public function createService0246(): PHPStan\Type\Php\JsonThrowTypeExtension
	{
		return new PHPStan\Type\Php\JsonThrowTypeExtension($this->getService('reflectionProvider'), $this->getService('0169'));
	}


	public function createService0247(): PHPStan\Type\Php\PregMatchTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\PregMatchTypeSpecifyingExtension($this->getService('0250'));
	}


	public function createService0248(): PHPStan\Type\Php\PregMatchParameterOutTypeExtension
	{
		return new PHPStan\Type\Php\PregMatchParameterOutTypeExtension($this->getService('0250'));
	}


	public function createService0249(): PHPStan\Type\Php\PregReplaceCallbackClosureTypeExtension
	{
		return new PHPStan\Type\Php\PregReplaceCallbackClosureTypeExtension($this->getService('0250'));
	}


	public function createService0250(): PHPStan\Type\Php\RegexArrayShapeMatcher
	{
		return new PHPStan\Type\Php\RegexArrayShapeMatcher(
			$this->getService('0251'),
			$this->getService('0252'),
			$this->getService('023')
		);
	}


	public function createService0251(): PHPStan\Type\Regex\RegexGroupParser
	{
		return new PHPStan\Type\Regex\RegexGroupParser($this->getService('023'), $this->getService('0252'));
	}


	public function createService0252(): PHPStan\Type\Regex\RegexExpressionHelper
	{
		return new PHPStan\Type\Regex\RegexExpressionHelper($this->getService('088'));
	}


	public function createService0253(): PHPStan\Type\Php\ReflectionClassConstructorThrowTypeExtension
	{
		return new PHPStan\Type\Php\ReflectionClassConstructorThrowTypeExtension;
	}


	public function createService0254(): PHPStan\Type\Php\ReflectionFunctionConstructorThrowTypeExtension
	{
		return new PHPStan\Type\Php\ReflectionFunctionConstructorThrowTypeExtension($this->getService('reflectionProvider'));
	}


	public function createService0255(): PHPStan\Type\Php\ReflectionMethodConstructorThrowTypeExtension
	{
		return new PHPStan\Type\Php\ReflectionMethodConstructorThrowTypeExtension($this->getService('reflectionProvider'));
	}


	public function createService0256(): PHPStan\Type\Php\ReflectionPropertyConstructorThrowTypeExtension
	{
		return new PHPStan\Type\Php\ReflectionPropertyConstructorThrowTypeExtension($this->getService('reflectionProvider'));
	}


	public function createService0257(): PHPStan\Type\Php\StrContainingTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\StrContainingTypeSpecifyingExtension;
	}


	public function createService0258(): PHPStan\Type\Php\SimpleXMLElementClassPropertyReflectionExtension
	{
		return new PHPStan\Type\Php\SimpleXMLElementClassPropertyReflectionExtension;
	}


	public function createService0259(): PHPStan\Type\Php\SimpleXMLElementConstructorThrowTypeExtension
	{
		return new PHPStan\Type\Php\SimpleXMLElementConstructorThrowTypeExtension;
	}


	public function createService0260(): PHPStan\Type\Php\StatDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\StatDynamicReturnTypeExtension;
	}


	public function createService0261(): PHPStan\Type\Php\MethodExistsTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\MethodExistsTypeSpecifyingExtension;
	}


	public function createService0262(): PHPStan\Type\Php\PropertyExistsTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\PropertyExistsTypeSpecifyingExtension($this->getService('0161'));
	}


	public function createService0263(): PHPStan\Type\Php\MinMaxFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\MinMaxFunctionReturnTypeExtension($this->getService('023'));
	}


	public function createService0264(): PHPStan\Type\Php\NumberFormatFunctionDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\NumberFormatFunctionDynamicReturnTypeExtension;
	}


	public function createService0265(): PHPStan\Type\Php\PathinfoFunctionDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\PathinfoFunctionDynamicReturnTypeExtension($this->getService('reflectionProvider'));
	}


	public function createService0266(): PHPStan\Type\Php\PregFilterFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\PregFilterFunctionReturnTypeExtension;
	}


	public function createService0267(): PHPStan\Type\Php\PregSplitDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\PregSplitDynamicReturnTypeExtension($this->getService('0169'));
	}


	public function createService0268(): PHPStan\Type\Php\ReflectionClassIsSubclassOfTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\ReflectionClassIsSubclassOfTypeSpecifyingExtension;
	}


	public function createService0269(): PHPStan\Type\Php\ReplaceFunctionsDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\ReplaceFunctionsDynamicReturnTypeExtension;
	}


	public function createService0270(): PHPStan\Type\Php\ArrayPointerFunctionsDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\ArrayPointerFunctionsDynamicReturnTypeExtension;
	}


	public function createService0271(): PHPStan\Type\Php\LtrimFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\LtrimFunctionReturnTypeExtension;
	}


	public function createService0272(): PHPStan\Type\Php\MbFunctionsReturnTypeExtension
	{
		return new PHPStan\Type\Php\MbFunctionsReturnTypeExtension($this->getService('023'));
	}


	public function createService0273(): PHPStan\Type\Php\MbConvertEncodingFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\MbConvertEncodingFunctionReturnTypeExtension;
	}


	public function createService0274(): PHPStan\Type\Php\MbSubstituteCharacterDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\MbSubstituteCharacterDynamicReturnTypeExtension($this->getService('023'));
	}


	public function createService0275(): PHPStan\Type\Php\MbStrlenFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\MbStrlenFunctionReturnTypeExtension($this->getService('023'));
	}


	public function createService0276(): PHPStan\Type\Php\MicrotimeFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\MicrotimeFunctionReturnTypeExtension;
	}


	public function createService0277(): PHPStan\Type\Php\HrtimeFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\HrtimeFunctionReturnTypeExtension;
	}


	public function createService0278(): PHPStan\Type\Php\ImplodeFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ImplodeFunctionReturnTypeExtension;
	}


	public function createService0279(): PHPStan\Type\Php\NonEmptyStringFunctionsReturnTypeExtension
	{
		return new PHPStan\Type\Php\NonEmptyStringFunctionsReturnTypeExtension;
	}


	public function createService0280(): PHPStan\Type\Php\SetTypeFunctionTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\SetTypeFunctionTypeSpecifyingExtension;
	}


	public function createService0281(): PHPStan\Type\Php\StrCaseFunctionsReturnTypeExtension
	{
		return new PHPStan\Type\Php\StrCaseFunctionsReturnTypeExtension;
	}


	public function createService0282(): PHPStan\Type\Php\StrlenFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\StrlenFunctionReturnTypeExtension;
	}


	public function createService0283(): PHPStan\Type\Php\StrIncrementDecrementFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\StrIncrementDecrementFunctionReturnTypeExtension;
	}


	public function createService0284(): PHPStan\Type\Php\StrPadFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\StrPadFunctionReturnTypeExtension;
	}


	public function createService0285(): PHPStan\Type\Php\StrRepeatFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\StrRepeatFunctionReturnTypeExtension;
	}


	public function createService0286(): PHPStan\Type\Php\SubstrDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\SubstrDynamicReturnTypeExtension;
	}


	public function createService0287(): PHPStan\Type\Php\ThrowableReturnTypeExtension
	{
		return new PHPStan\Type\Php\ThrowableReturnTypeExtension;
	}


	public function createService0288(): PHPStan\Type\Php\ParseUrlFunctionDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\ParseUrlFunctionDynamicReturnTypeExtension;
	}


	public function createService0289(): PHPStan\Type\Php\TriggerErrorDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\TriggerErrorDynamicReturnTypeExtension($this->getService('023'));
	}


	public function createService0290(): PHPStan\Type\Php\VersionCompareFunctionDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\VersionCompareFunctionDynamicReturnTypeExtension;
	}


	public function createService0291(): PHPStan\Type\Php\PowFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\PowFunctionReturnTypeExtension;
	}


	public function createService0292(): PHPStan\Type\Php\RoundFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\RoundFunctionReturnTypeExtension($this->getService('023'));
	}


	public function createService0293(): PHPStan\Type\Php\StrtotimeFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\StrtotimeFunctionReturnTypeExtension;
	}


	public function createService0294(): PHPStan\Type\Php\RandomIntFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\RandomIntFunctionReturnTypeExtension;
	}


	public function createService0295(): PHPStan\Type\Php\RangeFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\RangeFunctionReturnTypeExtension;
	}


	public function createService0296(): PHPStan\Type\Php\AssertFunctionTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\AssertFunctionTypeSpecifyingExtension;
	}


	public function createService0297(): PHPStan\Type\Php\ClassExistsFunctionTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\ClassExistsFunctionTypeSpecifyingExtension;
	}


	public function createService0298(): PHPStan\Type\Php\ClassImplementsFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\ClassImplementsFunctionReturnTypeExtension;
	}


	public function createService0299(): PHPStan\Type\Php\DefineConstantTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\DefineConstantTypeSpecifyingExtension;
	}


	public function createService0300(): PHPStan\Type\Php\DefinedConstantTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\DefinedConstantTypeSpecifyingExtension($this->getService('0210'));
	}


	public function createService0301(): PHPStan\Type\Php\FunctionExistsFunctionTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\FunctionExistsFunctionTypeSpecifyingExtension;
	}


	public function createService0302(): PHPStan\Type\Php\InArrayFunctionTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\InArrayFunctionTypeSpecifyingExtension;
	}


	public function createService0303(): PHPStan\Type\Php\IsArrayFunctionTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\IsArrayFunctionTypeSpecifyingExtension(false);
	}


	public function createService0304(): PHPStan\Type\Php\IsCallableFunctionTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\IsCallableFunctionTypeSpecifyingExtension($this->getService('0261'));
	}


	public function createService0305(): PHPStan\Type\Php\IsIterableFunctionTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\IsIterableFunctionTypeSpecifyingExtension;
	}


	public function createService0306(): PHPStan\Type\Php\IsSubclassOfFunctionTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\IsSubclassOfFunctionTypeSpecifyingExtension($this->getService('0309'));
	}


	public function createService0307(): PHPStan\Type\Php\IteratorToArrayFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\IteratorToArrayFunctionReturnTypeExtension;
	}


	public function createService0308(): PHPStan\Type\Php\IsAFunctionTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\IsAFunctionTypeSpecifyingExtension($this->getService('0309'));
	}


	public function createService0309(): PHPStan\Type\Php\IsAFunctionTypeSpecifyingHelper
	{
		return new PHPStan\Type\Php\IsAFunctionTypeSpecifyingHelper;
	}


	public function createService0310(): PHPStan\Type\Php\CtypeDigitFunctionTypeSpecifyingExtension
	{
		return new PHPStan\Type\Php\CtypeDigitFunctionTypeSpecifyingExtension;
	}


	public function createService0311(): PHPStan\Type\Php\JsonThrowOnErrorDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\JsonThrowOnErrorDynamicReturnTypeExtension(
			$this->getService('reflectionProvider'),
			$this->getService('0169')
		);
	}


	public function createService0312(): PHPStan\Type\Php\TypeSpecifyingFunctionsDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\TypeSpecifyingFunctionsDynamicReturnTypeExtension(
			$this->getService('reflectionProvider'),
			true,
			['stdClass'],
			false
		);
	}


	public function createService0313(): PHPStan\Type\Php\SimpleXMLElementAsXMLMethodReturnTypeExtension
	{
		return new PHPStan\Type\Php\SimpleXMLElementAsXMLMethodReturnTypeExtension;
	}


	public function createService0314(): PHPStan\Type\Php\SimpleXMLElementXpathMethodReturnTypeExtension
	{
		return new PHPStan\Type\Php\SimpleXMLElementXpathMethodReturnTypeExtension;
	}


	public function createService0315(): PHPStan\Type\Php\StrSplitFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\StrSplitFunctionReturnTypeExtension($this->getService('023'));
	}


	public function createService0316(): PHPStan\Type\Php\StrTokFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\StrTokFunctionReturnTypeExtension;
	}


	public function createService0317(): PHPStan\Type\Php\SprintfFunctionDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\SprintfFunctionDynamicReturnTypeExtension;
	}


	public function createService0318(): PHPStan\Type\Php\SscanfFunctionDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\SscanfFunctionDynamicReturnTypeExtension;
	}


	public function createService0319(): PHPStan\Type\Php\StrvalFamilyFunctionReturnTypeExtension
	{
		return new PHPStan\Type\Php\StrvalFamilyFunctionReturnTypeExtension;
	}


	public function createService0320(): PHPStan\Type\Php\StrWordCountFunctionDynamicReturnTypeExtension
	{
		return new PHPStan\Type\Php\StrWordCountFunctionDynamicReturnTypeExtension;
	}


	public function createService0321(): PHPStan\Type\Php\XMLReaderOpenReturnTypeExtension
	{
		return new PHPStan\Type\Php\XMLReaderOpenReturnTypeExtension;
	}


	public function createService0322(): PHPStan\Type\Php\ReflectionGetAttributesMethodReturnTypeExtension
	{
		return new PHPStan\Type\Php\ReflectionGetAttributesMethodReturnTypeExtension('ReflectionClass');
	}


	public function createService0323(): PHPStan\Type\Php\ReflectionGetAttributesMethodReturnTypeExtension
	{
		return new PHPStan\Type\Php\ReflectionGetAttributesMethodReturnTypeExtension('ReflectionClassConstant');
	}


	public function createService0324(): PHPStan\Type\Php\ReflectionGetAttributesMethodReturnTypeExtension
	{
		return new PHPStan\Type\Php\ReflectionGetAttributesMethodReturnTypeExtension('ReflectionFunctionAbstract');
	}


	public function createService0325(): PHPStan\Type\Php\ReflectionGetAttributesMethodReturnTypeExtension
	{
		return new PHPStan\Type\Php\ReflectionGetAttributesMethodReturnTypeExtension('ReflectionParameter');
	}


	public function createService0326(): PHPStan\Type\Php\ReflectionGetAttributesMethodReturnTypeExtension
	{
		return new PHPStan\Type\Php\ReflectionGetAttributesMethodReturnTypeExtension('ReflectionProperty');
	}


	public function createService0327(): PHPStan\Type\Php\DatePeriodConstructorReturnTypeExtension
	{
		return new PHPStan\Type\Php\DatePeriodConstructorReturnTypeExtension;
	}


	public function createService0328(): PHPStan\Type\ClosureTypeFactory
	{
		return new PHPStan\Type\ClosureTypeFactory(
			$this->getService('088'),
			$this->getService('0335'),
			$this->getService('originalBetterReflectionReflector'),
			$this->getService('currentPhpVersionPhpParser')
		);
	}


	public function createService0329(): PHPStan\Type\Constant\OversizedArrayBuilder
	{
		return new PHPStan\Type\Constant\OversizedArrayBuilder;
	}


	public function createService0330(): PHPStan\Rules\Functions\PrintfHelper
	{
		return new PHPStan\Rules\Functions\PrintfHelper($this->getService('023'));
	}


	public function createService0331(): PHPStan\Reflection\BetterReflection\BetterReflectionSourceLocatorFactory
	{
		return new PHPStan\Reflection\BetterReflection\BetterReflectionSourceLocatorFactory(
			$this->getService('phpParserDecorator'),
			$this->getService('php8PhpParser'),
			$this->getService('0334'),
			$this->getService('0335'),
			$this->getService('098'),
			$this->getService('095'),
			$this->getService('093'),
			$this->getService('096'),
			$this->getService('092'),
			[],
			['/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/test/php'],
			$this->getParameter('analysedPaths'),
			['/home/sanderronde/git/phpstan-vscode/test/multi-config-demo'],
			$this->getParameter('analysedPathsFromConfig'),
			false
		);
	}


	public function createService0332(): PHPStan\Reflection\BetterReflection\BetterReflectionProviderFactory
	{
		return new class ($this) implements PHPStan\Reflection\BetterReflection\BetterReflectionProviderFactory {
			private $container;


			public function __construct(Container_9bdc8b8877 $container)
			{
				$this->container = $container;
			}


			public function create(PHPStan\BetterReflection\Reflector\Reflector $reflector): PHPStan\Reflection\BetterReflection\BetterReflectionProvider
			{
				return new PHPStan\Reflection\BetterReflection\BetterReflectionProvider(
					$this->container->getService('0110'),
					$this->container->getService('088'),
					$this->container->getService('071'),
					$reflector,
					$this->container->getService('0166'),
					$this->container->getService('031'),
					$this->container->getService('023'),
					$this->container->getService('0111'),
					$this->container->getService('stubPhpDocProvider'),
					$this->container->getService('087'),
					$this->container->getService('relativePathHelper'),
					$this->container->getService('022'),
					$this->container->getService('078'),
					$this->container->getService('0334'),
					$this->container->getService('0116'),
					['stdClass']
				);
			}
		};
	}


	public function createService0333(): PHPStan\Reflection\BetterReflection\SourceStubber\PhpStormStubsSourceStubberFactory
	{
		return new PHPStan\Reflection\BetterReflection\SourceStubber\PhpStormStubsSourceStubberFactory(
			$this->getService('php8PhpParser'),
			$this->getService('021'),
			$this->getService('023')
		);
	}


	public function createService0334(): PHPStan\BetterReflection\SourceLocator\SourceStubber\PhpStormStubsSourceStubber
	{
		return $this->getService('0333')->create();
	}


	public function createService0335(): PHPStan\BetterReflection\SourceLocator\SourceStubber\ReflectionSourceStubber
	{
		return $this->getService('0336')->create();
	}


	public function createService0336(): PHPStan\Reflection\BetterReflection\SourceStubber\ReflectionSourceStubberFactory
	{
		return new PHPStan\Reflection\BetterReflection\SourceStubber\ReflectionSourceStubberFactory(
			$this->getService('021'),
			$this->getService('023')
		);
	}


	public function createService0337(): PHPStan\Command\ErrorFormatter\CiDetectedErrorFormatter
	{
		return new PHPStan\Command\ErrorFormatter\CiDetectedErrorFormatter(
			$this->getService('errorFormatter.github'),
			$this->getService('errorFormatter.teamcity')
		);
	}


	public function createService0338(): PHPStan\Rules\Api\ApiClassConstFetchRule
	{
		return new PHPStan\Rules\Api\ApiClassConstFetchRule($this->getService('0117'), $this->getService('reflectionProvider'));
	}


	public function createService0339(): PHPStan\Rules\Api\ApiInstanceofRule
	{
		return new PHPStan\Rules\Api\ApiInstanceofRule($this->getService('0117'), $this->getService('reflectionProvider'));
	}


	public function createService0340(): PHPStan\Rules\Api\ApiInstanceofTypeRule
	{
		return new PHPStan\Rules\Api\ApiInstanceofTypeRule($this->getService('reflectionProvider'), false, false);
	}


	public function createService0341(): PHPStan\Rules\Api\NodeConnectingVisitorAttributesRule
	{
		return new PHPStan\Rules\Api\NodeConnectingVisitorAttributesRule($this->getService('068'));
	}


	public function createService0342(): PHPStan\Rules\Api\RuntimeReflectionFunctionRule
	{
		return new PHPStan\Rules\Api\RuntimeReflectionFunctionRule($this->getService('reflectionProvider'));
	}


	public function createService0343(): PHPStan\Rules\Api\RuntimeReflectionInstantiationRule
	{
		return new PHPStan\Rules\Api\RuntimeReflectionInstantiationRule($this->getService('reflectionProvider'));
	}


	public function createService0344(): PHPStan\Rules\Classes\ExistingClassInClassExtendsRule
	{
		return new PHPStan\Rules\Classes\ExistingClassInClassExtendsRule(
			$this->getService('0120'),
			$this->getService('reflectionProvider')
		);
	}


	public function createService0345(): PHPStan\Rules\Classes\ExistingClassInInstanceOfRule
	{
		return new PHPStan\Rules\Classes\ExistingClassInInstanceOfRule(
			$this->getService('reflectionProvider'),
			$this->getService('0120'),
			true
		);
	}


	public function createService0346(): PHPStan\Rules\Exceptions\CaughtExceptionExistenceRule
	{
		return new PHPStan\Rules\Exceptions\CaughtExceptionExistenceRule(
			$this->getService('reflectionProvider'),
			$this->getService('0120'),
			true
		);
	}


	public function createService0347(): PHPStan\Rules\Functions\CallToNonExistentFunctionRule
	{
		return new PHPStan\Rules\Functions\CallToNonExistentFunctionRule($this->getService('reflectionProvider'), false);
	}


	public function createService0348(): PHPStan\Rules\Constants\OverridingConstantRule
	{
		return new PHPStan\Rules\Constants\OverridingConstantRule(true);
	}


	public function createService0349(): PHPStan\Rules\Methods\OverridingMethodRule
	{
		return new PHPStan\Rules\Methods\OverridingMethodRule(
			$this->getService('023'),
			$this->getService('0147'),
			true,
			$this->getService('0148'),
			$this->getService('0103'),
			false,
			false,
			false
		);
	}


	public function createService0350(): PHPStan\Rules\Methods\ConsistentConstructorRule
	{
		return new PHPStan\Rules\Methods\ConsistentConstructorRule($this->getService('0148'));
	}


	public function createService0351(): PHPStan\Rules\Missing\MissingReturnRule
	{
		return new PHPStan\Rules\Missing\MissingReturnRule(false, true);
	}


	public function createService0352(): PHPStan\Rules\Namespaces\ExistingNamesInGroupUseRule
	{
		return new PHPStan\Rules\Namespaces\ExistingNamesInGroupUseRule(
			$this->getService('reflectionProvider'),
			$this->getService('0120'),
			false
		);
	}


	public function createService0353(): PHPStan\Rules\Namespaces\ExistingNamesInUseRule
	{
		return new PHPStan\Rules\Namespaces\ExistingNamesInUseRule(
			$this->getService('reflectionProvider'),
			$this->getService('0120'),
			false
		);
	}


	public function createService0354(): PHPStan\Rules\Operators\InvalidIncDecOperationRule
	{
		return new PHPStan\Rules\Operators\InvalidIncDecOperationRule($this->getService('0163'), false, false);
	}


	public function createService0355(): PHPStan\Rules\Properties\AccessPropertiesRule
	{
		return new PHPStan\Rules\Properties\AccessPropertiesRule(
			$this->getService('reflectionProvider'),
			$this->getService('0163'),
			true,
			false
		);
	}


	public function createService0356(): PHPStan\Rules\Properties\AccessStaticPropertiesRule
	{
		return new PHPStan\Rules\Properties\AccessStaticPropertiesRule(
			$this->getService('reflectionProvider'),
			$this->getService('0163'),
			$this->getService('0120')
		);
	}


	public function createService0357(): PHPStan\Rules\Properties\ExistingClassesInPropertiesRule
	{
		return new PHPStan\Rules\Properties\ExistingClassesInPropertiesRule(
			$this->getService('reflectionProvider'),
			$this->getService('0120'),
			$this->getService('0155'),
			$this->getService('023'),
			true,
			false
		);
	}


	public function createService0358(): PHPStan\Rules\Functions\FunctionCallableRule
	{
		return new PHPStan\Rules\Functions\FunctionCallableRule(
			$this->getService('reflectionProvider'),
			$this->getService('0163'),
			$this->getService('023'),
			false,
			true
		);
	}


	public function createService0359(): PHPStan\Rules\Properties\MissingReadOnlyByPhpDocPropertyAssignRule
	{
		return new PHPStan\Rules\Properties\MissingReadOnlyByPhpDocPropertyAssignRule($this->getService('0368'));
	}


	public function createService0360(): PHPStan\Rules\Properties\OverridingPropertyRule
	{
		return new PHPStan\Rules\Properties\OverridingPropertyRule(true, false);
	}


	public function createService0361(): PHPStan\Rules\Properties\ReadOnlyByPhpDocPropertyRule
	{
		return new PHPStan\Rules\Properties\ReadOnlyByPhpDocPropertyRule;
	}


	public function createService0362(): PHPStan\Rules\Properties\UninitializedPropertyRule
	{
		return new PHPStan\Rules\Properties\UninitializedPropertyRule($this->getService('0368'));
	}


	public function createService0363(): PHPStan\Rules\Properties\WritingToReadOnlyPropertiesRule
	{
		return new PHPStan\Rules\Properties\WritingToReadOnlyPropertiesRule(
			$this->getService('0163'),
			$this->getService('0160'),
			$this->getService('0161'),
			false
		);
	}


	public function createService0364(): PHPStan\Rules\Properties\ReadingWriteOnlyPropertiesRule
	{
		return new PHPStan\Rules\Properties\ReadingWriteOnlyPropertiesRule(
			$this->getService('0160'),
			$this->getService('0161'),
			$this->getService('0163'),
			false
		);
	}


	public function createService0365(): PHPStan\Rules\Variables\CompactVariablesRule
	{
		return new PHPStan\Rules\Variables\CompactVariablesRule(true);
	}


	public function createService0366(): PHPStan\Rules\Variables\DefinedVariableRule
	{
		return new PHPStan\Rules\Variables\DefinedVariableRule(true, true);
	}


	public function createService0367(): PHPStan\Rules\Regexp\RegularExpressionPatternRule
	{
		return new PHPStan\Rules\Regexp\RegularExpressionPatternRule($this->getService('0252'));
	}


	public function createService0368(): PHPStan\Reflection\ConstructorsHelper
	{
		return new PHPStan\Reflection\ConstructorsHelper($this->getService('068'), []);
	}


	public function createService0369(): PHPStan\Rules\Methods\MissingMagicSerializationMethodsRule
	{
		return new PHPStan\Rules\Methods\MissingMagicSerializationMethodsRule($this->getService('023'));
	}


	public function createService0370(): PHPStan\Rules\Constants\MagicConstantContextRule
	{
		return new PHPStan\Rules\Constants\MagicConstantContextRule;
	}


	public function createService0371(): PHPStan\Rules\Functions\UselessFunctionReturnValueRule
	{
		return new PHPStan\Rules\Functions\UselessFunctionReturnValueRule($this->getService('reflectionProvider'));
	}


	public function createService0372(): PHPStan\Rules\Functions\PrintfArrayParametersRule
	{
		return new PHPStan\Rules\Functions\PrintfArrayParametersRule($this->getService('0330'), $this->getService('reflectionProvider'));
	}


	public function createService0373(): PHPStan\Rules\Regexp\RegularExpressionQuotingRule
	{
		return new PHPStan\Rules\Regexp\RegularExpressionQuotingRule($this->getService('reflectionProvider'), $this->getService('0252'));
	}


	public function createService0374(): PHPStan\Rules\Classes\MixinRule
	{
		return new PHPStan\Rules\Classes\MixinRule(
			$this->getService('reflectionProvider'),
			$this->getService('0120'),
			$this->getService('0141'),
			$this->getService('0149'),
			$this->getService('0155'),
			true,
			false
		);
	}


	public function createService0375(): PHPStan\Rules\Classes\MethodTagRule
	{
		return new PHPStan\Rules\Classes\MethodTagRule($this->getService('0124'));
	}


	public function createService0376(): PHPStan\Rules\Classes\MethodTagTraitRule
	{
		return new PHPStan\Rules\Classes\MethodTagTraitRule($this->getService('0124'), $this->getService('reflectionProvider'));
	}


	public function createService0377(): PHPStan\Rules\Classes\PropertyTagRule
	{
		return new PHPStan\Rules\Classes\PropertyTagRule($this->getService('0125'));
	}


	public function createService0378(): PHPStan\Rules\Classes\PropertyTagTraitRule
	{
		return new PHPStan\Rules\Classes\PropertyTagTraitRule($this->getService('0125'), $this->getService('reflectionProvider'));
	}


	public function createService0379(): PHPStan\Rules\PhpDoc\RequireExtendsCheck
	{
		return new PHPStan\Rules\PhpDoc\RequireExtendsCheck($this->getService('0120'), true);
	}


	public function createService0380(): PHPStan\Rules\PhpDoc\RequireImplementsDefinitionTraitRule
	{
		return new PHPStan\Rules\PhpDoc\RequireImplementsDefinitionTraitRule(
			$this->getService('reflectionProvider'),
			$this->getService('0120'),
			true
		);
	}


	public function createService0381(): PHPStan\Rules\Functions\IncompatibleArrowFunctionDefaultParameterTypeRule
	{
		return new PHPStan\Rules\Functions\IncompatibleArrowFunctionDefaultParameterTypeRule;
	}


	public function createService0382(): PHPStan\Rules\Functions\IncompatibleClosureDefaultParameterTypeRule
	{
		return new PHPStan\Rules\Functions\IncompatibleClosureDefaultParameterTypeRule;
	}


	public function createService0383(): PHPStan\Rules\Functions\CallCallablesRule
	{
		return new PHPStan\Rules\Functions\CallCallablesRule($this->getService('0135'), $this->getService('0163'), true);
	}


	public function createService0384(): PHPStan\Rules\Methods\IllegalConstructorMethodCallRule
	{
		return new PHPStan\Rules\Methods\IllegalConstructorMethodCallRule;
	}


	public function createService0385(): PHPStan\Rules\Methods\IllegalConstructorStaticCallRule
	{
		return new PHPStan\Rules\Methods\IllegalConstructorStaticCallRule;
	}


	public function createService0386(): PHPStan\Rules\PhpDoc\InvalidPhpDocTagValueRule
	{
		return new PHPStan\Rules\PhpDoc\InvalidPhpDocTagValueRule($this->getService('026'), $this->getService('029'), false, false);
	}


	public function createService0387(): PHPStan\Rules\PhpDoc\InvalidPhpDocVarTagTypeRule
	{
		return new PHPStan\Rules\PhpDoc\InvalidPhpDocVarTagTypeRule(
			$this->getService('0166'),
			$this->getService('reflectionProvider'),
			$this->getService('0120'),
			$this->getService('0141'),
			$this->getService('0149'),
			$this->getService('0155'),
			true,
			true
		);
	}


	public function createService0388(): PHPStan\Rules\PhpDoc\InvalidPHPStanDocTagRule
	{
		return new PHPStan\Rules\PhpDoc\InvalidPHPStanDocTagRule($this->getService('026'), $this->getService('029'), false);
	}


	public function createService0389(): PHPStan\Rules\PhpDoc\VarTagChangedExpressionTypeRule
	{
		return new PHPStan\Rules\PhpDoc\VarTagChangedExpressionTypeRule($this->getService('0157'));
	}


	public function createService0390(): PHPStan\Rules\PhpDoc\WrongVariableNameInVarTagRule
	{
		return new PHPStan\Rules\PhpDoc\WrongVariableNameInVarTagRule($this->getService('0166'), $this->getService('0157'), false);
	}


	public function createService0391(): PHPStan\Rules\Generics\PropertyVarianceRule
	{
		return new PHPStan\Rules\Generics\PropertyVarianceRule($this->getService('0143'), false);
	}


	public function createService0392(): PHPStan\Rules\Pure\PureFunctionRule
	{
		return new PHPStan\Rules\Pure\PureFunctionRule($this->getService('0162'));
	}


	public function createService0393(): PHPStan\Rules\Pure\PureMethodRule
	{
		return new PHPStan\Rules\Pure\PureMethodRule($this->getService('0162'));
	}


	public function createService0394(): PHPStan\Rules\Operators\InvalidBinaryOperationRule
	{
		return new PHPStan\Rules\Operators\InvalidBinaryOperationRule($this->getService('020'), $this->getService('0163'), false);
	}


	public function createService0395(): PHPStan\Rules\Operators\InvalidUnaryOperationRule
	{
		return new PHPStan\Rules\Operators\InvalidUnaryOperationRule($this->getService('0163'), false);
	}


	public function createService0396(): PHPStan\Rules\Arrays\InvalidKeyInArrayDimFetchRule
	{
		return new PHPStan\Rules\Arrays\InvalidKeyInArrayDimFetchRule($this->getService('0163'), true);
	}


	public function createService0397(): PHPStan\Rules\Arrays\InvalidKeyInArrayItemRule
	{
		return new PHPStan\Rules\Arrays\InvalidKeyInArrayItemRule(true);
	}


	public function createService0398(): PHPStan\Rules\Arrays\NonexistentOffsetInArrayDimFetchRule
	{
		return new PHPStan\Rules\Arrays\NonexistentOffsetInArrayDimFetchRule($this->getService('0163'), $this->getService('0119'), true);
	}


	public function createService0399(): PHPStan\Rules\Exceptions\ThrowsVoidFunctionWithExplicitThrowPointRule
	{
		return new PHPStan\Rules\Exceptions\ThrowsVoidFunctionWithExplicitThrowPointRule(
			$this->getService('exceptionTypeResolver'),
			false
		);
	}


	public function createService0400(): PHPStan\Rules\Exceptions\ThrowsVoidMethodWithExplicitThrowPointRule
	{
		return new PHPStan\Rules\Exceptions\ThrowsVoidMethodWithExplicitThrowPointRule(
			$this->getService('exceptionTypeResolver'),
			false
		);
	}


	public function createService0401(): PHPStan\Rules\Generators\YieldFromTypeRule
	{
		return new PHPStan\Rules\Generators\YieldFromTypeRule($this->getService('0163'), true);
	}


	public function createService0402(): PHPStan\Rules\Generators\YieldInGeneratorRule
	{
		return new PHPStan\Rules\Generators\YieldInGeneratorRule(true);
	}


	public function createService0403(): PHPStan\Rules\Arrays\ArrayUnpackingRule
	{
		return new PHPStan\Rules\Arrays\ArrayUnpackingRule($this->getService('023'), $this->getService('0163'));
	}


	public function createService0404(): PHPStan\Rules\Properties\ReadOnlyByPhpDocPropertyAssignRefRule
	{
		return new PHPStan\Rules\Properties\ReadOnlyByPhpDocPropertyAssignRefRule($this->getService('0161'));
	}


	public function createService0405(): PHPStan\Rules\Properties\ReadOnlyByPhpDocPropertyAssignRule
	{
		return new PHPStan\Rules\Properties\ReadOnlyByPhpDocPropertyAssignRule($this->getService('0161'), $this->getService('0368'));
	}


	public function createService0406(): PHPStan\Rules\Variables\ParameterOutAssignedTypeRule
	{
		return new PHPStan\Rules\Variables\ParameterOutAssignedTypeRule($this->getService('0163'));
	}


	public function createService0407(): PHPStan\Rules\Variables\ParameterOutExecutionEndTypeRule
	{
		return new PHPStan\Rules\Variables\ParameterOutExecutionEndTypeRule($this->getService('0163'));
	}


	public function createService0408(): PHPStan\Rules\Classes\ImpossibleInstanceOfRule
	{
		return new PHPStan\Rules\Classes\ImpossibleInstanceOfRule(false, true, false);
	}


	public function createService0409(): PHPStan\Rules\Comparison\BooleanAndConstantConditionRule
	{
		return new PHPStan\Rules\Comparison\BooleanAndConstantConditionRule($this->getService('0126'), true, false, false);
	}


	public function createService0410(): PHPStan\Rules\Comparison\BooleanOrConstantConditionRule
	{
		return new PHPStan\Rules\Comparison\BooleanOrConstantConditionRule($this->getService('0126'), true, false, false);
	}


	public function createService0411(): PHPStan\Rules\Comparison\BooleanNotConstantConditionRule
	{
		return new PHPStan\Rules\Comparison\BooleanNotConstantConditionRule($this->getService('0126'), true, false);
	}


	public function createService0412(): PHPStan\Rules\DeadCode\NoopRule
	{
		return new PHPStan\Rules\DeadCode\NoopRule($this->getService('020'), false);
	}


	public function createService0413(): PHPStan\Rules\DeadCode\CallToConstructorStatementWithoutImpurePointsRule
	{
		return new PHPStan\Rules\DeadCode\CallToConstructorStatementWithoutImpurePointsRule;
	}


	public function createService0414(): PHPStan\Rules\DeadCode\ConstructorWithoutImpurePointsCollector
	{
		return new PHPStan\Rules\DeadCode\ConstructorWithoutImpurePointsCollector;
	}


	public function createService0415(): PHPStan\Rules\DeadCode\PossiblyPureNewCollector
	{
		return new PHPStan\Rules\DeadCode\PossiblyPureNewCollector($this->getService('reflectionProvider'));
	}


	public function createService0416(): PHPStan\Rules\DeadCode\CallToFunctionStatementWithoutImpurePointsRule
	{
		return new PHPStan\Rules\DeadCode\CallToFunctionStatementWithoutImpurePointsRule;
	}


	public function createService0417(): PHPStan\Rules\DeadCode\FunctionWithoutImpurePointsCollector
	{
		return new PHPStan\Rules\DeadCode\FunctionWithoutImpurePointsCollector;
	}


	public function createService0418(): PHPStan\Rules\DeadCode\PossiblyPureFuncCallCollector
	{
		return new PHPStan\Rules\DeadCode\PossiblyPureFuncCallCollector($this->getService('reflectionProvider'));
	}


	public function createService0419(): PHPStan\Rules\DeadCode\CallToMethodStatementWithoutImpurePointsRule
	{
		return new PHPStan\Rules\DeadCode\CallToMethodStatementWithoutImpurePointsRule;
	}


	public function createService0420(): PHPStan\Rules\DeadCode\MethodWithoutImpurePointsCollector
	{
		return new PHPStan\Rules\DeadCode\MethodWithoutImpurePointsCollector;
	}


	public function createService0421(): PHPStan\Rules\DeadCode\PossiblyPureMethodCallCollector
	{
		return new PHPStan\Rules\DeadCode\PossiblyPureMethodCallCollector;
	}


	public function createService0422(): PHPStan\Rules\DeadCode\CallToStaticMethodStatementWithoutImpurePointsRule
	{
		return new PHPStan\Rules\DeadCode\CallToStaticMethodStatementWithoutImpurePointsRule;
	}


	public function createService0423(): PHPStan\Rules\DeadCode\PossiblyPureStaticCallCollector
	{
		return new PHPStan\Rules\DeadCode\PossiblyPureStaticCallCollector;
	}


	public function createService0424(): PHPStan\Rules\DeadCode\UnusedPrivatePropertyRule
	{
		return new PHPStan\Rules\DeadCode\UnusedPrivatePropertyRule($this->getService('0159'), [], [], false);
	}


	public function createService0425(): PHPStan\Rules\Comparison\DoWhileLoopConstantConditionRule
	{
		return new PHPStan\Rules\Comparison\DoWhileLoopConstantConditionRule($this->getService('0126'), true);
	}


	public function createService0426(): PHPStan\Rules\Comparison\ElseIfConstantConditionRule
	{
		return new PHPStan\Rules\Comparison\ElseIfConstantConditionRule($this->getService('0126'), true, false);
	}


	public function createService0427(): PHPStan\Rules\Comparison\IfConstantConditionRule
	{
		return new PHPStan\Rules\Comparison\IfConstantConditionRule($this->getService('0126'), true);
	}


	public function createService0428(): PHPStan\Rules\Comparison\ImpossibleCheckTypeFunctionCallRule
	{
		return new PHPStan\Rules\Comparison\ImpossibleCheckTypeFunctionCallRule($this->getService('0127'), false, true, false);
	}


	public function createService0429(): PHPStan\Rules\Comparison\ImpossibleCheckTypeMethodCallRule
	{
		return new PHPStan\Rules\Comparison\ImpossibleCheckTypeMethodCallRule($this->getService('0127'), false, true, false);
	}


	public function createService0430(): PHPStan\Rules\Comparison\ImpossibleCheckTypeStaticMethodCallRule
	{
		return new PHPStan\Rules\Comparison\ImpossibleCheckTypeStaticMethodCallRule($this->getService('0127'), false, true, false);
	}


	public function createService0431(): PHPStan\Rules\Comparison\LogicalXorConstantConditionRule
	{
		return new PHPStan\Rules\Comparison\LogicalXorConstantConditionRule($this->getService('0126'), true, false);
	}


	public function createService0432(): PHPStan\Rules\DeadCode\BetterNoopRule
	{
		return new PHPStan\Rules\DeadCode\BetterNoopRule($this->getService('020'));
	}


	public function createService0433(): PHPStan\Rules\Comparison\MatchExpressionRule
	{
		return new PHPStan\Rules\Comparison\MatchExpressionRule($this->getService('0126'), false, false, false, true);
	}


	public function createService0434(): PHPStan\Rules\Comparison\NumberComparisonOperatorsConstantConditionRule
	{
		return new PHPStan\Rules\Comparison\NumberComparisonOperatorsConstantConditionRule(true);
	}


	public function createService0435(): PHPStan\Rules\Comparison\StrictComparisonOfDifferentTypesRule
	{
		return new PHPStan\Rules\Comparison\StrictComparisonOfDifferentTypesRule(false, true, false);
	}


	public function createService0436(): PHPStan\Rules\Comparison\ConstantLooseComparisonRule
	{
		return new PHPStan\Rules\Comparison\ConstantLooseComparisonRule(false, true, false);
	}


	public function createService0437(): PHPStan\Rules\Comparison\TernaryOperatorConstantConditionRule
	{
		return new PHPStan\Rules\Comparison\TernaryOperatorConstantConditionRule($this->getService('0126'), true);
	}


	public function createService0438(): PHPStan\Rules\Comparison\UnreachableIfBranchesRule
	{
		return new PHPStan\Rules\Comparison\UnreachableIfBranchesRule($this->getService('0126'), true, false);
	}


	public function createService0439(): PHPStan\Rules\Comparison\UnreachableTernaryElseBranchRule
	{
		return new PHPStan\Rules\Comparison\UnreachableTernaryElseBranchRule($this->getService('0126'), true, false);
	}


	public function createService0440(): PHPStan\Rules\Comparison\WhileLoopAlwaysFalseConditionRule
	{
		return new PHPStan\Rules\Comparison\WhileLoopAlwaysFalseConditionRule($this->getService('0126'), true);
	}


	public function createService0441(): PHPStan\Rules\Comparison\WhileLoopAlwaysTrueConditionRule
	{
		return new PHPStan\Rules\Comparison\WhileLoopAlwaysTrueConditionRule($this->getService('0126'), true);
	}


	public function createService0442(): PHPStan\Rules\Methods\CallToConstructorStatementWithoutSideEffectsRule
	{
		return new PHPStan\Rules\Methods\CallToConstructorStatementWithoutSideEffectsRule(
			$this->getService('reflectionProvider'),
			false
		);
	}


	public function createService0443(): PHPStan\Rules\TooWideTypehints\TooWideMethodReturnTypehintRule
	{
		return new PHPStan\Rules\TooWideTypehints\TooWideMethodReturnTypehintRule(false, false);
	}


	public function createService0444(): PHPStan\Rules\Properties\NullsafePropertyFetchRule
	{
		return new PHPStan\Rules\Properties\NullsafePropertyFetchRule;
	}


	public function createService0445(): PHPStan\Rules\Traits\TraitDeclarationCollector
	{
		return new PHPStan\Rules\Traits\TraitDeclarationCollector;
	}


	public function createService0446(): PHPStan\Rules\Traits\TraitUseCollector
	{
		return new PHPStan\Rules\Traits\TraitUseCollector;
	}


	public function createService0447(): PHPStan\Rules\Traits\NotAnalysedTraitRule
	{
		return new PHPStan\Rules\Traits\NotAnalysedTraitRule;
	}


	public function createService0448(): PHPStan\Rules\Exceptions\CatchWithUnthrownExceptionRule
	{
		return new PHPStan\Rules\Exceptions\CatchWithUnthrownExceptionRule($this->getService('exceptionTypeResolver'), true);
	}


	public function createService0449(): PHPStan\Rules\TooWideTypehints\TooWideFunctionParameterOutTypeRule
	{
		return new PHPStan\Rules\TooWideTypehints\TooWideFunctionParameterOutTypeRule($this->getService('0165'));
	}


	public function createService0450(): PHPStan\Rules\TooWideTypehints\TooWideMethodParameterOutTypeRule
	{
		return new PHPStan\Rules\TooWideTypehints\TooWideMethodParameterOutTypeRule($this->getService('0165'));
	}


	public function createService0451(): PHPStan\Rules\TooWideTypehints\TooWidePropertyTypeRule
	{
		return new PHPStan\Rules\TooWideTypehints\TooWidePropertyTypeRule($this->getService('0159'), $this->getService('0161'));
	}


	public function createService0452(): PHPStan\Rules\Functions\RandomIntParametersRule
	{
		return new PHPStan\Rules\Functions\RandomIntParametersRule($this->getService('reflectionProvider'), true);
	}


	public function createService0453(): PHPStan\Rules\Functions\ArrayFilterRule
	{
		return new PHPStan\Rules\Functions\ArrayFilterRule($this->getService('reflectionProvider'), true);
	}


	public function createService0454(): PHPStan\Rules\Functions\ArrayValuesRule
	{
		return new PHPStan\Rules\Functions\ArrayValuesRule($this->getService('reflectionProvider'), true);
	}


	public function createService0455(): PHPStan\Rules\Functions\CallUserFuncRule
	{
		return new PHPStan\Rules\Functions\CallUserFuncRule($this->getService('reflectionProvider'), $this->getService('0135'));
	}


	public function createService0456(): PHPStan\Rules\Functions\ImplodeFunctionRule
	{
		return new PHPStan\Rules\Functions\ImplodeFunctionRule(
			$this->getService('reflectionProvider'),
			$this->getService('0163'),
			false
		);
	}


	public function createService0457(): PHPStan\Rules\Functions\ParameterCastableToStringRule
	{
		return new PHPStan\Rules\Functions\ParameterCastableToStringRule(
			$this->getService('reflectionProvider'),
			$this->getService('0138')
		);
	}


	public function createService0458(): PHPStan\Rules\Functions\ImplodeParameterCastableToStringRule
	{
		return new PHPStan\Rules\Functions\ImplodeParameterCastableToStringRule(
			$this->getService('reflectionProvider'),
			$this->getService('0138')
		);
	}


	public function createService0459(): PHPStan\Rules\Functions\SortParameterCastableToStringRule
	{
		return new PHPStan\Rules\Functions\SortParameterCastableToStringRule(
			$this->getService('reflectionProvider'),
			$this->getService('0138')
		);
	}


	public function createService0460(): PHPStan\Rules\Functions\MissingFunctionParameterTypehintRule
	{
		return new PHPStan\Rules\Functions\MissingFunctionParameterTypehintRule($this->getService('0149'), false);
	}


	public function createService0461(): PHPStan\Rules\Methods\MissingMethodParameterTypehintRule
	{
		return new PHPStan\Rules\Methods\MissingMethodParameterTypehintRule($this->getService('0149'), false);
	}


	public function createService0462(): PHPStan\Rules\Methods\MissingMethodSelfOutTypeRule
	{
		return new PHPStan\Rules\Methods\MissingMethodSelfOutTypeRule($this->getService('0149'));
	}


	public function createServiceBetterReflectionClassReflector(): PHPStan\BetterReflection\Reflector\ClassReflector
	{
		return new PHPStan\BetterReflection\Reflector\ClassReflector($this->getService('betterReflectionSourceLocator'));
	}


	public function createServiceBetterReflectionConstantReflector(): PHPStan\BetterReflection\Reflector\ConstantReflector
	{
		return new PHPStan\BetterReflection\Reflector\ConstantReflector($this->getService('betterReflectionSourceLocator'));
	}


	public function createServiceBetterReflectionFunctionReflector(): PHPStan\BetterReflection\Reflector\FunctionReflector
	{
		return new PHPStan\BetterReflection\Reflector\FunctionReflector($this->getService('betterReflectionSourceLocator'));
	}


	public function createServiceBetterReflectionProvider(): PHPStan\Reflection\BetterReflection\BetterReflectionProvider
	{
		return new PHPStan\Reflection\BetterReflection\BetterReflectionProvider(
			$this->getService('0110'),
			$this->getService('088'),
			$this->getService('071'),
			$this->getService('betterReflectionReflector'),
			$this->getService('0166'),
			$this->getService('031'),
			$this->getService('023'),
			$this->getService('0111'),
			$this->getService('stubPhpDocProvider'),
			$this->getService('087'),
			$this->getService('relativePathHelper'),
			$this->getService('022'),
			$this->getService('078'),
			$this->getService('0334'),
			$this->getService('0116'),
			['stdClass']
		);
	}


	public function createServiceBetterReflectionReflector(): PHPStan\Reflection\BetterReflection\Reflector\MemoizingReflector
	{
		return new PHPStan\Reflection\BetterReflection\Reflector\MemoizingReflector($this->getService('originalBetterReflectionReflector'));
	}


	public function createServiceBetterReflectionSourceLocator(): PHPStan\BetterReflection\SourceLocator\Type\SourceLocator
	{
		return $this->getService('0331')->create();
	}


	public function createServiceBroker(): PHPStan\Broker\Broker
	{
		return $this->getService('brokerFactory')->create();
	}


	public function createServiceBrokerFactory(): PHPStan\Broker\BrokerFactory
	{
		return new PHPStan\Broker\BrokerFactory($this->getService('068'));
	}


	public function createServiceCacheStorage(): PHPStan\Cache\FileCacheStorage
	{
		return new PHPStan\Cache\FileCacheStorage('/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/../cache/phpstan/cache/PHPStan');
	}


	public function createServiceContainer(): Container_9bdc8b8877
	{
		return $this;
	}


	public function createServiceCurrentPhpVersionLexer(): PhpParser\Lexer
	{
		return $this->getService('02')->create();
	}


	public function createServiceCurrentPhpVersionPhpParser(): PhpParser\Parser\Php7
	{
		return new PhpParser\Parser\Php7($this->getService('currentPhpVersionLexer'));
	}


	public function createServiceCurrentPhpVersionRichParser(): PHPStan\Parser\RichParser
	{
		return new PHPStan\Parser\RichParser(
			$this->getService('currentPhpVersionPhpParser'),
			$this->getService('currentPhpVersionLexer'),
			$this->getService('03'),
			$this->getService('068'),
			$this->getService('050'),
			false
		);
	}


	public function createServiceCurrentPhpVersionSimpleDirectParser(): PHPStan\Parser\SimpleParser
	{
		return new PHPStan\Parser\SimpleParser($this->getService('currentPhpVersionPhpParser'), $this->getService('03'));
	}


	public function createServiceCurrentPhpVersionSimpleParser(): PHPStan\Parser\CleaningParser
	{
		return new PHPStan\Parser\CleaningParser($this->getService('currentPhpVersionSimpleDirectParser'), $this->getService('023'));
	}


	public function createServiceDefaultAnalysisParser(): PHPStan\Parser\CachedParser
	{
		return new PHPStan\Parser\CachedParser($this->getService('pathRoutingParser'), 256);
	}


	public function createServiceErrorFormatter__checkstyle(): PHPStan\Command\ErrorFormatter\CheckstyleErrorFormatter
	{
		return new PHPStan\Command\ErrorFormatter\CheckstyleErrorFormatter($this->getService('simpleRelativePathHelper'));
	}


	public function createServiceErrorFormatter__github(): PHPStan\Command\ErrorFormatter\GithubErrorFormatter
	{
		return new PHPStan\Command\ErrorFormatter\GithubErrorFormatter($this->getService('simpleRelativePathHelper'));
	}


	public function createServiceErrorFormatter__gitlab(): PHPStan\Command\ErrorFormatter\GitlabErrorFormatter
	{
		return new PHPStan\Command\ErrorFormatter\GitlabErrorFormatter($this->getService('simpleRelativePathHelper'));
	}


	public function createServiceErrorFormatter__json(): PHPStan\Command\ErrorFormatter\JsonErrorFormatter
	{
		return new PHPStan\Command\ErrorFormatter\JsonErrorFormatter(false);
	}


	public function createServiceErrorFormatter__junit(): PHPStan\Command\ErrorFormatter\JunitErrorFormatter
	{
		return new PHPStan\Command\ErrorFormatter\JunitErrorFormatter($this->getService('simpleRelativePathHelper'));
	}


	public function createServiceErrorFormatter__prettyJson(): PHPStan\Command\ErrorFormatter\JsonErrorFormatter
	{
		return new PHPStan\Command\ErrorFormatter\JsonErrorFormatter(true);
	}


	public function createServiceErrorFormatter__raw(): PHPStan\Command\ErrorFormatter\RawErrorFormatter
	{
		return new PHPStan\Command\ErrorFormatter\RawErrorFormatter;
	}


	public function createServiceErrorFormatter__table(): PHPStan\Command\ErrorFormatter\TableErrorFormatter
	{
		return new PHPStan\Command\ErrorFormatter\TableErrorFormatter(
			$this->getService('relativePathHelper'),
			$this->getService('simpleRelativePathHelper'),
			$this->getService('0337'),
			true,
			null,
			null
		);
	}


	public function createServiceErrorFormatter__teamcity(): PHPStan\Command\ErrorFormatter\TeamcityErrorFormatter
	{
		return new PHPStan\Command\ErrorFormatter\TeamcityErrorFormatter($this->getService('simpleRelativePathHelper'));
	}


	public function createServiceExceptionTypeResolver(): PHPStan\Rules\Exceptions\ExceptionTypeResolver
	{
		return $this->getService('0128');
	}


	public function createServiceFileExcluderAnalyse(): PHPStan\File\FileExcluder
	{
		return $this->getService('079')->createAnalyseFileExcluder();
	}


	public function createServiceFileExcluderScan(): PHPStan\File\FileExcluder
	{
		return $this->getService('079')->createScanFileExcluder();
	}


	public function createServiceFileFinderAnalyse(): PHPStan\File\FileFinder
	{
		return new PHPStan\File\FileFinder($this->getService('fileExcluderAnalyse'), $this->getService('078'), ['php']);
	}


	public function createServiceFileFinderScan(): PHPStan\File\FileFinder
	{
		return new PHPStan\File\FileFinder($this->getService('fileExcluderScan'), $this->getService('078'), ['php']);
	}


	public function createServiceNodeScopeResolverReflector(): PHPStan\Reflection\BetterReflection\Reflector\MemoizingReflector
	{
		return $this->getService('betterReflectionReflector');
	}


	public function createServiceOriginalBetterReflectionReflector(): PHPStan\BetterReflection\Reflector\DefaultReflector
	{
		return new PHPStan\BetterReflection\Reflector\DefaultReflector($this->getService('betterReflectionSourceLocator'));
	}


	public function createServiceParentDirectoryRelativePathHelper(): PHPStan\File\ParentDirectoryRelativePathHelper
	{
		return new PHPStan\File\ParentDirectoryRelativePathHelper('/home/sanderronde/git/phpstan-vscode/test/multi-config-demo');
	}


	public function createServicePathRoutingParser(): PHPStan\Parser\PathRoutingParser
	{
		return new PHPStan\Parser\PathRoutingParser(
			$this->getService('078'),
			$this->getService('currentPhpVersionRichParser'),
			$this->getService('currentPhpVersionSimpleParser'),
			$this->getService('php8Parser')
		);
	}


	public function createServicePhp8Lexer(): PhpParser\Lexer\Emulative
	{
		return $this->getService('02')->createEmulative();
	}


	public function createServicePhp8Parser(): PHPStan\Parser\SimpleParser
	{
		return new PHPStan\Parser\SimpleParser($this->getService('php8PhpParser'), $this->getService('03'));
	}


	public function createServicePhp8PhpParser(): PhpParser\Parser\Php7
	{
		return new PhpParser\Parser\Php7($this->getService('php8Lexer'));
	}


	public function createServicePhpParserDecorator(): PHPStan\Parser\PhpParserDecorator
	{
		return new PHPStan\Parser\PhpParserDecorator($this->getService('defaultAnalysisParser'));
	}


	public function createServicePhpstanDiagnoseExtension(): PHPStan\Diagnose\PHPStanDiagnoseExtension
	{
		return new PHPStan\Diagnose\PHPStanDiagnoseExtension(
			$this->getService('023'),
			$this->getService('078'),
			['/home/sanderronde/git/phpstan-vscode/test/multi-config-demo'],
			[
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/parametersSchema.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level9.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level8.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level7.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level6.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level5.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level4.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level3.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level2.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level1.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level0.neon',
				'/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/test/phpstan.neon',
			]
		);
	}


	public function createServiceReflectionProvider(): PHPStan\Reflection\ReflectionProvider
	{
		return $this->getService('reflectionProviderFactory')->create();
	}


	public function createServiceReflectionProviderFactory(): PHPStan\Reflection\ReflectionProvider\ReflectionProviderFactory
	{
		return new PHPStan\Reflection\ReflectionProvider\ReflectionProviderFactory($this->getService('betterReflectionProvider'));
	}


	public function createServiceRegistry(): PHPStan\Rules\LazyRegistry
	{
		return new PHPStan\Rules\LazyRegistry($this->getService('068'));
	}


	public function createServiceRelativePathHelper(): PHPStan\File\RelativePathHelper
	{
		return new PHPStan\File\FuzzyRelativePathHelper(
			$this->getService('parentDirectoryRelativePathHelper'),
			'/home/sanderronde/git/phpstan-vscode/test/multi-config-demo',
			$this->getParameter('analysedPaths')
		);
	}


	public function createServiceRules__0(): PHPStan\Rules\Debug\DumpTypeRule
	{
		return new PHPStan\Rules\Debug\DumpTypeRule($this->getService('reflectionProvider'));
	}


	public function createServiceRules__1(): PHPStan\Rules\Debug\FileAssertRule
	{
		return new PHPStan\Rules\Debug\FileAssertRule($this->getService('reflectionProvider'));
	}


	public function createServiceRules__10(): PHPStan\Rules\Api\PhpStanNamespaceIn3rdPartyPackageRule
	{
		return new PHPStan\Rules\Api\PhpStanNamespaceIn3rdPartyPackageRule($this->getService('0117'));
	}


	public function createServiceRules__100(): PHPStan\Rules\Generics\ClassTemplateTypeRule
	{
		return new PHPStan\Rules\Generics\ClassTemplateTypeRule($this->getService('0142'));
	}


	public function createServiceRules__101(): PHPStan\Rules\Generics\EnumAncestorsRule
	{
		return new PHPStan\Rules\Generics\EnumAncestorsRule($this->getService('0140'), $this->getService('0139'));
	}


	public function createServiceRules__102(): PHPStan\Rules\Generics\EnumTemplateTypeRule
	{
		return new PHPStan\Rules\Generics\EnumTemplateTypeRule;
	}


	public function createServiceRules__103(): PHPStan\Rules\Generics\FunctionTemplateTypeRule
	{
		return new PHPStan\Rules\Generics\FunctionTemplateTypeRule($this->getService('0166'), $this->getService('0142'));
	}


	public function createServiceRules__104(): PHPStan\Rules\Generics\FunctionSignatureVarianceRule
	{
		return new PHPStan\Rules\Generics\FunctionSignatureVarianceRule($this->getService('0143'));
	}


	public function createServiceRules__105(): PHPStan\Rules\Generics\InterfaceAncestorsRule
	{
		return new PHPStan\Rules\Generics\InterfaceAncestorsRule($this->getService('0140'), $this->getService('0139'));
	}


	public function createServiceRules__106(): PHPStan\Rules\Generics\InterfaceTemplateTypeRule
	{
		return new PHPStan\Rules\Generics\InterfaceTemplateTypeRule($this->getService('0142'));
	}


	public function createServiceRules__107(): PHPStan\Rules\Generics\MethodTemplateTypeRule
	{
		return new PHPStan\Rules\Generics\MethodTemplateTypeRule($this->getService('0166'), $this->getService('0142'));
	}


	public function createServiceRules__108(): PHPStan\Rules\Generics\MethodTagTemplateTypeRule
	{
		return new PHPStan\Rules\Generics\MethodTagTemplateTypeRule($this->getService('0166'), $this->getService('0142'));
	}


	public function createServiceRules__109(): PHPStan\Rules\Generics\MethodSignatureVarianceRule
	{
		return new PHPStan\Rules\Generics\MethodSignatureVarianceRule($this->getService('0143'));
	}


	public function createServiceRules__11(): PHPStan\Rules\Arrays\DuplicateKeysInLiteralArraysRule
	{
		return new PHPStan\Rules\Arrays\DuplicateKeysInLiteralArraysRule($this->getService('020'));
	}


	public function createServiceRules__110(): PHPStan\Rules\Generics\TraitTemplateTypeRule
	{
		return new PHPStan\Rules\Generics\TraitTemplateTypeRule($this->getService('0166'), $this->getService('0142'));
	}


	public function createServiceRules__111(): PHPStan\Rules\Generics\UsedTraitsRule
	{
		return new PHPStan\Rules\Generics\UsedTraitsRule($this->getService('0166'), $this->getService('0140'));
	}


	public function createServiceRules__112(): PHPStan\Rules\Methods\CallPrivateMethodThroughStaticRule
	{
		return new PHPStan\Rules\Methods\CallPrivateMethodThroughStaticRule;
	}


	public function createServiceRules__113(): PHPStan\Rules\Methods\IncompatibleDefaultParameterTypeRule
	{
		return new PHPStan\Rules\Methods\IncompatibleDefaultParameterTypeRule;
	}


	public function createServiceRules__114(): PHPStan\Rules\Operators\InvalidComparisonOperationRule
	{
		return new PHPStan\Rules\Operators\InvalidComparisonOperationRule($this->getService('0163'));
	}


	public function createServiceRules__115(): PHPStan\Rules\PhpDoc\FunctionConditionalReturnTypeRule
	{
		return new PHPStan\Rules\PhpDoc\FunctionConditionalReturnTypeRule($this->getService('0153'));
	}


	public function createServiceRules__116(): PHPStan\Rules\PhpDoc\MethodConditionalReturnTypeRule
	{
		return new PHPStan\Rules\PhpDoc\MethodConditionalReturnTypeRule($this->getService('0153'));
	}


	public function createServiceRules__117(): PHPStan\Rules\PhpDoc\FunctionAssertRule
	{
		return new PHPStan\Rules\PhpDoc\FunctionAssertRule($this->getService('0154'));
	}


	public function createServiceRules__118(): PHPStan\Rules\PhpDoc\MethodAssertRule
	{
		return new PHPStan\Rules\PhpDoc\MethodAssertRule($this->getService('0154'));
	}


	public function createServiceRules__119(): PHPStan\Rules\PhpDoc\IncompatibleSelfOutTypeRule
	{
		return new PHPStan\Rules\PhpDoc\IncompatibleSelfOutTypeRule($this->getService('0155'), $this->getService('0141'));
	}


	public function createServiceRules__12(): PHPStan\Rules\Arrays\EmptyArrayItemRule
	{
		return new PHPStan\Rules\Arrays\EmptyArrayItemRule;
	}


	public function createServiceRules__120(): PHPStan\Rules\PhpDoc\IncompatibleClassConstantPhpDocTypeRule
	{
		return new PHPStan\Rules\PhpDoc\IncompatibleClassConstantPhpDocTypeRule($this->getService('0141'), $this->getService('0155'));
	}


	public function createServiceRules__121(): PHPStan\Rules\PhpDoc\IncompatiblePhpDocTypeRule
	{
		return new PHPStan\Rules\PhpDoc\IncompatiblePhpDocTypeRule(
			$this->getService('0166'),
			$this->getService('0141'),
			$this->getService('0155'),
			$this->getService('0156')
		);
	}


	public function createServiceRules__122(): PHPStan\Rules\PhpDoc\IncompatiblePropertyPhpDocTypeRule
	{
		return new PHPStan\Rules\PhpDoc\IncompatiblePropertyPhpDocTypeRule(
			$this->getService('0141'),
			$this->getService('0155'),
			$this->getService('0156')
		);
	}


	public function createServiceRules__123(): PHPStan\Rules\PhpDoc\InvalidThrowsPhpDocValueRule
	{
		return new PHPStan\Rules\PhpDoc\InvalidThrowsPhpDocValueRule($this->getService('0166'));
	}


	public function createServiceRules__124(): PHPStan\Rules\PhpDoc\IncompatibleParamImmediatelyInvokedCallableRule
	{
		return new PHPStan\Rules\PhpDoc\IncompatibleParamImmediatelyInvokedCallableRule($this->getService('0166'));
	}


	public function createServiceRules__125(): PHPStan\Rules\Properties\AccessPrivatePropertyThroughStaticRule
	{
		return new PHPStan\Rules\Properties\AccessPrivatePropertyThroughStaticRule;
	}


	public function createServiceRules__126(): PHPStan\Rules\Classes\RequireImplementsRule
	{
		return new PHPStan\Rules\Classes\RequireImplementsRule;
	}


	public function createServiceRules__127(): PHPStan\Rules\Classes\RequireExtendsRule
	{
		return new PHPStan\Rules\Classes\RequireExtendsRule;
	}


	public function createServiceRules__128(): PHPStan\Rules\PhpDoc\RequireImplementsDefinitionClassRule
	{
		return new PHPStan\Rules\PhpDoc\RequireImplementsDefinitionClassRule;
	}


	public function createServiceRules__129(): PHPStan\Rules\PhpDoc\RequireExtendsDefinitionClassRule
	{
		return new PHPStan\Rules\PhpDoc\RequireExtendsDefinitionClassRule($this->getService('0379'));
	}


	public function createServiceRules__13(): PHPStan\Rules\Arrays\OffsetAccessWithoutDimForReadingRule
	{
		return new PHPStan\Rules\Arrays\OffsetAccessWithoutDimForReadingRule;
	}


	public function createServiceRules__130(): PHPStan\Rules\PhpDoc\RequireExtendsDefinitionTraitRule
	{
		return new PHPStan\Rules\PhpDoc\RequireExtendsDefinitionTraitRule(
			$this->getService('reflectionProvider'),
			$this->getService('0379')
		);
	}


	public function createServiceRules__131(): PHPStan\Rules\Arrays\ArrayDestructuringRule
	{
		return new PHPStan\Rules\Arrays\ArrayDestructuringRule($this->getService('0163'), $this->getService('0119'));
	}


	public function createServiceRules__132(): PHPStan\Rules\Arrays\IterableInForeachRule
	{
		return new PHPStan\Rules\Arrays\IterableInForeachRule($this->getService('0163'));
	}


	public function createServiceRules__133(): PHPStan\Rules\Arrays\OffsetAccessAssignmentRule
	{
		return new PHPStan\Rules\Arrays\OffsetAccessAssignmentRule($this->getService('0163'));
	}


	public function createServiceRules__134(): PHPStan\Rules\Arrays\OffsetAccessAssignOpRule
	{
		return new PHPStan\Rules\Arrays\OffsetAccessAssignOpRule($this->getService('0163'));
	}


	public function createServiceRules__135(): PHPStan\Rules\Arrays\OffsetAccessValueAssignmentRule
	{
		return new PHPStan\Rules\Arrays\OffsetAccessValueAssignmentRule($this->getService('0163'));
	}


	public function createServiceRules__136(): PHPStan\Rules\Arrays\UnpackIterableInArrayRule
	{
		return new PHPStan\Rules\Arrays\UnpackIterableInArrayRule($this->getService('0163'));
	}


	public function createServiceRules__137(): PHPStan\Rules\Exceptions\ThrowExprTypeRule
	{
		return new PHPStan\Rules\Exceptions\ThrowExprTypeRule($this->getService('0163'));
	}


	public function createServiceRules__138(): PHPStan\Rules\Functions\ArrowFunctionReturnTypeRule
	{
		return new PHPStan\Rules\Functions\ArrowFunctionReturnTypeRule($this->getService('0137'));
	}


	public function createServiceRules__139(): PHPStan\Rules\Functions\ClosureReturnTypeRule
	{
		return new PHPStan\Rules\Functions\ClosureReturnTypeRule($this->getService('0137'));
	}


	public function createServiceRules__14(): PHPStan\Rules\Cast\UnsetCastRule
	{
		return new PHPStan\Rules\Cast\UnsetCastRule($this->getService('023'));
	}


	public function createServiceRules__140(): PHPStan\Rules\Functions\ReturnTypeRule
	{
		return new PHPStan\Rules\Functions\ReturnTypeRule($this->getService('0137'));
	}


	public function createServiceRules__141(): PHPStan\Rules\Generators\YieldTypeRule
	{
		return new PHPStan\Rules\Generators\YieldTypeRule($this->getService('0163'));
	}


	public function createServiceRules__142(): PHPStan\Rules\Methods\ReturnTypeRule
	{
		return new PHPStan\Rules\Methods\ReturnTypeRule($this->getService('0137'));
	}


	public function createServiceRules__143(): PHPStan\Rules\Properties\DefaultValueTypesAssignedToPropertiesRule
	{
		return new PHPStan\Rules\Properties\DefaultValueTypesAssignedToPropertiesRule($this->getService('0163'));
	}


	public function createServiceRules__144(): PHPStan\Rules\Properties\ReadOnlyPropertyAssignRule
	{
		return new PHPStan\Rules\Properties\ReadOnlyPropertyAssignRule($this->getService('0161'), $this->getService('0368'));
	}


	public function createServiceRules__145(): PHPStan\Rules\Properties\ReadOnlyPropertyAssignRefRule
	{
		return new PHPStan\Rules\Properties\ReadOnlyPropertyAssignRefRule($this->getService('0161'));
	}


	public function createServiceRules__146(): PHPStan\Rules\Properties\TypesAssignedToPropertiesRule
	{
		return new PHPStan\Rules\Properties\TypesAssignedToPropertiesRule($this->getService('0163'), $this->getService('0161'));
	}


	public function createServiceRules__147(): PHPStan\Rules\Variables\ThrowTypeRule
	{
		return new PHPStan\Rules\Variables\ThrowTypeRule($this->getService('0163'));
	}


	public function createServiceRules__148(): PHPStan\Rules\Variables\VariableCloningRule
	{
		return new PHPStan\Rules\Variables\VariableCloningRule($this->getService('0163'));
	}


	public function createServiceRules__149(): PHPStan\Rules\Arrays\DeadForeachRule
	{
		return new PHPStan\Rules\Arrays\DeadForeachRule;
	}


	public function createServiceRules__15(): PHPStan\Rules\Classes\AllowedSubTypesRule
	{
		return new PHPStan\Rules\Classes\AllowedSubTypesRule;
	}


	public function createServiceRules__150(): PHPStan\Rules\DeadCode\UnreachableStatementRule
	{
		return new PHPStan\Rules\DeadCode\UnreachableStatementRule;
	}


	public function createServiceRules__151(): PHPStan\Rules\DeadCode\UnusedPrivateConstantRule
	{
		return new PHPStan\Rules\DeadCode\UnusedPrivateConstantRule($this->getService('0151'));
	}


	public function createServiceRules__152(): PHPStan\Rules\DeadCode\UnusedPrivateMethodRule
	{
		return new PHPStan\Rules\DeadCode\UnusedPrivateMethodRule($this->getService('0152'));
	}


	public function createServiceRules__153(): PHPStan\Rules\Exceptions\OverwrittenExitPointByFinallyRule
	{
		return new PHPStan\Rules\Exceptions\OverwrittenExitPointByFinallyRule;
	}


	public function createServiceRules__154(): PHPStan\Rules\Functions\CallToFunctionStatementWithoutSideEffectsRule
	{
		return new PHPStan\Rules\Functions\CallToFunctionStatementWithoutSideEffectsRule($this->getService('reflectionProvider'));
	}


	public function createServiceRules__155(): PHPStan\Rules\Methods\CallToMethodStatementWithoutSideEffectsRule
	{
		return new PHPStan\Rules\Methods\CallToMethodStatementWithoutSideEffectsRule($this->getService('0163'));
	}


	public function createServiceRules__156(): PHPStan\Rules\Methods\CallToStaticMethodStatementWithoutSideEffectsRule
	{
		return new PHPStan\Rules\Methods\CallToStaticMethodStatementWithoutSideEffectsRule(
			$this->getService('0163'),
			$this->getService('reflectionProvider')
		);
	}


	public function createServiceRules__157(): PHPStan\Rules\Methods\NullsafeMethodCallRule
	{
		return new PHPStan\Rules\Methods\NullsafeMethodCallRule;
	}


	public function createServiceRules__158(): PHPStan\Rules\TooWideTypehints\TooWideArrowFunctionReturnTypehintRule
	{
		return new PHPStan\Rules\TooWideTypehints\TooWideArrowFunctionReturnTypehintRule;
	}


	public function createServiceRules__159(): PHPStan\Rules\TooWideTypehints\TooWideClosureReturnTypehintRule
	{
		return new PHPStan\Rules\TooWideTypehints\TooWideClosureReturnTypehintRule;
	}


	public function createServiceRules__16(): PHPStan\Rules\Classes\ClassAttributesRule
	{
		return new PHPStan\Rules\Classes\ClassAttributesRule($this->getService('0118'));
	}


	public function createServiceRules__160(): PHPStan\Rules\TooWideTypehints\TooWideFunctionReturnTypehintRule
	{
		return new PHPStan\Rules\TooWideTypehints\TooWideFunctionReturnTypehintRule;
	}


	public function createServiceRules__161(): PHPStan\Rules\DateTimeInstantiationRule
	{
		return new PHPStan\Rules\DateTimeInstantiationRule;
	}


	public function createServiceRules__162(): PHPStan\Rules\Constants\MissingClassConstantTypehintRule
	{
		return new PHPStan\Rules\Constants\MissingClassConstantTypehintRule($this->getService('0149'));
	}


	public function createServiceRules__163(): PHPStan\Rules\Functions\MissingFunctionReturnTypehintRule
	{
		return new PHPStan\Rules\Functions\MissingFunctionReturnTypehintRule($this->getService('0149'));
	}


	public function createServiceRules__164(): PHPStan\Rules\Methods\MissingMethodReturnTypehintRule
	{
		return new PHPStan\Rules\Methods\MissingMethodReturnTypehintRule($this->getService('0149'));
	}


	public function createServiceRules__165(): PHPStan\Rules\Properties\MissingPropertyTypehintRule
	{
		return new PHPStan\Rules\Properties\MissingPropertyTypehintRule($this->getService('0149'));
	}


	public function createServiceRules__17(): PHPStan\Rules\Classes\ClassConstantAttributesRule
	{
		return new PHPStan\Rules\Classes\ClassConstantAttributesRule($this->getService('0118'));
	}


	public function createServiceRules__18(): PHPStan\Rules\Classes\ClassConstantRule
	{
		return new PHPStan\Rules\Classes\ClassConstantRule(
			$this->getService('reflectionProvider'),
			$this->getService('0163'),
			$this->getService('0120'),
			$this->getService('023')
		);
	}


	public function createServiceRules__19(): PHPStan\Rules\Classes\DuplicateDeclarationRule
	{
		return new PHPStan\Rules\Classes\DuplicateDeclarationRule;
	}


	public function createServiceRules__2(): PHPStan\Rules\Api\ApiInstantiationRule
	{
		return new PHPStan\Rules\Api\ApiInstantiationRule($this->getService('0117'), $this->getService('reflectionProvider'));
	}


	public function createServiceRules__20(): PHPStan\Rules\Classes\EnumSanityRule
	{
		return new PHPStan\Rules\Classes\EnumSanityRule;
	}


	public function createServiceRules__21(): PHPStan\Rules\Classes\ExistingClassesInClassImplementsRule
	{
		return new PHPStan\Rules\Classes\ExistingClassesInClassImplementsRule(
			$this->getService('0120'),
			$this->getService('reflectionProvider')
		);
	}


	public function createServiceRules__22(): PHPStan\Rules\Classes\ExistingClassesInEnumImplementsRule
	{
		return new PHPStan\Rules\Classes\ExistingClassesInEnumImplementsRule(
			$this->getService('0120'),
			$this->getService('reflectionProvider')
		);
	}


	public function createServiceRules__23(): PHPStan\Rules\Classes\ExistingClassesInInterfaceExtendsRule
	{
		return new PHPStan\Rules\Classes\ExistingClassesInInterfaceExtendsRule(
			$this->getService('0120'),
			$this->getService('reflectionProvider')
		);
	}


	public function createServiceRules__24(): PHPStan\Rules\Classes\ExistingClassInTraitUseRule
	{
		return new PHPStan\Rules\Classes\ExistingClassInTraitUseRule($this->getService('0120'), $this->getService('reflectionProvider'));
	}


	public function createServiceRules__25(): PHPStan\Rules\Classes\InstantiationRule
	{
		return new PHPStan\Rules\Classes\InstantiationRule(
			$this->getService('reflectionProvider'),
			$this->getService('0135'),
			$this->getService('0120')
		);
	}


	public function createServiceRules__26(): PHPStan\Rules\Classes\InstantiationCallableRule
	{
		return new PHPStan\Rules\Classes\InstantiationCallableRule;
	}


	public function createServiceRules__27(): PHPStan\Rules\Classes\InvalidPromotedPropertiesRule
	{
		return new PHPStan\Rules\Classes\InvalidPromotedPropertiesRule($this->getService('023'));
	}


	public function createServiceRules__28(): PHPStan\Rules\Classes\LocalTypeAliasesRule
	{
		return new PHPStan\Rules\Classes\LocalTypeAliasesRule($this->getService('0123'));
	}


	public function createServiceRules__29(): PHPStan\Rules\Classes\LocalTypeTraitAliasesRule
	{
		return new PHPStan\Rules\Classes\LocalTypeTraitAliasesRule($this->getService('0123'), $this->getService('reflectionProvider'));
	}


	public function createServiceRules__3(): PHPStan\Rules\Api\ApiClassExtendsRule
	{
		return new PHPStan\Rules\Api\ApiClassExtendsRule($this->getService('0117'), $this->getService('reflectionProvider'));
	}


	public function createServiceRules__30(): PHPStan\Rules\Classes\NewStaticRule
	{
		return new PHPStan\Rules\Classes\NewStaticRule;
	}


	public function createServiceRules__31(): PHPStan\Rules\Classes\NonClassAttributeClassRule
	{
		return new PHPStan\Rules\Classes\NonClassAttributeClassRule;
	}


	public function createServiceRules__32(): PHPStan\Rules\Classes\ReadOnlyClassRule
	{
		return new PHPStan\Rules\Classes\ReadOnlyClassRule($this->getService('023'));
	}


	public function createServiceRules__33(): PHPStan\Rules\Classes\TraitAttributeClassRule
	{
		return new PHPStan\Rules\Classes\TraitAttributeClassRule;
	}


	public function createServiceRules__34(): PHPStan\Rules\Constants\DynamicClassConstantFetchRule
	{
		return new PHPStan\Rules\Constants\DynamicClassConstantFetchRule($this->getService('023'), $this->getService('0163'));
	}


	public function createServiceRules__35(): PHPStan\Rules\Constants\FinalConstantRule
	{
		return new PHPStan\Rules\Constants\FinalConstantRule($this->getService('023'));
	}


	public function createServiceRules__36(): PHPStan\Rules\Constants\NativeTypedClassConstantRule
	{
		return new PHPStan\Rules\Constants\NativeTypedClassConstantRule($this->getService('023'));
	}


	public function createServiceRules__37(): PHPStan\Rules\EnumCases\EnumCaseAttributesRule
	{
		return new PHPStan\Rules\EnumCases\EnumCaseAttributesRule($this->getService('0118'));
	}


	public function createServiceRules__38(): PHPStan\Rules\Exceptions\NoncapturingCatchRule
	{
		return new PHPStan\Rules\Exceptions\NoncapturingCatchRule($this->getService('023'));
	}


	public function createServiceRules__39(): PHPStan\Rules\Exceptions\ThrowExpressionRule
	{
		return new PHPStan\Rules\Exceptions\ThrowExpressionRule($this->getService('023'));
	}


	public function createServiceRules__4(): PHPStan\Rules\Api\ApiClassImplementsRule
	{
		return new PHPStan\Rules\Api\ApiClassImplementsRule($this->getService('0117'), $this->getService('reflectionProvider'));
	}


	public function createServiceRules__40(): PHPStan\Rules\Functions\ArrowFunctionAttributesRule
	{
		return new PHPStan\Rules\Functions\ArrowFunctionAttributesRule($this->getService('0118'));
	}


	public function createServiceRules__41(): PHPStan\Rules\Functions\ArrowFunctionReturnNullsafeByRefRule
	{
		return new PHPStan\Rules\Functions\ArrowFunctionReturnNullsafeByRefRule($this->getService('0150'));
	}


	public function createServiceRules__42(): PHPStan\Rules\Functions\ClosureAttributesRule
	{
		return new PHPStan\Rules\Functions\ClosureAttributesRule($this->getService('0118'));
	}


	public function createServiceRules__43(): PHPStan\Rules\Functions\DefineParametersRule
	{
		return new PHPStan\Rules\Functions\DefineParametersRule($this->getService('023'));
	}


	public function createServiceRules__44(): PHPStan\Rules\Functions\ExistingClassesInArrowFunctionTypehintsRule
	{
		return new PHPStan\Rules\Functions\ExistingClassesInArrowFunctionTypehintsRule(
			$this->getService('0136'),
			$this->getService('023')
		);
	}


	public function createServiceRules__45(): PHPStan\Rules\Functions\CallToFunctionParametersRule
	{
		return new PHPStan\Rules\Functions\CallToFunctionParametersRule(
			$this->getService('reflectionProvider'),
			$this->getService('0135')
		);
	}


	public function createServiceRules__46(): PHPStan\Rules\Functions\ExistingClassesInClosureTypehintsRule
	{
		return new PHPStan\Rules\Functions\ExistingClassesInClosureTypehintsRule($this->getService('0136'));
	}


	public function createServiceRules__47(): PHPStan\Rules\Functions\ExistingClassesInTypehintsRule
	{
		return new PHPStan\Rules\Functions\ExistingClassesInTypehintsRule($this->getService('0136'));
	}


	public function createServiceRules__48(): PHPStan\Rules\Functions\FunctionAttributesRule
	{
		return new PHPStan\Rules\Functions\FunctionAttributesRule($this->getService('0118'));
	}


	public function createServiceRules__49(): PHPStan\Rules\Functions\InnerFunctionRule
	{
		return new PHPStan\Rules\Functions\InnerFunctionRule;
	}


	public function createServiceRules__5(): PHPStan\Rules\Api\ApiInterfaceExtendsRule
	{
		return new PHPStan\Rules\Api\ApiInterfaceExtendsRule($this->getService('0117'), $this->getService('reflectionProvider'));
	}


	public function createServiceRules__50(): PHPStan\Rules\Functions\InvalidLexicalVariablesInClosureUseRule
	{
		return new PHPStan\Rules\Functions\InvalidLexicalVariablesInClosureUseRule;
	}


	public function createServiceRules__51(): PHPStan\Rules\Functions\ParamAttributesRule
	{
		return new PHPStan\Rules\Functions\ParamAttributesRule($this->getService('0118'));
	}


	public function createServiceRules__52(): PHPStan\Rules\Functions\PrintfParametersRule
	{
		return new PHPStan\Rules\Functions\PrintfParametersRule($this->getService('0330'), $this->getService('reflectionProvider'));
	}


	public function createServiceRules__53(): PHPStan\Rules\Functions\RedefinedParametersRule
	{
		return new PHPStan\Rules\Functions\RedefinedParametersRule;
	}


	public function createServiceRules__54(): PHPStan\Rules\Functions\ReturnNullsafeByRefRule
	{
		return new PHPStan\Rules\Functions\ReturnNullsafeByRefRule($this->getService('0150'));
	}


	public function createServiceRules__55(): PHPStan\Rules\Ignore\IgnoreParseErrorRule
	{
		return new PHPStan\Rules\Ignore\IgnoreParseErrorRule;
	}


	public function createServiceRules__56(): PHPStan\Rules\Functions\VariadicParametersDeclarationRule
	{
		return new PHPStan\Rules\Functions\VariadicParametersDeclarationRule;
	}


	public function createServiceRules__57(): PHPStan\Rules\Keywords\ContinueBreakInLoopRule
	{
		return new PHPStan\Rules\Keywords\ContinueBreakInLoopRule;
	}


	public function createServiceRules__58(): PHPStan\Rules\Keywords\DeclareStrictTypesRule
	{
		return new PHPStan\Rules\Keywords\DeclareStrictTypesRule($this->getService('020'));
	}


	public function createServiceRules__59(): PHPStan\Rules\Methods\AbstractMethodInNonAbstractClassRule
	{
		return new PHPStan\Rules\Methods\AbstractMethodInNonAbstractClassRule;
	}


	public function createServiceRules__6(): PHPStan\Rules\Api\ApiMethodCallRule
	{
		return new PHPStan\Rules\Api\ApiMethodCallRule($this->getService('0117'));
	}


	public function createServiceRules__60(): PHPStan\Rules\Methods\AbstractPrivateMethodRule
	{
		return new PHPStan\Rules\Methods\AbstractPrivateMethodRule;
	}


	public function createServiceRules__61(): PHPStan\Rules\Methods\CallMethodsRule
	{
		return new PHPStan\Rules\Methods\CallMethodsRule($this->getService('0145'), $this->getService('0135'));
	}


	public function createServiceRules__62(): PHPStan\Rules\Methods\CallStaticMethodsRule
	{
		return new PHPStan\Rules\Methods\CallStaticMethodsRule($this->getService('0146'), $this->getService('0135'));
	}


	public function createServiceRules__63(): PHPStan\Rules\Methods\ConstructorReturnTypeRule
	{
		return new PHPStan\Rules\Methods\ConstructorReturnTypeRule;
	}


	public function createServiceRules__64(): PHPStan\Rules\Methods\ExistingClassesInTypehintsRule
	{
		return new PHPStan\Rules\Methods\ExistingClassesInTypehintsRule($this->getService('0136'));
	}


	public function createServiceRules__65(): PHPStan\Rules\Methods\FinalPrivateMethodRule
	{
		return new PHPStan\Rules\Methods\FinalPrivateMethodRule($this->getService('023'));
	}


	public function createServiceRules__66(): PHPStan\Rules\Methods\MethodCallableRule
	{
		return new PHPStan\Rules\Methods\MethodCallableRule($this->getService('0145'), $this->getService('023'));
	}


	public function createServiceRules__67(): PHPStan\Rules\Methods\MethodVisibilityInInterfaceRule
	{
		return new PHPStan\Rules\Methods\MethodVisibilityInInterfaceRule;
	}


	public function createServiceRules__68(): PHPStan\Rules\Methods\MissingMethodImplementationRule
	{
		return new PHPStan\Rules\Methods\MissingMethodImplementationRule;
	}


	public function createServiceRules__69(): PHPStan\Rules\Methods\MethodAttributesRule
	{
		return new PHPStan\Rules\Methods\MethodAttributesRule($this->getService('0118'));
	}


	public function createServiceRules__7(): PHPStan\Rules\Api\ApiStaticCallRule
	{
		return new PHPStan\Rules\Api\ApiStaticCallRule($this->getService('0117'), $this->getService('reflectionProvider'));
	}


	public function createServiceRules__70(): PHPStan\Rules\Methods\StaticMethodCallableRule
	{
		return new PHPStan\Rules\Methods\StaticMethodCallableRule($this->getService('0146'), $this->getService('023'));
	}


	public function createServiceRules__71(): PHPStan\Rules\Names\UsedNamesRule
	{
		return new PHPStan\Rules\Names\UsedNamesRule;
	}


	public function createServiceRules__72(): PHPStan\Rules\Operators\InvalidAssignVarRule
	{
		return new PHPStan\Rules\Operators\InvalidAssignVarRule($this->getService('0150'));
	}


	public function createServiceRules__73(): PHPStan\Rules\Properties\AccessPropertiesInAssignRule
	{
		return new PHPStan\Rules\Properties\AccessPropertiesInAssignRule($this->getService('0355'));
	}


	public function createServiceRules__74(): PHPStan\Rules\Properties\AccessStaticPropertiesInAssignRule
	{
		return new PHPStan\Rules\Properties\AccessStaticPropertiesInAssignRule($this->getService('0356'));
	}


	public function createServiceRules__75(): PHPStan\Rules\Properties\InvalidCallablePropertyTypeRule
	{
		return new PHPStan\Rules\Properties\InvalidCallablePropertyTypeRule;
	}


	public function createServiceRules__76(): PHPStan\Rules\Properties\MissingReadOnlyPropertyAssignRule
	{
		return new PHPStan\Rules\Properties\MissingReadOnlyPropertyAssignRule($this->getService('0368'));
	}


	public function createServiceRules__77(): PHPStan\Rules\Properties\PropertiesInInterfaceRule
	{
		return new PHPStan\Rules\Properties\PropertiesInInterfaceRule;
	}


	public function createServiceRules__78(): PHPStan\Rules\Properties\PropertyAttributesRule
	{
		return new PHPStan\Rules\Properties\PropertyAttributesRule($this->getService('0118'));
	}


	public function createServiceRules__79(): PHPStan\Rules\Properties\ReadOnlyPropertyRule
	{
		return new PHPStan\Rules\Properties\ReadOnlyPropertyRule($this->getService('023'));
	}


	public function createServiceRules__8(): PHPStan\Rules\Api\ApiTraitUseRule
	{
		return new PHPStan\Rules\Api\ApiTraitUseRule($this->getService('0117'), $this->getService('reflectionProvider'));
	}


	public function createServiceRules__80(): PHPStan\Rules\Traits\ConflictingTraitConstantsRule
	{
		return new PHPStan\Rules\Traits\ConflictingTraitConstantsRule($this->getService('088'));
	}


	public function createServiceRules__81(): PHPStan\Rules\Traits\ConstantsInTraitsRule
	{
		return new PHPStan\Rules\Traits\ConstantsInTraitsRule($this->getService('023'));
	}


	public function createServiceRules__82(): PHPStan\Rules\Types\InvalidTypesInUnionRule
	{
		return new PHPStan\Rules\Types\InvalidTypesInUnionRule;
	}


	public function createServiceRules__83(): PHPStan\Rules\Variables\UnsetRule
	{
		return new PHPStan\Rules\Variables\UnsetRule;
	}


	public function createServiceRules__84(): PHPStan\Rules\Whitespace\FileWhitespaceRule
	{
		return new PHPStan\Rules\Whitespace\FileWhitespaceRule;
	}


	public function createServiceRules__85(): PHPStan\Rules\Classes\UnusedConstructorParametersRule
	{
		return new PHPStan\Rules\Classes\UnusedConstructorParametersRule($this->getService('0164'));
	}


	public function createServiceRules__86(): PHPStan\Rules\Constants\ConstantRule
	{
		return new PHPStan\Rules\Constants\ConstantRule;
	}


	public function createServiceRules__87(): PHPStan\Rules\Functions\UnusedClosureUsesRule
	{
		return new PHPStan\Rules\Functions\UnusedClosureUsesRule($this->getService('0164'));
	}


	public function createServiceRules__88(): PHPStan\Rules\Variables\EmptyRule
	{
		return new PHPStan\Rules\Variables\EmptyRule($this->getService('0144'));
	}


	public function createServiceRules__89(): PHPStan\Rules\Variables\IssetRule
	{
		return new PHPStan\Rules\Variables\IssetRule($this->getService('0144'));
	}


	public function createServiceRules__9(): PHPStan\Rules\Api\GetTemplateTypeRule
	{
		return new PHPStan\Rules\Api\GetTemplateTypeRule($this->getService('reflectionProvider'));
	}


	public function createServiceRules__90(): PHPStan\Rules\Variables\NullCoalesceRule
	{
		return new PHPStan\Rules\Variables\NullCoalesceRule($this->getService('0144'));
	}


	public function createServiceRules__91(): PHPStan\Rules\Cast\EchoRule
	{
		return new PHPStan\Rules\Cast\EchoRule($this->getService('0163'));
	}


	public function createServiceRules__92(): PHPStan\Rules\Cast\InvalidCastRule
	{
		return new PHPStan\Rules\Cast\InvalidCastRule($this->getService('reflectionProvider'), $this->getService('0163'));
	}


	public function createServiceRules__93(): PHPStan\Rules\Cast\InvalidPartOfEncapsedStringRule
	{
		return new PHPStan\Rules\Cast\InvalidPartOfEncapsedStringRule($this->getService('020'), $this->getService('0163'));
	}


	public function createServiceRules__94(): PHPStan\Rules\Cast\PrintRule
	{
		return new PHPStan\Rules\Cast\PrintRule($this->getService('0163'));
	}


	public function createServiceRules__95(): PHPStan\Rules\Classes\AccessPrivateConstantThroughStaticRule
	{
		return new PHPStan\Rules\Classes\AccessPrivateConstantThroughStaticRule;
	}


	public function createServiceRules__96(): PHPStan\Rules\Comparison\UsageOfVoidMatchExpressionRule
	{
		return new PHPStan\Rules\Comparison\UsageOfVoidMatchExpressionRule;
	}


	public function createServiceRules__97(): PHPStan\Rules\Constants\ValueAssignedToClassConstantRule
	{
		return new PHPStan\Rules\Constants\ValueAssignedToClassConstantRule;
	}


	public function createServiceRules__98(): PHPStan\Rules\Functions\IncompatibleDefaultParameterTypeRule
	{
		return new PHPStan\Rules\Functions\IncompatibleDefaultParameterTypeRule;
	}


	public function createServiceRules__99(): PHPStan\Rules\Generics\ClassAncestorsRule
	{
		return new PHPStan\Rules\Generics\ClassAncestorsRule($this->getService('0140'), $this->getService('0139'));
	}


	public function createServiceSimpleRelativePathHelper(): PHPStan\File\RelativePathHelper
	{
		return new PHPStan\File\SimpleRelativePathHelper('/home/sanderronde/git/phpstan-vscode/test/multi-config-demo');
	}


	public function createServiceStubPhpDocProvider(): PHPStan\PhpDoc\StubPhpDocProvider
	{
		return new PHPStan\PhpDoc\StubPhpDocProvider(
			$this->getService('defaultAnalysisParser'),
			$this->getService('0166'),
			$this->getService('041')
		);
	}


	public function createServiceTypeSpecifier(): PHPStan\Analyser\TypeSpecifier
	{
		return $this->getService('typeSpecifierFactory')->create();
	}


	public function createServiceTypeSpecifierFactory(): PHPStan\Analyser\TypeSpecifierFactory
	{
		return new PHPStan\Analyser\TypeSpecifierFactory($this->getService('068'));
	}


	public function initialize(): void
	{
	}


	protected function getStaticParameters(): array
	{
		return [
			'bootstrapFiles' => [
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/runtime/ReflectionUnionType.php',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/runtime/ReflectionAttribute.php',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/runtime/Attribute.php',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/runtime/ReflectionIntersectionType.php',
			],
			'excludes_analyse' => [],
			'excludePaths' => null,
			'level' => 9,
			'paths' => ['/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/test/php'],
			'exceptions' => [
				'implicitThrows' => true,
				'reportUncheckedExceptionDeadCatch' => true,
				'uncheckedExceptionRegexes' => [],
				'uncheckedExceptionClasses' => [],
				'checkedExceptionRegexes' => [],
				'checkedExceptionClasses' => [],
				'check' => ['missingCheckedExceptionInThrows' => false, 'tooWideThrowType' => false],
			],
			'featureToggles' => [
				'bleedingEdge' => false,
				'disableRuntimeReflectionProvider' => true,
				'skipCheckGenericClasses' => [
					'DatePeriod',
					'CallbackFilterIterator',
					'FilterIterator',
					'RecursiveCallbackFilterIterator',
					'AppendIterator',
					'NoRewindIterator',
					'LimitIterator',
					'InfiniteIterator',
					'CachingIterator',
					'RegexIterator',
					'ReflectionEnum',
				],
				'explicitMixedInUnknownGenericNew' => false,
				'explicitMixedForGlobalVariables' => false,
				'explicitMixedViaIsArray' => false,
				'arrayFilter' => false,
				'arrayUnpacking' => false,
				'arrayValues' => false,
				'nodeConnectingVisitorCompatibility' => true,
				'nodeConnectingVisitorRule' => false,
				'illegalConstructorMethodCall' => false,
				'disableCheckMissingIterableValueType' => false,
				'strictUnnecessaryNullsafePropertyFetch' => false,
				'looseComparison' => false,
				'consistentConstructor' => false,
				'checkUnresolvableParameterTypes' => false,
				'readOnlyByPhpDoc' => false,
				'phpDocParserRequireWhitespaceBeforeDescription' => false,
				'phpDocParserIncludeLines' => false,
				'enableIgnoreErrorsWithinPhpDocs' => false,
				'runtimeReflectionRules' => false,
				'notAnalysedTrait' => false,
				'curlSetOptTypes' => false,
				'listType' => false,
				'abstractTraitMethod' => false,
				'missingMagicSerializationRule' => false,
				'nullContextForVoidReturningFunctions' => false,
				'unescapeStrings' => false,
				'alwaysCheckTooWideReturnTypeFinalMethods' => false,
				'duplicateStubs' => false,
				'logicalXor' => false,
				'betterNoop' => false,
				'invarianceComposition' => false,
				'alwaysTrueAlwaysReported' => false,
				'disableUnreachableBranchesRules' => false,
				'varTagType' => false,
				'closureDefaultParameterTypeRule' => false,
				'newRuleLevelHelper' => false,
				'instanceofType' => false,
				'paramOutVariance' => false,
				'allInvalidPhpDocs' => false,
				'strictStaticMethodTemplateTypeVariance' => false,
				'propertyVariance' => false,
				'genericPrototypeMessage' => false,
				'stricterFunctionMap' => false,
				'invalidPhpDocTagLine' => false,
				'detectDeadTypeInMultiCatch' => false,
				'zeroFiles' => false,
				'projectServicesNotInAnalysedPaths' => false,
				'callUserFunc' => false,
				'finalByPhpDoc' => false,
				'magicConstantOutOfContext' => false,
				'paramOutType' => false,
				'pure' => false,
				'checkParameterCastableToStringFunctions' => false,
				'uselessReturnValue' => false,
				'printfArrayParameters' => false,
				'preciseMissingReturn' => false,
				'validatePregQuote' => false,
				'noImplicitWildcard' => false,
				'narrowPregMatches' => true,
				'tooWidePropertyType' => false,
				'explicitThrow' => false,
				'absentTypeChecks' => false,
			],
			'fileExtensions' => ['php'],
			'checkAdvancedIsset' => true,
			'checkAlwaysTrueCheckTypeFunctionCall' => false,
			'checkAlwaysTrueInstanceof' => false,
			'checkAlwaysTrueStrictComparison' => false,
			'checkAlwaysTrueLooseComparison' => false,
			'reportAlwaysTrueInLastCondition' => false,
			'checkClassCaseSensitivity' => true,
			'checkExplicitMixed' => true,
			'checkImplicitMixed' => false,
			'checkFunctionArgumentTypes' => true,
			'checkFunctionNameCase' => false,
			'checkGenericClassInNonGenericObjectType' => true,
			'checkInternalClassCaseSensitivity' => false,
			'checkMissingIterableValueType' => true,
			'checkMissingCallableSignature' => false,
			'checkMissingVarTagTypehint' => true,
			'checkArgumentsPassedByReference' => true,
			'checkMaybeUndefinedVariables' => true,
			'checkNullables' => true,
			'checkThisOnly' => false,
			'checkUnionTypes' => true,
			'checkBenevolentUnionTypes' => false,
			'checkExplicitMixedMissingReturn' => false,
			'checkPhpDocMissingReturn' => true,
			'checkPhpDocMethodSignatures' => true,
			'checkExtraArguments' => true,
			'checkMissingTypehints' => true,
			'checkTooWideReturnTypesInProtectedAndPublicMethods' => false,
			'checkUninitializedProperties' => false,
			'checkDynamicProperties' => false,
			'deprecationRulesInstalled' => false,
			'inferPrivatePropertyTypeFromConstructor' => false,
			'reportMaybes' => true,
			'reportMaybesInMethodSignatures' => false,
			'reportMaybesInPropertyPhpDocTypes' => false,
			'reportStaticMethodSignatures' => false,
			'reportWrongPhpDocTypeInVarTag' => false,
			'reportAnyTypeWideningInVarTag' => false,
			'reportPossiblyNonexistentGeneralArrayOffset' => false,
			'reportPossiblyNonexistentConstantArrayOffset' => false,
			'checkMissingOverrideMethodAttribute' => false,
			'mixinExcludeClasses' => [],
			'scanFiles' => [],
			'scanDirectories' => ['/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/test/php'],
			'parallel' => [
				'jobSize' => 20,
				'processTimeout' => 600.0,
				'maximumNumberOfProcesses' => 32,
				'minimumNumberOfJobsPerProcess' => 2,
				'buffer' => 134217728,
			],
			'phpVersion' => null,
			'polluteScopeWithLoopInitialAssignments' => true,
			'polluteScopeWithAlwaysIterableForeach' => true,
			'propertyAlwaysWrittenTags' => [],
			'propertyAlwaysReadTags' => [],
			'additionalConstructors' => [],
			'treatPhpDocTypesAsCertain' => true,
			'usePathConstantsAsConstantString' => false,
			'rememberPossiblyImpureFunctionValues' => true,
			'tipsOfTheDay' => true,
			'reportMagicMethods' => true,
			'reportMagicProperties' => true,
			'ignoreErrors' => [],
			'internalErrorsCountLimit' => 50,
			'cache' => ['nodesByFileCountMax' => 1024, 'nodesByStringCountMax' => 256],
			'reportUnmatchedIgnoredErrors' => true,
			'scopeClass' => 'PHPStan\Analyser\MutatingScope',
			'typeAliases' => [],
			'universalObjectCratesClasses' => ['stdClass'],
			'stubFiles' => [
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ReflectionAttribute.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ReflectionClass.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ReflectionClassConstant.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ReflectionFunctionAbstract.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ReflectionMethod.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ReflectionParameter.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ReflectionProperty.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/iterable.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ArrayObject.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/WeakReference.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ext-ds.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ImagickPixel.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/PDOStatement.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/date.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/ibm_db2.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/mysqli.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/zip.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/dom.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/spl.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/SplObjectStorage.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/Exception.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/arrayFunctions.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/core.stub',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/stubs/typeCheckingFunctions.stub',
			],
			'earlyTerminatingMethodCalls' => [],
			'earlyTerminatingFunctionCalls' => [],
			'memoryLimitFile' => '/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/../cache/phpstan/.memory_limit',
			'tempResultCachePath' => '/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/../cache/phpstan/resultCaches',
			'resultCachePath' => '/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/../cache/phpstan/resultCache.php',
			'resultCacheChecksProjectExtensionFilesDependencies' => false,
			'staticReflectionClassNamePatterns' => [],
			'dynamicConstantNames' => [
				'ICONV_IMPL',
				'LIBXML_VERSION',
				'LIBXML_DOTTED_VERSION',
				'Memcached::HAVE_ENCODING',
				'Memcached::HAVE_IGBINARY',
				'Memcached::HAVE_JSON',
				'Memcached::HAVE_MSGPACK',
				'Memcached::HAVE_SASL',
				'Memcached::HAVE_SESSION',
				'PHP_VERSION',
				'PHP_MAJOR_VERSION',
				'PHP_MINOR_VERSION',
				'PHP_RELEASE_VERSION',
				'PHP_VERSION_ID',
				'PHP_EXTRA_VERSION',
				'PHP_WINDOWS_VERSION_MAJOR',
				'PHP_WINDOWS_VERSION_MINOR',
				'PHP_WINDOWS_VERSION_BUILD',
				'PHP_ZTS',
				'PHP_DEBUG',
				'PHP_MAXPATHLEN',
				'PHP_OS',
				'PHP_OS_FAMILY',
				'PHP_SAPI',
				'PHP_EOL',
				'PHP_INT_MAX',
				'PHP_INT_MIN',
				'PHP_INT_SIZE',
				'PHP_FLOAT_DIG',
				'PHP_FLOAT_EPSILON',
				'PHP_FLOAT_MIN',
				'PHP_FLOAT_MAX',
				'DEFAULT_INCLUDE_PATH',
				'PEAR_INSTALL_DIR',
				'PEAR_EXTENSION_DIR',
				'PHP_EXTENSION_DIR',
				'PHP_PREFIX',
				'PHP_BINDIR',
				'PHP_BINARY',
				'PHP_MANDIR',
				'PHP_LIBDIR',
				'PHP_DATADIR',
				'PHP_SYSCONFDIR',
				'PHP_LOCALSTATEDIR',
				'PHP_CONFIG_FILE_PATH',
				'PHP_CONFIG_FILE_SCAN_DIR',
				'PHP_SHLIB_SUFFIX',
				'PHP_FD_SETSIZE',
				'OPENSSL_VERSION_NUMBER',
				'ZEND_DEBUG_BUILD',
				'ZEND_THREAD_SAFE',
			],
			'customRulesetUsed' => false,
			'editorUrl' => null,
			'editorUrlTitle' => null,
			'errorFormat' => null,
			'sourceLocatorPlaygroundMode' => false,
			'__validate' => true,
			'tmpDir' => '/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/../cache/phpstan',
			'debugMode' => true,
			'productionMode' => false,
			'tempDir' => '/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/../cache/phpstan',
			'rootDir' => '/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan',
			'currentWorkingDirectory' => '/home/sanderronde/git/phpstan-vscode/test/multi-config-demo',
			'cliArgumentsVariablesRegistered' => true,
			'additionalConfigFiles' => [
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level9.neon',
				'/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/test/phpstan.neon',
			],
			'allConfigFiles' => [
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/parametersSchema.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level9.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level8.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level7.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level6.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level5.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level4.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level3.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level2.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level1.neon',
				'phar:///home/sanderronde/git/phpstan-vscode/test/multi-config-demo/vendor/phpstan/phpstan/phpstan.phar/conf/config.level0.neon',
				'/home/sanderronde/git/phpstan-vscode/test/multi-config-demo/test/phpstan.neon',
			],
			'composerAutoloaderProjectPaths' => ['/home/sanderronde/git/phpstan-vscode/test/multi-config-demo'],
			'generateBaselineFile' => null,
			'usedLevel' => '9',
			'cliAutoloadFile' => null,
		];
	}


	protected function getDynamicParameter($key)
	{
		switch (true) {
			case $key === 'analysedPaths': return null;
			case $key === 'analysedPathsFromConfig': return null;
			case $key === 'env': return null;
			case $key === 'fixerTmpDir': return ($this->getParameter('sysGetTempDir')) . '/phpstan-fixer';
			case $key === 'sysGetTempDir': return sys_get_temp_dir();
			case $key === 'pro': return [
			'dnsServers' => ['1.1.1.2'],
			'tmpDir' => ($this->getParameter('sysGetTempDir')) . '/phpstan-fixer',
		];
			default: return parent::getDynamicParameter($key);
		};
	}


	public function getParameters(): array
	{
		array_map(function ($key) { $this->getParameter($key); }, [
			'analysedPaths',
			'analysedPathsFromConfig',
			'env',
			'fixerTmpDir',
			'sysGetTempDir',
			'pro',
		]);
		return parent::getParameters();
	}
}
