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
     * @var ArrayCollection
     */
    private $roles;

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
}