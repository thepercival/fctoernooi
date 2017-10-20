<?php
/**
 * Created by PhpStorm.
 * User: coen
 * Date: 1-10-17
 * Time: 21:41
 */

namespace FCToernooi\Tournament;

use FCToernooi\User as User;
use Voetbal\Association;
use Voetbal\Competition;
use Voetbal\Season;
use Voetbal\Competitionseason;
use FCToernooi\Tournament;
use FCToernooi\Tournament\Repository as TournamentRepository;
use FCToernooi\Tournament\Role\Repository as TournamentRoleRepository;
use FCToernooi\Tournament\Role\Service as TournamentRoleService;
use League\Period\Period;
use Doctrine\ORM\EntityManager as EntityManager;

class Service
{

    /**
     * @var \Voetbal\Service
     */
    protected $voetbalService;
    /**
     * @var TournamentRepository
     */
    protected $repos;
    /**
     * @var TournamentRoleRepository
     */
    protected $tournamentRoleRepos;

    /**
     * @var EntityManager
     */
    protected $em;


    /**
     * Service constructor.
     * @param \Voetbal\Service $voetbalService
     * @param TournamentRoleRepository $tournamentRoleRepos
     * @param EntityManager $em
     */
    public function __construct(
        \Voetbal\Service $voetbalService,
        TournamentRepository $tournamentRepos,
        TournamentRoleRepository $tournamentRoleRepos,
        EntityManager $em
    )
    {
        $this->voetbalService = $voetbalService;
        $this->repos = $tournamentRepos;
        $this->tournamentRoleRepos = $tournamentRoleRepos;
        $this->em = $em;
    }

    /**
     * @param $name
     * @param $sportName
     * @param $nrOfCompetitors
     * @return bool
     * @throws \Exception
     */
    public function create( User $user, $name, $sportName, $nrOfCompetitors )
    {
        $this->em->getConnection()->beginTransaction();

        try {
            // association, check als bestaat op basis van naam, zoniet, aak aan
            $associationRepos = $this->voetbalService->getRepository(Association::class);
            $association = $associationRepos->findOneBy(
                array( 'name' => $user->getName() )
            );
            if( $association === null ){
                $assService = $this->voetbalService->getService( Association::class );
                $association = $assService->create( $user->getName() );
            }

            // check competition, check als naam niet bestaat
            $competitionRepos = $this->voetbalService->getRepository(Competition::class);
            $competition = $competitionRepos->findOneBy( array('name' => $name ) );
            if ( $competition !== null ){
                throw new \Exception("de competitienaam bestaat al", E_ERROR );
            }
            $compService = $this->voetbalService->getService( Competition::class );
            $competition = $compService->create( $name );

            // check season, per jaar een seizoen, als seizoen niet bestaat, dan aanmaken
            $year = date("Y");
            $seasonRepos = $this->voetbalService->getRepository( Season::class );
            $season = $seasonRepos->findOneBy(
                array('name' => $year )
            );
            if( $season === null ){
                $seasonService = $this->voetbalService->getService( Season::class );
                $period = new Period( new \DateTime($year."-01-01"), new \DateTime($year."-12-31") );
                $season = $seasonService->create( $year, $period );
            }

            // create competitionseason
            $csRepos = $this->voetbalService->getRepository(Competitionseason::class);
            $competitionseason = $csRepos->findOneBy(
                array('competition' => $competition, 'season' => $season, 'association' => $association )
            );
            if ( $competitionseason !== null ){
                throw new \Exception("het toernooi bestaat al", E_ERROR );
            }
            $csService = $this->voetbalService->getService(Competitionseason::class);
            $competitionseason = $csService->create( $association, $competition, $season );
            $competitionseason->setSport($sportName);
            $csRepos->save($competitionseason);

            $tournament = new Tournament( $competitionseason );
            $this->repos->save($tournament);

            $tournamentRoleService = new TournamentRoleService( $this->tournamentRoleRepos );
            $tournamentRoles = $tournamentRoleService->set( $tournament, $user, Role::ALL );

            if ( $nrOfCompetitors < Tournament::MINNROFCOMPETITORS ){
                throw new \Exception("het minimum aantal deelnemer is " . Tournament::MINNROFCOMPETITORS);
            }
            if ( $nrOfCompetitors > Tournament::MAXNROFCOMPETITORS ){
                throw new \Exception("het minimum aantal deelnemer is " . Tournament::MAXNROFCOMPETITORS);
            }
            // create structure op basis van $nrOfCompetitors, $equalNrOfGames
            $structureService = $this->voetbalService->getService(\Voetbal\Structure::class);
            $structureService->create( $competitionseason, $nrOfCompetitors );

            $this->em->getConnection()->commit();

            return $tournament;
        } catch (\Exception $e) {
            // Rollback the failed transaction attempt
            $this->em->getConnection()->rollback();
            throw $e;
        }

        return null; //$this->repos->save($association);
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
     * @param Tournament $tournament
     */
    public function remove( Tournament $tournament )
    {
        $competitionRepos = $this->voetbalService->getRepository(Competition::class);
        return $competitionRepos->remove( $tournament->getCompetitionseason()->getCompetition() );
    }
}