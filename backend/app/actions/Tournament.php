<?php
/**
 * Created by PhpStorm.
 * User: coen
 * Date: 6-10-17
 * Time: 11:40
 */


namespace App\Action;

use Slim\ServerRequestInterface;
use JMS\Serializer\Serializer;
// use FCToernooi\Tournament;
use \Firebase\JWT\JWT;
use FCToernooi\Tournament\Service as TournamentService;
use \Slim\Middleware\JwtAuthentication;

final class Tournament
{
    /**
     * @var TournamentService
     */
    private $service;
    /**
     * @var Serializer
     */
    protected $serializer;
    /**
     * @var array
     */
    protected $settings;

    public function __construct(TournamentService $tournamentService, Serializer $serializer, $settings )
    {
        $this->service = $tournamentService;
        $this->serializer = $serializer;
        $this->settings = $settings;
    }

    public function add( $request, $response, $args)
    {
        $name = filter_var($request->getParam('name'), FILTER_SANITIZE_STRING);
        if ( !$name ){ return $response->withStatus(404, "de naam is ongeldig of leeg" ); }
        $sportName = filter_var($request->getParam('sportname'), FILTER_SANITIZE_STRING);
        if ( !$sportName ){ return $response->withStatus(404, "de sportnaam is ongeldig of leeg" ); }
        $nrOfCompetitors = filter_var($request->getParam('nrofcompetitors'), FILTER_VALIDATE_INT);
        if ( $nrOfCompetitors === false ){ return $response->withStatus(404, "het aantal deelnemers is ongeldig" ); }
        $equalNrOfGames = filter_var($request->getParam('equalnrofgames'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ( $equalNrOfGames === null ){ return $response->withStatus(404, "evenveel-wedstrijden is ongeldig" ); }

        $sErrorMessage = null;
        try {
            $tournament = $this->service->create(
                $name,
                $sportName,
                $nrOfCompetitors,
                $equalNrOfGames
            );

            return $response
                ->withStatus(201)
                ->withHeader('Content-Type', 'application/json;charset=utf-8')
                ->write($this->serializer->serialize( $tournament, 'json'));
            ;
        }
        catch( \Exception $e ){
            $sErrorMessage = $e->getMessage();
        }
        return $response->withStatus(404, $sErrorMessage );
    }

    /*
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
            return $response->withStatus(404, rawurlencode( $sErrorMessage ) );
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