<?php
/**
 * Created by PhpStorm.
 * User: cdunnink
 * Date: 15-11-2016
 * Time: 09:36
 */

namespace App\Entity;

use App\Entity;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="users")
 */
class User
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
     * @ORM\Column(type="string", length=64)
     */
    protected $name;

	/**
	 * @ORM\Column(type="string", length=256)
	 */
	protected $password = null;

    /**
     * @ORM\Column(type="string", length=100)
     */
    protected $email;

    /**
     * @ORM\ManyToMany(targetEntity="CompetitionSeason", inversedBy="users")
     * @ORM\JoinTable(name="users_competitionseasons")
     */
    private $competitionseasons;

    public function __construct() {
        $this->competitionseasons = new \Doctrine\Common\Collections\ArrayCollection();
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
	 * Get password
	 *
	 * @ORM\return string
	 */
	public function getPassword()
	{
		return $this->password;
	}

	/**
	 * Set password
	 *
	 * @ORM\param string
	 * @ORM\return void
	 */
	public function setPassword( $password )
	{
		$this->password = $password;
	}

    /**
     * Get email
     *
     * @ORM\return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * Set email
     *
     * @ORM\param string
     * @ORM\return void
     */
    public function setEmail( $email )
    {
        $this->email = $email;
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