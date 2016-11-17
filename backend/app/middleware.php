<?php
// Application middleware

/*
 * this application middleware shoul be  moved to the route-middleware, because that is where it belongs!
 * but the middleware does not work as routermiddleware
 */
$app->add( function ($request, $response, $next) {

	return $next($request, $response
		->withHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
		->withHeader('Access-Control-Allow-Credentials', 'true')
		->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Origin, Content-Type, Accept, Authorization')
		->withHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS'));
});

$app->add(new \Slim\Middleware\JwtAuthentication([
    "path" => ["/users"],
    // "passthrough" => ["/auth/login", "/users" /*, "ping"*/],
    "secure" => true,
    "relaxed" => ["localhost"],
    "secret" => $app->getContainer()->get('settings')['jwt_secret']
]));