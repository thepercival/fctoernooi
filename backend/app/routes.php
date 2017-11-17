<?php

// Routes
//$app->any('/voetbal/external/{resourceType}[/{id}]', \Voetbal\Action\Slim\ExternalHandler::class );
$app->any('/voetbal/{resourceType}[/{id}]', \Voetbal\Action\Slim\Handler::class );

$app->group('/auth', function () use ($app) {
	$app->post('/register', 'App\Action\Auth:register');
	$app->post('/login', 'App\Action\Auth:login');
    /*$app->post('/auth/activate', 'App\Action\Auth:activate');
	$app->put('/auth/passwordreset', 'App\Action\Auth:passwordreset');
	$app->put('/auth/passwordchange', 'App\Action\Auth:passwordchange');*/
});

$app->group('/users', function () use ($app) {
    $app->get('', 'App\Action\User:fetch');
    $app->get('/{id}', 'App\Action\User:fetchOne');
});

$app->group('/tournaments', function () use ($app) {
    $app->post('', 'App\Action\Tournament:add');
    $app->get('', 'App\Action\Tournament:fetch');
    $app->get('/{id}', 'App\Action\Tournament:fetchOne');
    $app->put('/{id}', 'App\Action\Tournament:edit');
    $app->delete('/{id}', 'App\Action\Tournament:remove');
});

$app->group('/tournamentroles', function () use ($app) {
    $app->get('', 'App\Action\Tournament\Role\User:fetch');
    $app->get('/{id}', 'App\Action\Tournament\Role:fetchOne');
});

