<?php

$dotenv = new \Dotenv\Dotenv( __DIR__ . '/../' );
$dotenv->load();

return [
    'settings' => [
        'displayErrorDetails' => true, // set to false in production
        'addContentLengthHeader' => false, // Allow the web server to send the content-length header
	    // 'determineRouteBeforeAppMiddleware' => true,

        // Renderer settings
        'renderer' => [
            'template_path' => __DIR__ . '/../templates/',
        ],

        // Monolog settings
        'logger' => [
            'name' => 'slim-app',
            'path' => __DIR__ . '/../logs/app.log',
            'level' => \Monolog\Logger::DEBUG,
        ],

        // Doctrine settings
        'doctrine' => [
            'meta' => [
                'entity_path' => [
                    'src/Entity'
                ],
                'auto_generate_proxies' => true,
                'proxy_dir' =>  __DIR__.'/../cache/proxies',
                'cache' => null,
            ],
            'connection' => [
                'driver'   => 'pdo_mysql',
                'host'     => 'localhost',
                'dbname'   => 'fctoernooiv2',
                'user'     => getenv('DB_USERNAME'),
                'password' => getenv('DB_PASSWORD'),
            ],
            'serializer' => array(
	            'enabled' => true,
            ),

        ],

        'jwt' => [
            'secret' => getenv('JWT_SECRET'),
            'algorithm' => getenv('JWT_ALGORITHM'),
        ]
    ],
];
