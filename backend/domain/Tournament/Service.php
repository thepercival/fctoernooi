<?php
/**
 * Created by PhpStorm.
 * User: coen
 * Date: 1-10-17
 * Time: 21:41
 */

/*
 * this service should be a wrapper to create a competitionseason and competitionseasonroles!!!
 */

namespace FCToernooi\Tournament;

use Voetbal\CompetitionSeason;
use Voetbal\CompetitionSeason\Repository as CompetitionSeasonRepository;
use FCToernooi\CompetitionSeasonRole;
use FCToernooi\CompetitionSeasonRole\Repository as CompetitionSeasonRoleRepository;

class Service
{
    /**
     * @var AssociationRepository
     */
    protected $repos;

    /**
     * Service constructor.
     *
     * @param CompetitionSeasonRepository $competitionSeasonRepos
     * @param CompetitionSeasonRoleRepository $competitionSeasonRoleRepos
     */
    public function __construct( competitionSeasonRepository $competitionSeasonRepos, CompetitionSeasonRoleRepository $competitionSeasonRoleRepos )
    {
        $this->competitionSeasonRepos = $competitionSeasonRepos;
        $this->competitionSeasonRoleRepos = $competitionSeasonRoleRepos;
    }

    /**
     * @param $name
     * @param $sportName
     * @param $nrOfCompetitors
     * @param $equalNrOfGames
     * @return bool
     * @throws \Exception
     */
    public function create( $name, $sportName, $nrOfCompetitors, $equalNrOfGames )
    {
        // create association
        // check if ass with username exists
        // if not create

        // create competition
        // create season
        // create competitionseason
        // create competitionseasonroles

//        $name,
//        $sportName,
//        $nrOfCompetitors,
//        $equalNrOfGames

//        $association = new Association( $name );
//        $association->setDescription($description);
//        $association->setParent($parent);
//
//        $associationWithSameName = $this->repos->findOneBy( array('name' => $name ) );
//        if ( $associationWithSameName !== null ){
//            throw new \Exception("de bondsnaam ".$name." bestaat al", E_ERROR );
//        }
//        $association = null;

        return false; //$this->repos->save($association);
    }

    /**
     * @param Association $association
     * @param $name
     * @param $description
     * @param Association $parent
     * @throws \Exception
     */
//    public function edit( Association $association, $name, $description, Association $parent = null )
//    {
//        $associationWithSameName = $this->repos->findOneBy( array('name' => $name ) );
//        if ( $associationWithSameName !== null and $associationWithSameName !== $association ){
//            throw new \Exception("de bondsnaam ".$name." bestaat al", E_ERROR );
//        }
//
//        $association->setName($name);
//        $association->setDescription($description);
//        $association->setParent($parent);
//
//        return $this->repos->save($association);
//    }

    /**
     * @param Association $association
     */
    public function remove( Association $association )
    {
        $this->repos->remove($association);
    }
}