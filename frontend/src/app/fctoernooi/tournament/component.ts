/**
 * Created by coen on 11-10-17.
 */
import { OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentRepository } from './repository';
import { Tournament } from '../tournament';
import { StructureService } from 'voetbaljs/structure/service';
import { RoundRepository } from 'voetbaljs/round/repository';
import { Round } from 'voetbaljs/round';
import { RoundScoreConfigRepository } from 'voetbaljs/round/scoreconfig/repository';
import { RoundConfigRepository } from 'voetbaljs/round/config/repository';

export class TournamentComponent implements OnDestroy {

    tournament: Tournament;
    protected sub: any;
    protected route: ActivatedRoute;
    protected router: Router;
    protected tournamentRepository: TournamentRepository;
    protected roundRepository: RoundRepository;
    public structureService: StructureService;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        roundRepository: RoundRepository
    ) {
        this.route = route;
        this.router = router;
        this.tournamentRepository = tournamentRepository;
        this.roundRepository = roundRepository;
    }

    myNgOnInit( callback: DataProcessCallBack = null ) {
        this.sub = this.route.params.subscribe(params => {
            this.tournamentRepository.getObject( +params['id'] )
                .subscribe(
                    /* happy path */ (tournament: Tournament) => {
                        this.tournament = tournament;



                        this.roundRepository.getObject( tournament.getCompetitionseason() )
                            .subscribe(
                                /* happy path */ (round: Round ) => {
                                    this.structureService = new StructureService(
                                        tournament.getCompetitionseason(),
                                        round,
                                        new RoundConfigRepository(),
                                        new RoundScoreConfigRepository(),
                                        { min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS }
                                    );
                                    if ( callback !== null ) {
                                        callback();
                                    }
                                },
                                /* error path */ e => {},
                                /* onComplete */ () => {}
                            );
                    },
                    /* error path */ e => {},
                    /* onComplete */ () => {}
                );
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}

type DataProcessCallBack = () => void;
