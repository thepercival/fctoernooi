<?php
/**
 * Created by PhpStorm.
 * User: cdunnink
 * Date: 15-11-2016
 * Time: 11:54
 */

namespace App\Action;

use App\Resource\CompetitionSeasonResource;
use Slim\ServerRequestInterface;
use Slim\Http\Response;
use Symfony\Component\Serializer\Serializer;

final class CompetitionSeasonAction
{
    private $competitionseasonResource;
	protected $serializer = null;

    public function __construct(CompetitionSeasonResource $competitionseasonResource, Serializer $serializer)
    {
        $this->competitionseasonResource = $competitionseasonResource;
	    $this->serializer = $serializer;
    }

    public function fetch($request, Response $response, $args)
    {
	    $competitionseasons = null;
	    $userid = $request->getParam('userid');
	    /*if( $userid !== null and  is_numeric( $userid ) )
	        $competitionseasons = $this->competitionseasonResource->getBy( array( "userid" => $userid ) );
	    else*/
            $competitionseasons = $this->competitionseasonResource->get();

	    return $response
		    ->withHeader('Content-Type', 'application/json;charset=utf-8')
		    ->write($this->serializer->serialize( $competitionseasons, 'json'));
	    ;
    }

    public function fetchOne($request, $response, $args)
    {
	    $competitionseason = $this->competitionseasonResource->get($args['id']);

	    if ($competitionseason) {
		    return $response
			    ->withHeader('Content-Type', 'application/json;charset=utf-8')
			    ->write($this->serializer->serialize( $competitionseason, 'json'));
			    ;
        }
        return $response->withStatus(404, 'geen gebruiker met het opgegeven id gevonden');
    }

    public function add( $request, $response, $args)
    {
	    $sErrorMessage = null;
	    try{
	        $competitionseason = $this->competitionseasonResource->post( array(
	        	"userid"=> $request->getParam('userid'),
		        "name"=> $request->getParam('name'),
		        "seasonname"=> $request->getParam('seasonName'),
		        "structure" => $request->getParam('structure') )
            );
		    if (!$competitionseason)
			    throw new \Exception( "het nieuwe toernooi kan niet worden geretourneerd");

		    return $response->withJSON($competitionseason);
	    }
	    catch( \Exception $e ){
		    $sErrorMessage = $e->getMessage();
	    }
	    return $response->withStatus(404, 'geen toernooi toegevoegd : ' . urlencode( $sErrorMessage ) );
    }

    public function edit( $request, $response, $args)
    {
	    $sErrorMessage = null;
	    try{
		    $competitionseason = $this->competitionseasonResource->put( $args['id'], array(
	            "name"=> $request->getParam('name'),
	            "seasonname"=> $request->getParam('seasonname'),
	            "structure" => $request->getParam('structure') )
	        );
		    if (!$competitionseason)
			    throw new \Exception( "het gewijzigde toernooi kan niet worden geretouneerd");

		    return $response->withJSON($competitionseason);
	    }
	    catch( \Exception $e ){
		    $sErrorMessage = $e->getMessage();
	    }
	    return $response->withStatus(404, 'het toernooi is niet bijgewerkt : ' . urlencode( $sErrorMessage ) );
    }

    public function remove( $request, $response, $args)
    {
	    $sErrorMessage = null;
	    try{
		    $this->userResource->delete( $args['id'] );
		    return $response;
	    }
	    catch( \Exception $e ){
		    $sErrorMessage = $e->getMessage();
	    }
	    return $response->withStatus(404, 'het toernooi is niet verwijdered : ' . $sErrorMessage );
    }
}