<?php

// Routes
$app->get('/users', 'App\Action\UserAction:fetch');
$app->get('/users/{id}', 'App\Action\UserAction:fetchOne');
$app->post('/users', 'App\Action\UserAction:add');
$app->put('/users/{id}', 'App\Action\UserAction:edit');
$app->delete('/users/{id}', 'App\Action\UserAction:remove');

/*$app->get('/:resourceType(/(:id)(/))', function($resourceType, $id = null) {
    $resource = ResourceFactory::get($resourceType);
    echo $resource->get($id);
});*/

/*$app->get('/[{name}]', function ($request, $response, $args) {
    // Sample log message
    $this->logger->info("Slim-Skeleton '/' route");

    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
});*/
