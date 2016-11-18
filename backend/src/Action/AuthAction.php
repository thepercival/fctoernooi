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

final class AuthAction
{
	/**
	 * @var \Doctrine\ORM\EntityManager
	 */
	protected $entityManager = null;

	public function __construct(EntityManager $entityManager)
	{
		$this->entityManager = $entityManager;
	}

	public function login($request, $response, $args)
	{
		$email = $request->getParam('email');
		$password = $request->getParam('password');

		$sErrorMessage = null;
		try{
			$user = $this->entityManager->getRepository('App\Entity\User')->findOneBy(
				array(
					'email' => $email,
					'password' => $password,
				)
			);

			if (!$user) {
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
            // get from settings
            $secret = "supersecretkeyyoushouldnotcommittogithub";

            $token = JWT::encode($payload, $secret, "HS256");

            $data["status"] = "ok";
            $data["token"] = $token;

            return $response->withStatus(201)
                ->withHeader("Content-Type", "application/json")
                ->write(json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
		}
		catch( \Exception $e ){
			$sErrorMessage = $e->getMessage();
		}
		return $response->withStatus(404, $sErrorMessage );
	}
}