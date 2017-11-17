<?php
/**
 * Created by PhpStorm.
 * User: coen
 * Date: 6-10-17
 * Time: 11:40
 */

namespace App\Action;

use Doctrine\Common\Collections\ArrayCollection;
use Slim\ServerRequestInterface;
use JMS\Serializer\Serializer;
use FCToernooi\User\Repository as UserRepository;
use FCToernooi\Tournament\Service as TournamentService;
use FCToernooi\Tournament\Repository as TournamentRepository;
use FCToernooi\Tournament\Role as TournamentRole;

final class Tournament
{
    /**
     * @var TournamentService
     */
    private $service;

    /**
     * @var TournamentRepos
     */
    private $tournamentRepository;

    /**
     * @var UserRepository
     */
    private $userRepository;

    /**
     * @var Serializer
     */
    protected $serializer;
    /**
     * @var array
     */
    protected $jwt;

    public function __construct(TournamentService $tournamentService, TournamentRepository $tournamentRepos, UserRepository $userRepository, Serializer $serializer, \StdClass $jwt )
    {
        $this->service = $tournamentService;
        $this->tournamentRepository = $tournamentRepos;
        $this->userRepository = $userRepository;
        $this->serializer = $serializer;
        $this->jwt = $jwt;
    }

    /**
     * startdatetime, enddatetime, id, userid
     *
     * @param $request
     * @param $response
     * @param $args
     * @return mixed
     */
    public function fetch($request, $response, $args)
    {
//        $userId = filter_var($request->getParam('userid'), FILTER_VALIDATE_INT);
//        if ( $userId === false ){ return $response->withStatus(404, "het gebruikersid is niet gezet" ); }
//
//        $user = null;
//        if( $this->jwt->sub !== null ){
//            $user = $this->userRepository->find( $this->jwt->sub );
//        }
//        if ( $user === null || $userId !== $user->getId() ){ return $response->withStatus(404, "het gebruikersid komt niet overeen met de ingelogdde gebruiker" ); }
//
//        $competitionseasonRoles = $this->competitionseasonRoleRepository->findBy(
//            array('user' => $user),
//            null,
//            20
//        );
//
//        $tournaments = new ArrayCollection();
//        foreach( $competitionseasonRoles as $competitionseasonRole ){
//            if( $tournaments->find()
//        }
//        array_map( function( $competitionseasonRole ){
//
//        }, $competitionseasonRoles );
//
//        get competitionseasons
//
//
//        return $response
//            ->withHeader('Content-Type', 'application/json;charset=utf-8')
//            ->write($this->serializer->serialize( $users, 'json'));
//        ;
//
        $tournaments = $this->tournamentRepository->findAll();
        return $response
            ->withHeader('Content-Type', 'application/json;charset=utf-8')
            ->write($this->serializer->serialize( $tournaments, 'json'));
        ;
    }

    public function fetchOne($request, $response, $args)
    {
//        $competitionseasonRole = $this->competitionseasonRoleRepository->find($args['id']);
//        if ($competitionseasonRole) {
//            return $response
//                ->withHeader('Content-Type', 'application/json;charset=utf-8')
//                ->write($this->serializer->serialize( $competitionseasonRole, 'json'));
//            ;
//        }
//        return $response->withStatus(404, 'geen toernooirol met het opgegeven id gevonden');
    }

    public function add( $request, $response, $args)
    {
        $arrObject = $request->getParsedBody();
        // var_dump(123); die();
//        var_dump($arrObject); die();
//
//        $cs = $this->serializer->deserialize( json_encode( $arrObject ), 'FCToernooi\Tournament', 'json');
//        var_dump($tournament); die();


        $tournament = $this->serializer->deserialize( json_encode($request->getParsedBody()), 'FCToernooi\Tournament', 'json');


        // var_dump($tournament); die();
//        return $response
//            ->withStatus(201)
//            ->withHeader('Content-Type', 'application/json;charset=utf-8')
//            ->write($this->serializer->serialize( $tournament, 'json'));
//        ;

       // var_dump( $tournament ); die();
//        $name = filter_var($request->getParam('name'), FILTER_SANITIZE_STRING);
//        if ( !$name ){ return $response->withStatus(404, "de naam is ongeldig of leeg" ); }
//        $sportName = filter_var(trim($request->getParam('sportname')), FILTER_SANITIZE_STRING);
//        if ( !$sportName ){ return $response->withStatus(404, "de sportnaam is ongeldig of leeg" ); }
//        $nrOfCompetitors = filter_var($request->getParam('nrofcompetitors'), FILTER_VALIDATE_INT);
//        if ( $nrOfCompetitors === false ){ return $response->withStatus(404, "het aantal deelnemers is ongeldig" ); }
//        $nrOfFields = filter_var($request->getParam('nroffields'), FILTER_VALIDATE_INT);
//        if ( $nrOfFields === false ){ return $response->withStatus(404, "het aantal velden is ongeldig" ); }
//        $startDate = \DateTimeImmutable::createFromFormat ( 'Y-m-d\TH:i:s.000\Z', $request->getParam('startdate') );
//        if ( $startDate === null ){ return $response->withStatus(404, "de startdatum is ongeldig" ); }

//        $round = 12;
//        'name': this.model.name,
//        'sportname': sportName,
//
//        'nroffields': this.model.nroffields,
//        'startdate': startdate.toISOString()/*,
//        'structure': firstRound*/

        $user = null;
        if( $this->jwt->sub !== null ){
            $user = $this->userRepository->find( $this->jwt->sub );
        }
        if ( $user === null ){ return $response->withStatus(404, "gebruiker kan niet gevonden worden" ); }

//        $this->tournamentRepository->save( $tournament);
//        return $response
//            ->withStatus(201)
//            ->withHeader('Content-Type', 'application/json;charset=utf-8')
//            ->write($this->serializer->serialize( $tournament, 'json'));
//        ;

        $sErrorMessage = null;
        try {
            $tournament = $this->service->createFromJSON( $tournament, $user );

            return $response
                ->withStatus(201)
                ->withHeader('Content-Type', 'application/json;charset=utf-8')
                ->write($this->serializer->serialize( $tournament, 'json'));
            ;
        }
        catch( \Exception $e ){
            $sErrorMessage = urlencode( $e->getMessage() );
        }
        return $response->withStatus(404, $sErrorMessage );
    }

