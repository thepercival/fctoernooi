<?php
// DIC configuration

use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\Encoder\XmlEncoder;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;

$container = $app->getContainer();

// view renderer
$container['renderer'] = function ($c) {
    $settings = $c->get('settings')['renderer'];
    return new Slim\Views\PhpRenderer($settings['template_path']);
};

// monolog
$container['logger'] = function ($c) {
    $settings = $c->get('settings')['logger'];
    $logger = new Monolog\Logger($settings['name']);
    $logger->pushProcessor(new Monolog\Processor\UidProcessor());
    $logger->pushHandler(new Monolog\Handler\StreamHandler($settings['path'], $settings['level']));
    return $logger;
};

// Doctrine
$container['em'] = function ($c) {
    $settings = $c->get('settings');
    $config = \Doctrine\ORM\Tools\Setup::createAnnotationMetadataConfiguration(
        $settings['doctrine']['meta']['entity_path'],
        $settings['doctrine']['meta']['auto_generate_proxies'],
        $settings['doctrine']['meta']['proxy_dir'],
        $settings['doctrine']['meta']['cache'],
        false
    );
    return \Doctrine\ORM\EntityManager::create($settings['doctrine']['connection'], $config);
};

// symfony serializer
$container['serializer'] = function( $c ) {
	$encoders = array( new JsonEncoder() );

	$normalizer = new ObjectNormalizer();
	$normalizer->setCircularReferenceHandler(function ($object) {
		return $object->getId();
	});
	$normalizers = array( $normalizer );
	return new Serializer($normalizers, $encoders);
};

// JWTAuthentication
$container['jwtauth'] = function( $c ) {
    $settings = $c->get('settings');
    return new \Slim\Middleware\JwtAuthentication([
        "secure" => true,
        "relaxed" => ["localhost"],
        "secret" => $settings['jwt']['secret'],
        "algorithm" => $settings['jwt']['algorithm'],
        "rules" => [
            new \Slim\Middleware\JwtAuthentication\RequestPathRule([
                "path" => "/users"
            ]),
            new \Slim\Middleware\JwtAuthentication\RequestMethodRule([
                "passthrough" => ["OPTIONS","POST"]
            ])
        ]
    ]);
};

// actions
$container['App\Action\AuthAction'] = function ($c) {
	return new App\Action\AuthAction( $c->get('em'), $c->get('jwtauth'), $c->get('serializer') );
};
$container['App\Action\UserAction'] = function ($c) {
    $userResource = new \App\Resource\UserResource($c->get('em'));
    return new App\Action\UserAction($userResource,$c->get('serializer'));
};
$container['App\Action\CompetitionSeasonAction'] = function ($c) {
	$competitionSeasonResource = new \App\Resource\CompetitionSeasonResource($c->get('em'));
    return new App\Action\CompetitionSeasonAction($competitionSeasonResource,$c->get('serializer'));
};
