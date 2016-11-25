<?php
/**
 * Created by PhpStorm.
 * User: cdunnink
 * Date: 15-11-2016
 * Time: 11:54
 */

namespace App\Action;

use Slim\ServerRequestInterface;
use Doctrine\ORM\EntityManager;
use \Firebase\JWT\JWT;
use \Slim\Middleware\JwtAuthentication;
use Symfony\Component\Serializer\Serializer;

final class AuthAction
{
	/**
	 * @var \Doctrine\ORM\EntityManager
	 */
	protected $entityManager = null;
    protected $jwtauth = null;
	protected $serializer = null;
	protected $settings = null;

	public function __construct( $settings, EntityManager $entityManager, JwtAuthentication $jwtauth, Serializer $serializer )
	{
		$this->settings = $settings;
		$this->entityManager = $entityManager;
        $this->jwtauth = $jwtauth;
		$this->serializer = $serializer;
	}

    public function activate($request, $response, $args)
    {
        $activationhashinput = $request->getParam('activationkey');
        $email = urldecode( $request->getParam('email') );

	    $sErrorMessage = null;
        try{
            $user = $this->entityManager->getRepository('App\Entity\User')->findOneBy(
                array( 'email' => $email )
            );

            if ( !$user ) {
                throw new \Exception( "ongeldige email-activatiesleutel-combinatie", E_ERROR );
            }

            $validactivationhash = hash ( "sha256", $user->getEmail() . $this->settings["auth"]["activationsecret"] );

            if ( $validactivationhash !== $activationhashinput ) {
                throw new \Exception( "ongeldige email-activatiesleutel-combinatie", E_ERROR );
            }

            if ( $user->getActive() ) {
                throw new \Exception( "je account is al actief", E_ERROR );
            }

            $user->setActive( true );
            $this->entityManager->persist($user);
            $this->entityManager->flush();

            return $response
                ->withStatus(201)
                ->write( true );
            ;
        }
        catch( \Exception $e ){
            $sErrorMessage = $e->getMessage();
        }
        return $response->withStatus(404, $sErrorMessage );
    }

	public function login($request, $response, $args)
	{
		$email = $request->getParam('email');
		$password = $request->getParam('password');

		$sErrorMessage = null;
		try{
			$user = $this->entityManager->getRepository('App\Entity\User')->findOneBy(
				array( 'email' => $email )
			);

            // check on active

            if (!$user or !password_verify( $password, $user->getPassword() ) ) {
				throw new \Exception( "ongeldige email(".$email.") en wachtwoord(".$password.") combinatie");
			}

            if ( !$user->getActive() ) {
                throw new \Exception( "activeer eerst je account met behulp van de link in je ontvangen email", E_ERROR );
            }

            $now = new \DateTime();
            $future = new \DateTime("now +2 hours");

            $payload = [
                "iat" => $now->getTimeStamp(),
                "exp" => $future->getTimeStamp(),
                "sub" => $email,
            ];

            $secret = $this->jwtauth->getSecret();
            $algorithm = $this->jwtauth->getAlgorithm();
            $token = JWT::encode($payload, $secret, $algorithm );

            $data["status"] = "ok";
            $data["token"] = $token;
			$data["user"] = $user;

			return $response
				->withStatus(201)
				->withHeader('Content-Type', 'application/json;charset=utf-8')
				->write($this->serializer->serialize( $data, 'json'));
			;
		}
		catch( \Exception $e ){
			$sErrorMessage = $e->getMessage();
		}
		return $response->withStatus(404, $sErrorMessage );
	}