    public function remove( $request, $response, $args)
    {
        $errorMessage = null;
        try{
            $tournament = $this->tournamentRepository->find( $args['id'] );

            if ( $tournament === null ){
                return $response->withStatus(404, "het te verwijderen toernooi kon niet gevonden worden" );
            }

            $user = null;
            if( $this->jwt->sub !== null ){
                $user = $this->userRepository->find( $this->jwt->sub );
            }
            if ( $user === null ){
                return $response->withStatus(404, "de ingelogde gebruikers kon niet gevonden worden" );
            }

            if( !$tournament->hasRole( $user, TournamentRole::ADMIN ) ) {
                return $response->withStatus(404, "je hebt geen rechten om het toernooi te verwijderen" );
            }

            $this->service->remove( $tournament );

            return $response->withStatus(200);
        }
        catch( \Exception $e ){
            $errorMessage = $e->getMessage();
        }
        return $response->withStatus(404, 'het toernooi is niet verwijdered : ' . $errorMessage );
    }

    public function edit( $request, $response, $args)
    {
        $name = filter_var($request->getParam('name'), FILTER_SANITIZE_STRING);
        if ( !$name ){ return $response->withStatus(404, "de naam is ongeldig of leeg" ); }
        $startDate = \DateTimeImmutable::createFromFormat ( 'Y-m-d\TH:i:s.000\Z', $request->getParam('startdate') );
        if ( $startDate === null ){ return $response->withStatus(404, "de startdatum is ongeldig" ); }

        $sErrorMessage = null;
        try {
            $tournament = $this->tournamentRepository->find( $args['id'] );
            if ( $tournament === null ){
                return $response->withStatus(404, "het te wijzigen toernooi kon niet gevonden worden" );
            }

            $this->service->edit( $tournament, $name, $startDate );
            return $response
                ->withStatus(200)
                ->withHeader('Content-Type', 'application/json;charset=utf-8')
                ->write($this->serializer->serialize( true, 'json'));
            ;
        }
        catch( \Exception $e ){

            $sErrorMessage = $e->getMessage();
        }
        return $response->withStatus(400,$sErrorMessage);
    }

    /*
            protected function sentEmailActivation( $user )
            {
                $activatehash = hash ( "sha256", $user["email"] . $this->settings["auth"]["activationsecret"] );
                // echo $activatehash;

                $sMessage =
                    "<div style=\"font-size:20px;\">FC Toernooi</div>"."<br>".
                    "<br>".
                    "Hallo ".$user["name"].","."<br>"."<br>".
                    "Bedankt voor het registreren bij FC Toernooi.<br>"."<br>".
                    'Klik op <a href="'.$this->settings["www"]["url"].'activate?activationkey='.$activatehash.'&email='.rawurlencode( $user["email"] ).'">deze link</a> om je emailadres te bevestigen en je account te activeren.<br>'."<br>".
                    'Wensen, klachten of vragen kunt u met de <a href="https://github.com/thepercival/fctoernooi/issues">deze link</a> bewerkstellingen.<br>'."<br>".
                    "Veel plezier met het gebruiken van FC Toernooi<br>"."<br>".
                    "groeten van FC Toernooi"
                ;

                $mail = new \PHPMailer;
                $mail->isSMTP();
                $mail->Host = $this->settings["email"]["smtpserver"];
                $mail->setFrom( $this->settings["email"]["from"], $this->settings["email"]["fromname"] );
                $mail->addAddress( $user["email"] );
                $mail->addReplyTo( $this->settings["email"]["from"], $this->settings["email"]["fromname"] );
                $mail->isHTML(true);
                $mail->Subject = "FC Toernooi registratiegegevens";
                $mail->Body    = $sMessage;
                if(!$mail->send()) {
                    throw new \Exception("de activatie email kan niet worden verzonden");
                }
            }

            protected function forgetEmailForgetPassword()
            {

            }*/
}