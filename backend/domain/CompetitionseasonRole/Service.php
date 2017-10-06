<?php
/**
 * Created by PhpStorm.
 * User: coen
 * Date: 1-10-17
 * Time: 12:14
 */

namespace FCToernooi\CompetitionseasonRole;

use Repository as CompetitionseasonRoleRepository;
use Voetbal\Competitionseason;
use FCToernooi\CompetitionseasonRole as CompetitionseasonRole;
use FCToernooi\User as User;


class Service
{
    /**
     * @var CompetitionseasonRoleRepository
     */
    protected $repos;

    /**
     * Service constructor.
     *
     * @param CompetitionseasonRoleRepository $repos
     */
    public function __construct( CompetitionseasonRoleRepository $repos )
    {
        $this->repos = $repos;
    }

    /**
     * @param CompetitionSeason $competitionseason
     * @param User $user
     * @param int $roles
     * @return CompetitionseasonRole
     * @throws \Exception
     */
    public function putRoles( CompetitionSeason $competitionseason, User $user, $roles )
    {
        // get roles

        try {

            // flush roles

            // save roles
            for( $role = 1 ; $role < CompetitionseasonRole::ALL ; $role *= 2 ){
                if ( ( $role & $roles ) !== $role ){
                    continue;
                }
                $competitionseasonRole = new CompetitionseasonRole( $competitionseason, $user );
                $competitionseasonRole->putRole( $role );
                $this->repos->save($competitionseasonRole);
            }
        }
        catch( \Exception $e ){
            throw new \Exception(urlencode($e->getMessage()), E_ERROR );
        }

        // return roles

    }

    /**
     * @param Competitionseason $competitionseason
     */
    protected function flushRoles( Competitionseason $competitionseason, User $user )
    {
        $this->repos->remove($competitionseason);
    }
}