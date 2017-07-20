<?php
/**
 * Created by PhpStorm.
 * User: coen
 * Date: 28-1-17
 * Time: 20:44
 */

namespace FCToernooi\Auth\User;

class Emailaddress
{
	private $emailaddress;
	const MIN_LENGTH = 6;
	const MAX_LENGTH = 100;

	public function __construct( $emailaddress )
	{
		if ( strlen( $emailaddress ) < static::MIN_LENGTH or strlen( $emailaddress ) > static::MAX_LENGTH ){
			throw new \InvalidArgumentException( "het emailadres moet minimaal ".static::MIN_LENGTH." karakters bevatten en mag maximaal ".static::MAX_LENGTH." karakters bevatten", E_ERROR );
		}

		if (!filter_var($emailaddress, FILTER_VALIDATE_EMAIL)) {
			throw new \InvalidArgumentException( "het emailadres ".$emailaddress." is niet valide", E_ERROR );
		}

		$this->emailaddress = $emailaddress;
	}

	public function __toString()
	{
		return $this->emailaddress;
	}
}