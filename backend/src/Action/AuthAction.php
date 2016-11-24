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

	public function __construct(EntityManager $entityManager, JwtAuthentication $jwtauth, Serializer $serializer )
	{
		$this->entityManager = $entityManager;
        $this->jwtauth = $jwtauth;
		$this->serializer = $serializer;
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

            if (!$user or !password_verify( $password, $user->getPassword() ) ) {
				throw new \Exception( "ongeldige email(".$email.") en wachtwoord(".$password.") combinatie");
			}

			// return token
            ////////////////////////////////////////////
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
}