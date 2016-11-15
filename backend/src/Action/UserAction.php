<?php
/**
 * Created by PhpStorm.
 * User: cdunnink
 * Date: 15-11-2016
 * Time: 11:54
 */

namespace App\Action;

use App\Resource\UserResource;
use Slim\ServerRequestInterface;

final class UserAction
{
    private $userResource;

    public function __construct(UserResource $userResource)
    {
        $this->userResource = $userResource;
    }

    public function fetch($request, $response, $args)
    {
        $users = $this->userResource->get();
        return $response->withJSON($users);
    }

    public function fetchOne($request, $response, $args)
    {
        $user = $this->userResource->get($args['id']);
        if ($user) {
            return $response->withJSON($user);
        }
        return $response->withStatus(404, 'geen gebruiker met het opgegeven id gevonden');
    }

    public function add( $request, $response, $args)
    {
        $user = $this->userResource->post( array(
                "name"=> $request->getParam('name'),
                "email" => $request->getParam('email') )
        );
        if ($user) {
            return $response->withJSON($user);
        }
        return $response->withStatus(404, 'geen gebruiker toegevoegd');
    }

    public function edit( $request, $response, $args)
    {
        $user = $this->userResource->put( $args['id'], array(
            "name"=> $request->getParam('name'),
            "email" => $request->getParam('email') )
        );
        if ($user) {
            return $response->withJSON($user);
        }
        return $response->withStatus(404, 'geen gebruiker met het opgegeven id gevonden');
    }

    public function remove( $request, $response, $args)
    {
        $user = $this->userResource->delete( $args['id'] );
        if ($user) {
            return $response->withJSON($user);
        }
        return $response->withStatus(404, 'geen gebruiker met het opgegeven id gevonden');
    }
}