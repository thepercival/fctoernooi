<?php
/**
 * Created by PhpStorm.
 * User: coen
 * Date: 1-10-17
 * Time: 12:29
 */

namespace App\Action;

use Slim\ServerRequestInterface;
use JMS\Serializer\Serializer;
use FCToernooi\CompetitionseasonRole\Repository as CompetitionseasonRoleRepository;
use FCToernooi\User as User;

final class CompetitionseasonRole
{
    /**
     * @var CompetitionseasonRoleRepository
     */
    private $competitionseasonRoleRepository;
    /**
     * @var Auth\Service
     */
    // private $authService;
    /**
     * @var Serializer
     */
    protected $serializer;
    /**
     * @var array
     */
    protected $settings;

    public function __construct(CompetitionseasonRoleRepository $competitionseasonRoleRepository, Serializer $serializer, $settings )
    {
        $this->competitionseasonRoleRepository = $competitionseasonRoleRepository;
        // $this->authService = new Auth\Service($userRepository);
        $this->serializer = $serializer;
        $this->settings = $settings;
    }

    public function fetch($request, $response, $args)
    {
        $users = $this->competitionseasonRoleRepository->findAll();
        return $response
            ->withHeader('Content-Type', 'application/json;charset=utf-8')
            ->write($this->serializer->serialize( $users, 'json'));
        ;
    }

    public function fetchOne($request, $response, $args)
    {
        $competitionseasonRole = $this->competitionseasonRoleRepository->find($args['id']);
        if ($competitionseasonRole) {
            return $response
                ->withHeader('Content-Type', 'application/json;charset=utf-8')
                ->write($this->serializer->serialize( $competitionseasonRole, 'json'));
            ;
        }
        return $response->withStatus(404, 'geen toernooirol met het opgegeven id gevonden');
    }
}