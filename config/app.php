<?php
/**
 * Yii Application Config
 *
 * Edit this file at your own risk!
 *
 * The array returned by this file will get merged with
 * vendor/craftcms/cms/src/config/app.php and app.[web|console].php, when
 * Craft's bootstrap script is defining the configuration for the entire
 * application.
 *
 * You can define custom modules and system components, and even override the
 * built-in system components.
 *
 * If you want to modify the application config for *only* web requests or
 * *only* console requests, create an app.web.php or app.console.php file in
 * your config/ folder, alongside this one.
 */

return [
    'modules' => [
        'my-module' => \modules\Module::class,
    ],
    //'bootstrap' => ['my-module'],
    '*' => [
    ],
    'dev' => [
        'components' => [
            'mailer' => function() {
                /**
                 * For local/dev set the SMTP server to
                 * MailHog. All emails, other than the test in CP
                 * should be delivered to http://127.0.0.1:8025
                 */
                $settings = Craft::$app->systemSettings->getEmailSettings();
                $settings->transportType = \craft\mail\transportadapters\Smtp::class;
                $settings->transportSettings = [
                    'host' => '127.0.0.1',
                    'port' => '1025'
                ];
                return craft\helpers\MailerHelper::createMailer($settings);
            }
        ]
    ],
];
