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

use FCToernooi\User as User;
use Voetbal\Association;
use Voetbal\Association\Repository as AssociationRepository;
use Voetbal\Association\Service as AssociationService;
use Voetbal\Competition;
use Voetbal\Competition\Repository as CompetitionRepository;
use Voetbal\Season;
use Voetbal\Season\Repository as SeasonRepository;
use Voetbal\CompetitionSeason;
use Voetbal\CompetitionSeason\Repository as CompetitionSeasonRepository;
use FCToernooi\CompetitionSeasonRole;
use FCToernooi\CompetitionSeasonRole\Repository as CompetitionSeasonRoleRepository;

class Service
{
    /**
     * @var AssociationRepository
     */
    protected $associationRepos;

    /**
     * @var CompetitionRepository
     */
    protected $competitionRepos;

    /**
     * @var SeasonRepository
     */
    protected $seasonRepos;

    /**
     * @var CompetitionSeasonRepository
     */
    protected $competitionSeasonRepos;

    /**
     * @var CompetitionSeasonRoleRepository
     */
    protected $competitionSeasonRoleRepos;

    /**
     * Service constructor.
     * @param AssociationRepository $associationRepos
     * @param CompetitionRepository $competitionRepos
     * @param SeasonRepository $seasonRepos
     * @param CompetitionSeasonRepository $competitionSeasonRepos
     * @param CompetitionSeasonRoleRepository $competitionSeasonRoleRepos
     */
    public function __construct(
        AssociationRepository $associationRepos,
        CompetitionRepository $competitionRepos,
        SeasonRepository $seasonRepos,
        CompetitionSeasonRepository $competitionSeasonRepos,
        CompetitionSeasonRoleRepository $competitionSeasonRoleRepos
    )
    {
        $this->associationRepos = $associationRepos;
        $this->competitionRepos = $competitionRepos;
        $this->seasonRepos = $seasonRepos;
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
    public function create( User $user, $name, $sportName, $nrOfCompetitors, $equalNrOfGames )
    {
        // association, check als bestaat op basis van naam, zoniet, aak aan
        $association = $this->associationRepos->findOneBy(
            array( 'name' => $user->getName() )
        );
        if( $association === null ){
            $assService = new AssociationService( $this->associationRepos );
            $association = $assService->create( $user->getName() );
        }

        // check competition, check als naam niet bestaat
        $competition = $this->competitionRepos->findOneBy( array('name' => $name ) );
        if ( $competition !== null ){
            throw new \Exception("de competitienaam bestaat al", E_ERROR );
        }
        $compService = new CompetitionService( $this->competitionRepos );
        $competition = $compService->create( $name );

        // check season, per jaar een seizoen, als seizoen niet bestaat, dan aanmaken
        doe dat dus..

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