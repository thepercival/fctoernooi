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

final class CompetitionSeasonAction
{
    private $competitionseasonResource;

    public function __construct(CompetitionSeasonResource $competitionseasonResource)
    {
        $this->competitionseasonResource = $competitionseasonResource;
    }

    public function fetch($request, $response, $args)
    {
        $competitionseasons = $this->competitionseasonResource->get();
        return $response->withJSON($competitionseasons);
    }

    public function fetchOne($request, $response, $args)
    {
	    $competitionseason = $this->competitionseasonResource->get($args['id']);
        if ($competitionseason) {
            return $response->withJSON($competitionseason);
        }
        return $response->withStatus(404, 'geen gebruiker met het opgegeven id gevonden');
    }

    public function add( $request, $response, $args)
    {
	    $competitionseason = $this->competitionseasonResource->post( array(
		        "name"=> $request->getParam('name'),
		        "seasonname"=> $request->getParam('seasonname'),
		        "structure" => $request->getParam('structure') )
        );
        if ($competitionseason) {
            return $response->withJSON($competitionseason);
        }
        return $response->withStatus(404, 'geen toernooi toegevoegd');
    }

    public function edit( $request, $response, $args)
    {
	    $competitionseason = $this->competitionseasonResource->put( $args['id'], array(
            "name"=> $request->getParam('name'),
            "seasonname"=> $request->getParam('seasonname'),
            "structure" => $request->getParam('structure') )
        );
        if ($competitionseason) {
            return $response->withJSON($competitionseason);
        }
        return $response->withStatus(404, 'geen toernooi met het opgegeven id gevonden');
    }

    public function remove( $request, $response, $args)
    {
	    $competitionseason = $this->competitionseasonResource->delete( $args['id'] );
        if ($competitionseason) {
            return $response->withJSON($competitionseason);
        }
        return $response->withStatus(404, 'geen toernooi met het opgegeven id gevonden');
    }
}