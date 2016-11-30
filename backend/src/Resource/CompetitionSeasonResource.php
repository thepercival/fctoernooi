<?php
/**
 * Created by PhpStorm.
 * CompetitionSeason: cdunnink
 * Date: 15-11-2016
 * Time: 16:25
 */

namespace App\Resource;

use App\AbstractResource;
use App\Entity\CompetitionSeason;


/**
 * Class Resource
 * @package App
 */
class CompetitionSeasonResource extends AbstractResource
{

    /**
     * @param $id
     *
     * @return string
     */
    public function get($id = null)
    {
        if ($id === null) {
            $competitionseasons = $this->entityManager->getRepository('App\Entity\CompetitionSeason')->findAll();
            $competitionseasons = array_map(
                function ($competitionseason) {
	                return $competitionseason;
                },
                $competitionseasons
            );

            return $competitionseasons;
        } else {
	        /** @var \App\Entity\CompetitionSeason $competitionseason */
            $competitionseason = $this->entityManager->getRepository('App\Entity\CompetitionSeason')->findOneBy(
                array('id' => $id)
            );
            if ($competitionseason) {
	            return $competitionseason;
            }
        }
        return null;
    }

	/**
	 * @param $id
	 *
	 * @return string
	 */
	public function getBy( $arrProps  )
	{
		return $this->entityManager->getRepository('App\Entity\CompetitionSeason')->findBy( $arrProps );
	}

    public function post( $arrProps )
    {
        $name = $arrProps['name'];
        $seasonname = $arrProps['seasonname'];
        $structure = $arrProps['structure'];

        if ( strlen( $name ) < 2 )
            throw new \Exception("de naam moet minimaal 2 karakters lang zijn", E_ERROR );
        if ( strlen( $name ) > 25 )
            throw new \Exception("de naam mag maximaal 25 karakters lang zijn", E_ERROR );
        if ( strlen( $seasonname ) > 9 )
            throw new \Exception("de seizoensnaam mag maximaal 9 karakters lang zijn", E_ERROR );

        /** @var CompetitionSeason $competitionseason */
        $competitionseason = new CompetitionSeason();
        $competitionseason->setName($name);
        $competitionseason->setSeasonName($seasonname);
        $competitionseason->setStructure($structure);

	    if( array_key_exists( "userid", $arrProps) and is_numeric( $arrProps["userid"] ) )
	    {
		    $user = $this->entityManager->find('App\Entity\User', $arrProps["userid"] );
		    if ( $user === null )
			    throw new \Exception("bij de meegegeven gebruikersid ".$arrProps["userid"].", kan geen gebruiker worden gevonden", E_ERROR );

			$competitionseason->addUser( $user );
	    }

	    $this->entityManager->persist($competitionseason);
	    $this->entityManager->flush();

	    return $this->convertToArray($competitionseason);
    }

    public function put( $id, $arrProps )
    {
        $name = $arrProps['name'];
        $seasonname = $arrProps['seasonname'];
        $structure = $arrProps['structure'];

        // handle if $id is missing or $name or $email are valid etc.
        // return valid status code or throw an exception
        // depends on the concrete implementation

        $competitionseason = $this->entityManager->find('App\Entity\CompetitionSeason', $id);
	    if ( $competitionseason === null )
		    throw new \Exception("het te wijzigen toernooi met id ".$id.", kan niet worden gevonden", E_ERROR );

        $competitionseason->setName($name);
        $competitionseason->setSeasonName($seasonname);
        $competitionseason->setStructure($structure);

        $this->entityManager->persist($competitionseason);
        $this->entityManager->flush();

        return $this->convertToArray($competitionseason);
    }

    public function delete( $id )
    {
        // handle if $id is missing or $name or $email are valid etc.
        // return valid status code or throw an exception
        // depends on the concrete implementation

        /** @var CompetitionSeason $competitionseason */
        $competitionseason = $this->entityManager->find('App\Entity\CompetitionSeason', $id);
        if ( $competitionseason === null )
            return false;

        $this->entityManager->remove($competitionseason);;
        $this->entityManager->flush();

        return $competitionseason;
    }

    private function convertToArray(CompetitionSeason $competitionseason)
    {
        return array(
            'id' => $competitionseason->getId(),
            'name' => $competitionseason->getName(),
            'seasonname' => $competitionseason->getSeasonName(),
            'structure' => $competitionseason->getStructure()
        );

    }
}