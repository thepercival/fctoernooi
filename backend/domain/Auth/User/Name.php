<?php
/**
 * Created by PhpStorm.
 * User: coen
 * Date: 28-1-17
 * Time: 20:43
 */

namespace FCToernooi\Auth\User;

class Name
{
	private $name;
	const MIN_LENGTH = 3;
	const MAX_LENGTH = 15;

	public function __construct( $name )
	{
		if ( strlen( $name ) < static::MIN_LENGTH or strlen( $name ) > static::MAX_LENGTH ){
			throw new \InvalidArgumentException( "de naam moet minimaal ".static::MIN_LENGTH." karakters bevatten en mag maximaal ".static::MAX_LENGTH." karakters bevatten", E_ERROR );
		}

		if( !ctype_alnum($name)){
			throw new \InvalidArgumentException( "de naam mag alleen cijfers en letters bevatten", E_ERROR );
		}

		$this->name = $name;
	}

	public function __toString()
	{
		return $this->name;
	}
}