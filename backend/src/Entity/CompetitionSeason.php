<?php
/**
 * Created by PhpStorm.
 * User: cdunnink
 * Date: 15-11-2016
 * Time: 16:25
 */

namespace App\Entity;

use App\Entity;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="competitionseasons")
 */
class CompetitionSeason
{
    /**
     * @var integer
     *
     * @ORM\Id
     * @ORM\Column(name="id", type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     *
     * CONST MAX_NAME_LENGTH = 20;
     *
     * @ORM\Column(type="string", length=20)
     */
    protected $name;

    /**
     * CONST MAX_NAME_LENGTH = 9;
     *
     * @ORM\Column(type="string", length=9)
     */
    protected $seasonname;

    /**
     * @ORM\Column(type="json_array")
     */
    protected $structure;

    /**
     * @ORM\ManyToMany(targetEntity="User", mappedBy="competitionseasons")
     */
    private $users;

    public function __construct() {
        $this->users = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * Get photo id
     *
     * @ORM\return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Get name
     *
     * @ORM\return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set name
     *
     * @ORM\param string
     * @ORM\return void
     */
    public function setName( $name )
    {
        $this->name = $name;
    }

    /**
     * Get seasonname
     *
     * @ORM\return string
     */
    public function getSeasonName()
    {
        return $this->seasonname;
    }

    /**
     * Set seasonname
     *
     * @ORM\param string
     * @ORM\return void
     */
    public function setSeasonName( $seasonname )
    {
        $this->seasonname = $seasonname;
    }

    /**
     * Get structure
     *
     * @ORM\return json_array
     */
    public function getStructure()
    {
        return $this->structure;
    }

    /**
     * Set structure
     *
     * @ORM\param json_array
     * @ORM\return void
     */
    public function setStructure( $structure )
    {
        $this->structure = $structure;
    }

    /**
     * Get array copy of object
     *
     * @return array
     */
    public function getArrayCopy()
    {
        return get_object_vars($this);
    }
}