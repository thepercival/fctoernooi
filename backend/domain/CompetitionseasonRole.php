<?php
/**
 * Created by PhpStorm.
 * User: coen
 * Date: 1-10-17
 * Time: 12:08
 */


namespace FCToernooi;

// use \Doctrine\Common\Collections\ArrayCollection;
use \Auth\User as User;

class CompetitionseasonRole
{
    /**
     * @var int
     */
    private $id;

    /**
     * @var CompetitionSeason
     */
    private $competitionseason;

    /**
     * @var User
     */
    private $user;

    /**
     * @var int
     */
    private $role;

    const ADMIN = 1;
    const STRUCTUREADMIN = 2;
    const PLANNER = 4;
    const GAMERESULTADMIN = 8;
    const ALL = 15;

    public function __construct( Competitionseason $competitionseason, User $user )
    {
        $this->competitionseason = $competitionseason;
        $this->user = $user;
    }

    /**
     * Get id
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param $id
     */
    public function setId( $id )
    {
        $this->id = $id;
    }

    /**
     * @return Competitionseason
     */
    public function getCompetitionSeason()
    {
        return $this->competitionseason;
    }

    /**
     * @param User $user
     */
    public function getUser( User $user )
    {
        return $this->user;
    }

    /**
     * @return int
     */
    public function getRole()
    {
        return $this->role;
    }

    /**
     * @param int $role
     */
    public function setRole( $role )
    {
        if ( !is_int( $role ) or ( ( $role & static::ALL ) !== $role ) ){
            throw new \InvalidArgumentException( "de rol heeft een onjuiste waarde", E_ERROR );
        }
        $this->role = $role;
    }
}