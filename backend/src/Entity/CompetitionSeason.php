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
use Doctrine\Common\Collections\ArrayCollection;

/**
 * @ORM\Entity
 * @ORM\Table(name="competitionseasons")
 */
class CompetitionSeason implements \JsonSerializable
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
	 * @ORM\ManyToMany(targetEntity="User", mappedBy="competitionseasons", fetch="EAGER")
	 * @ORM\JoinTable(name="users_competitionseasons")
	 */
    private $users;

    public function __construct() {
        $this->users = new ArrayCollection();
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
	 * get Users
	 *
	 * @ORM\return ArrayCollection
	 */
	public function getUsers()
	{
		return $this->users;
	}

	/**
	 * adds a User
	 *
	 * @ORM\return null
	 */
	public function addUser( User $user = null  )
	{
		if ( $user === null )
			return;

		$this->users->add( $user );
		$user->getCompetitionSeasons()->add( $this );
	}

    /**
     * Get array copy of object
     *
     * @return array
     */
    /*public function getArrayCopy()
    {
	    return get_object_vars($this);
    }*/

	public function jsonSerialize() {

		/*$
		arr = get_object_vars($this);
		foreach( $arr as $key => $s ){
			var_dump( $key );
			var_dump( get_class($s) );
			if ( $s instanceof ArrayCollection )
				var_dump( count( $s ) );
		}
		die();*/

		get_object_vars($this); // $this->getArrayCopy();
	}


}