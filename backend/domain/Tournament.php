<?php
/**
 * Created by PhpStorm.
 * User: coen
 * Date: 6-10-17
 * Time: 22:50
 */

namespace FCToernooi;

use \Doctrine\Common\Collections\ArrayCollection;
use Voetbal\Competitionseason;

class Tournament
{
    /**
     * @var int
     */
    private $id;

    /**
     * @var Competitionseason
     */
    private $competitionseason;

    /**
     * @var \DateTime
     */
    private $startDateTime;

    /**
     * @var ArrayCollection
     */
    private $roles;

    const MINNROFCOMPETITORS = 2;
    const MAXNROFCOMPETITORS = 32;

    public function __construct( Competitionseason $competitionseason )
    {
        $this->competitionseason = $competitionseason;
        $this->roles = new ArrayCollection();
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
    public function getCompetitionseason()
    {
        return $this->competitionseason;
    }

    /**
     * @param Competitionseason $competitionseason
     */
    public function setCompetitionseason( Competitionseason $competitionseason )
    {
        $this->competitionseason = $competitionseason;
    }

    /**
     * @return \DateTime
     */
    public function getStartDateTime()
    {
        return $this->startDateTime;
    }

    /**
     * @param \DateTime $datetime
     */
    public function setStartDateTime( \DateTime $datetime )
    {
        $this->startDateTime = $datetime;
    }

    /**
     * @return Role[] | ArrayCollection
     */
    public function getRoles()
    {
        return $this->roles;
    }

    /**
     * @param ArrayCollection $roles
     */
    public function setRoles( ArrayCollection $roles)
    {
        $this->roles = $roles;
    }

    public function hasRole( User $user, $role ) {
        return ( count(array_filter( $this->getRoles()->toArray(), function ( $roleIt, $roleId ) use ( $user, $role ) {
            return ( $roleIt->getUser() === $user && $roleIt->getRole() === $role );
        }, ARRAY_FILTER_USE_BOTH)) === 1);
    }
}