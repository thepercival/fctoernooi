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
	protected $serializer;
    protected $settings;

	public function __construct(UserResource $userResource, Serializer $serializer, $settings )
	{
		$this->userResource = $userResource;
		$this->serializer = $serializer;
        $this->settings = $settings;
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
                    "password"=> $request->getParam('password'),
                    "email" => $request->getParam('email'),
                    "active" => ( $this->settings["environment"] === "development" )
                )
            );
            if (!$user)
                throw new \Exception( "de nieuwe gebruiker kan niet worden geretourneerd");

	        if ( $this->settings["environment"] !== "development" ) {
		        $this->sentEmailActivation( $user );
	        }

            return $response->withJSON($user);
        }
        catch( \Exception $e ){
            $sErrorMessage = $e->getMessage();
            if ( $user ) {
                $this->userResource->delete( $user["id"] );
            }
        }
        return $response->withStatus(404, rawurlencode( $sErrorMessage ) );
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

    }
}