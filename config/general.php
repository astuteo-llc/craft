<?php
/**
 * General Configuration
 *
 * All of your system's general configuration settings go in here. You can see a
 * list of the available settings in vendor/craftcms/cms/src/config/GeneralConfig.php.
 *
 * @see craft\config\GeneralConfig
 */

return [
    // Global settings
    '*' => [
        // Default Week Start Day (0 = Sunday, 1 = Monday...)
        'defaultWeekStartDay' => 0,

        // Whether generated URLs should omit "index.php"
        'omitScriptNameInUrls' => true,

        // Control Panel trigger word
        'cpTrigger' => 'admin',

		// Project Config
		'useProjectConfigFile' => true,

		// The secure key Craft will use for hashing and encrypting data
		'securityKey' => 'UPDATE---HARDCODETHIS',

		'craftEnv' => CRAFT_ENVIRONMENT,

		'aliases' => array(
			'siteUrl'   => getenv('DEFAULT_SITE_URL'),
			'basePath' => getenv('BASE_PATH'),
			'cdnBaseUrl' => 'https://static.UPDATE.com/',
			'cdnBucket' => 'UPDATE',
			'cdnRegion' => 'UPDATE',
			's3Key' => 'UPDATE',
		),
    ],

    // Dev environment settings
    'dev' => [
        // Dev Mode (see https://craftcms.com/support/dev-mode)
        'devMode' => true,
    ],

    // Staging environment settings
    'staging' => [
        // Base site URL
		'allowAdminChanges' => false,
    ],

    // Production environment settings
    'production' => [
        // Base site URL
		'allowAdminChanges' => false,
    ],
];
