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
use Symfony\Component\Serializer\Serializer;

final class UserAction
{
    private $userResource;
	protected $serializer = null;

	public function __construct(UserResource $userResource, Serializer $serializer)
	{
		$this->userResource = $userResource;
		$this->serializer = $serializer;
	}

    public function fetch($request, $response, $args)
    {
        $users = $this->userResource->get();
	    return $response
		    ->withHeader('Content-Type', 'application/json;charset=utf-8')
		    ->write($this->serializer->serialize( $users, 'json'));
	    ;
    }

    public function fetchOne($request, $response, $args)
    {
        $user = $this->userResource->get($args['id']);
        if ($user) {
	        return $response
		        ->withHeader('Content-Type', 'application/json;charset=utf-8')
		        ->write($this->serializer->serialize( $user, 'json'));
	        ;
        }
        return $response->withStatus(404, 'geen gebruiker met het opgegeven id gevonden');
    }

    public function add( $request, $response, $args)
    {
        $sErrorMessage = null;
        try{
            $user = $this->userResource->post( array(
                    "name"=> $request->getParam('name'),
                    "email" => $request->getParam('email') )
            );
            if (!$user)
                throw new \Exception( "de nieuwe gebruiker kan niet worden geretourneerd");

            return $response->withJSON($user);
        }
        catch( \Exception $e ){
            $sErrorMessage = $e->getMessage();
        }
        return $response->withStatus(404, 'geen gebruiker toegevoegd : ' . urlencode( $sErrorMessage ) );
    }

    public function edit( $request, $response, $args)
    {
        $sErrorMessage = null;
        try{
            $user = $this->userResource->put( $args['id'], array(
                "name"=> $request->getParam('name'),
                "email" => $request->getParam('email') )
            );
            if (!$user)
                throw new \Exception( "de gewijzigde gebruiker kan niet worden geretouneerd");

            return $response->withJSON($user);
        }
        catch( \Exception $e ){
            $sErrorMessage = $e->getMessage();
        }
        return $response->withStatus(404, 'de gebruiker is niet bijgewerkt : ' . urlencode( $sErrorMessage ) );
    }

    public function remove( $request, $response, $args)
    {
        $sErrorMessage = null;
        try{
            $user = $this->userResource->delete( $args['id'] );
            return $response;
        }
        catch( \Exception $e ){
            $sErrorMessage = $e->getMessage();
        }
        return $response->withStatus(404, 'de gebruiker is niet verwijdered : ' . $sErrorMessage );
    }
}