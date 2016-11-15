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
                    return $competitionseason->getArrayCopy();
                },
                $competitionseasons
            );

            return $competitionseasons;
        } else {
            $competitionseason = $this->entityManager->getRepository('App\Entity\CompetitionSeason')->findOneBy(
                array('id' => $id)
            );
            if ($competitionseason) {
                return $competitionseason->getArrayCopy();
            }
        }
        return null;
    }

    public function post( $arrProps )
    {
        $name = $arrProps['name'];
        $seasonname = $arrProps['seasonname'];
        $structure = $arrProps['structure'];

        // handle if $id is missing or $name or $email are valid etc.
        // return valid status code or throw an exception
        // depends on the concrete implementation

        /** @var CompetitionSeason $competitionseason */
        $competitionseason = new CompetitionSeason();
        $competitionseason->setName($name);
        $competitionseason->setSeasonName($seasonname);
        $competitionseason->setStructure($structure);

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

        /** @var CompetitionSeason $competitionseason */
        $competitionseason = $this->entityManager->find('App\Entity\CompetitionSeason', $id);
        if ( $competitionseason === null )
            return false;

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