<?php
/**
 * Created by PhpStorm.
 * User: coen
 * Date: 10-10-17
 * Time: 12:27
 */

namespace FCToernooi\Tournament;

use FCToernooi\Tournament;

/**
 * Class Repository
 * @package Voetbal\Competitionseason
 */
class Repository extends \Voetbal\Repository
{
    public function merge( Tournament $tournament )
    {
        return $this->_em->merge( $tournament );
    }



}