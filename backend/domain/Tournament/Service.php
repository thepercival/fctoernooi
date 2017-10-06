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
use Voetbal\Competition\Service as CompetitionService;
use Voetbal\Season;
use Voetbal\Season\Repository as SeasonRepository;
use Voetbal\Season\Service as SeasonService;
use Voetbal\CompetitionSeason;
use Voetbal\CompetitionSeason\Repository as CompetitionSeasonRepository;
use Voetbal\Competitionseason\Service as CompetitionseasonService;
use FCToernooi\CompetitionSeasonRole;
use FCToernooi\CompetitionSeasonRole\Repository as CompetitionSeasonRoleRepository;
use League\Period\Period;

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
     * @var CompetitionseasonRepository
     */
    protected $competitionseasonRepos;

    /**
     * @var CompetitionSeasonRoleRepository
     */
    protected $competitionseasonRoleRepos;

    /**
     * Service constructor.
     * @param AssociationRepository $associationRepos
     * @param CompetitionRepository $competitionRepos
     * @param SeasonRepository $seasonRepos
     * @param CompetitionSeasonRepository $competitionseasonRepos
     * @param CompetitionSeasonRoleRepository $competitionseasonRoleRepos
     */
    public function __construct(
        AssociationRepository $associationRepos,
        CompetitionRepository $competitionRepos,
        SeasonRepository $seasonRepos,
        CompetitionSeasonRepository $competitionseasonRepos,
        CompetitionSeasonRoleRepository $competitionseasonRoleRepos
    )
    {
        $this->associationRepos = $associationRepos;
        $this->competitionRepos = $competitionRepos;
        $this->seasonRepos = $seasonRepos;
        $this->competitionseasonRepos = $competitionseasonRepos;
        $this->competitionseasonRoleRepos = $competitionseasonRoleRepos;
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
        $year = date("Y");
        $season = $this->seasonRepos->findOneBy(
            array('name' => $year )
        );
        if( $season === null ){
            $seasonService = new SeasonService( $this->seasonRepos );
            $period = new Period( new \DateTime($year."-01-01"), new \DateTime($year."-12-31") );
            $season = $seasonService->create( $year, $period );
        }

        // create competitionseason
        $competitionseason = $this->competitionseasonRepos->findOneBy(
            array('competition' => $competition, 'season' => $season, 'association' => $association )
        );
        if ( $competitionseason !== null ){
            throw new \Exception("het toernooi bestaat al", E_ERROR );
        }
        $competitionseasonService = new CompetitionseasonService( $this->competitionseasonRepos );
        $competitionseason = $competitionseasonService->create( $association, $competition, $season );
        $competitionseason->setSport($sportName);
        $this->competitionseasonRepos->save($competitionseason);

        // create competitionseasonroles

        // create structure op basis van $nrOfCompetitors, $equalNrOfGames
        // zie basis settings in oude structuur

        return $competition; //$this->repos->save($association);
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