	public function passwordreset( $request, $response, $args )
	{
		$email = $request->getParam('email');

		$sErrorMessage = null;
		try{
			$user = $this->entityManager->getRepository('App\Entity\User')->findOneBy(
				array( 'email' => $email )
			);

			if ( !$user ) {
				throw new \Exception( "het emailadres is onbekend", E_ERROR );
			}

			if ( !$user->getActive() ) {
				throw new \Exception( "activeer eerst je account met behulp van de link in je ontvangen email", E_ERROR );
			}

			if ( $this->settings["environment"] !== "development" ) {
				$this->sentEmailPasswordChange( $user );
			}

			return $response
				->withStatus(201)
				->write( true )
			;
		}
		catch( \Exception $e ){
			$sErrorMessage = $e->getMessage();
		}
		return $response->withStatus(404, $sErrorMessage );
	}

	protected function sentEmailPasswordChange( $user )
	{
		$now = new \DateTime();
		$future = ( new \DateTime("now" ) )->modify("+24 hours");

		$payload = [
			"iat" => $now->getTimeStamp(),
			"exp" => $future->getTimeStamp(),
			"sub" => $user->getEmail(),
		];

		$secret = $this->jwtauth->getSecret();
		$algorithm = $this->jwtauth->getAlgorithm();
		$token = JWT::encode($payload, $secret, $algorithm );

		$sMessage =
			"<div style=\"font-size:20px;\">FC Toernooi</div>"."<br>".
			"<br>".
			"Hallo ".$user->getName().","."<br>"."<br>".
			'Klik op <a href="'.$this->settings["www"]["url"].'passwordchange?key='.$token.'&email='.urlencode( $user->getEmail() ).'">deze link</a> om je wachtwoord te wijzigen.<br>'."<br>".
			'Je hebt 24 uur om je wachtwoord te wijzigen met deze link.<br>'."<br>".
			"groeten van FC Toernooi"
		;

		$mail = new \PHPMailer;
		$mail->isSMTP();
		$mail->Host = $this->settings["email"]["smtpserver"];
		$mail->setFrom( $this->settings["email"]["from"], $this->settings["email"]["fromname"] );
		$mail->addAddress( $user->getEmail() );
		$mail->addReplyTo( $this->settings["email"]["from"], $this->settings["email"]["fromname"] );
		$mail->isHTML(true);
		$mail->Subject = "FC Toernooi wachwoord-wijzigen";
		$mail->Body    = $sMessage;
		if(!$mail->send()) {
			throw new \Exception("de wachwoord-wijzigen email kan niet worden verzonden");
		}
	}

	public function passwordchange( $request, $response, $args )
	{
		$email = $request->getParam('email');
		$token = $request->getParam('key');
		$password = $request->getParam('password');

		$sErrorMessage = null;
		try{
			$user = $this->entityManager->getRepository('App\Entity\User')->findOneBy(
				array( 'email' => $email )
			);

			if ( !$user ) {
				throw new \Exception( "het emailadres is onbekend", E_ERROR );
			}

			if ( !$user->getActive() ) {
				throw new \Exception( "activeer eerst je account met behulp van de link in je ontvangen email", E_ERROR );
			}

			$secret = $this->jwtauth->getSecret();
			$algorithm = $this->jwtauth->getAlgorithm();

			$payloadback = JWT::decode( $token, $secret, [$algorithm] );
			$issuedDateTime = new \DateTime('@' . $payloadback->iat );
			$expiredDateTime = new \DateTime('@' . $payloadback->exp );
			// var_dump($dt->format('Y-m-d H:i:s'));

			$now = new \DateTime();
			if ( $now < $issuedDateTime or $now > $expiredDateTime )
				throw new \Exception("de link uit de email is niet meer geldig", E_ERROR);

			if ( $payloadback->sub != $email )
				throw new \Exception("de link uit de email is niet geldig", E_ERROR);

			$user->setPassword( password_hash( $password, PASSWORD_DEFAULT) );
            $this->entityManager->persist($user);
            $this->entityManager->flush();

			return $response
				->withStatus(201)
				->write( true )
				;
		}
		catch( \Exception $e ){
			$sErrorMessage = $e->getMessage();
		}
		return $response->withStatus(404, $sErrorMessage );
	}
}