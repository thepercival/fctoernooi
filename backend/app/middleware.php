<?php
// Application middleware


$app->add( $app->getContainer()->get('jwtauth') );

/*$app->add(function($request, $response, $next) {
	$arrQueryParams = $request->getQueryParams();
    $token = array_key_exists("token", $arrQueryParams ) ? $arrQueryParams["token"] : null;
    if (false === empty($token)) {
        $request = $request->withHeader("Authorization", "Bearer {$token}");
    }
    return $next($request, $response);
});*/


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

