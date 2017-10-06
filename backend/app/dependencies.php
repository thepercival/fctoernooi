<?php
// DIC configuration

use \JMS\Serializer\SerializerBuilder;
// use \Slim\Middleware\JwtAuthentication;

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
    $settings = $c->get('settings')['doctrine'];
	class CustomYamlDriver extends Doctrine\ORM\Mapping\Driver\YamlDriver
	{
		protected function loadMappingFile($file)
		{
			return Symfony\Component\Yaml\Yaml::parse(file_get_contents($file), Symfony\Component\Yaml\Yaml::PARSE_CONSTANT);
		}
	}

	$config = Doctrine\ORM\Tools\Setup::createConfiguration(
		$settings['meta']['auto_generate_proxies'],
		$settings['meta']['proxy_dir'],
		$settings['meta']['cache']
	);
	$config->setMetadataDriverImpl( new CustomYamlDriver( $settings['meta']['entity_path'] ));

	return Doctrine\ORM\EntityManager::create($settings['connection'], $config);
};

// symfony serializer
$container['serializer'] = function( $c ) {
    $settings = $c->get('settings');

    $serializer = SerializerBuilder::create()
        ->setDebug($settings['displayErrorDetails'])
        /*->setCacheDir($settings['serializer']['cache_dir'])*/;

    foreach( $settings['serializer']['yml_dir'] as $ymlnamespace => $ymldir ){
        $serializer->addMetadataDir($ymldir,$ymlnamespace);
    }


    return $serializer->build();
};

// voetbalService
$container['voetbal'] = function( $c ) {
    $voetbalService = new Voetbal\Service($c->get('em'));

    return $voetbalService;
};

// JWT
$container["jwt"] = function ( $c ) {
    return new \StdClass;
};

// actions
$container['App\Action\Auth'] = function ($c) {
	$em = $c->get('em');
    $repos = new FCToernooi\User\Repository($em,$em->getClassMetaData(FCToernooi\User::class));
	return new App\Action\Auth($repos,$c->get('serializer'),$c->get('settings'));
};
$container['App\Action\User'] = function ($c) {
	$em = $c->get('em');
    $repos = new FCToernooi\User\Repository($em,$em->getClassMetaData(FCToernooi\User::class));
	return new App\Action\User($repos,$c->get('serializer'),$c->get('settings'));
};
$container['App\Action\Tournament'] = function ($c) {
    $em = $c->get('em');
    $associationRepos = new Voetbal\Association\Repository($em,$em->getClassMetaData(Voetbal\Association::class));
    $competitionRepos = new Voetbal\Competition\Repository($em,$em->getClassMetaData(Voetbal\Competition::class));
    $seasonRepos = new Voetbal\Season\Repository($em,$em->getClassMetaData(Voetbal\Season::class));
    $csRepos = new Voetbal\Competitionseason\Repository($em,$em->getClassMetaData(Voetbal\Competitionseason::class));
    $csRoleRepos = new FCToernooi\CompetitionseasonRole\Repository($em,$em->getClassMetaData(FCToernooi\CompetitionseasonRole::class));
    $tournamentService = new FCToernooi\Tournament\Service(
        $associationRepos,
        $competitionRepos,
        $seasonRepos,
        $csRepos,
        $csRoleRepos
    );
    $userRepository = new FCToernooi\User\Repository($em,$em->getClassMetaData(FCToernooi\User::class));
    return new App\Action\Tournament($tournamentService,$userRepository,$c->get('serializer'),$c->get('jwt'));
};
