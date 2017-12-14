/**
 * Created by coen on 11-10-17.
 */
import { OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Round } from 'voetbaljs/round';
import { StructureRepository } from 'voetbaljs/structure/repository';
import { StructureService } from 'voetbaljs/structure/service';

import { Tournament } from '../tournament';
import { TournamentRepository } from './repository';

export class TournamentComponent implements OnDestroy {

    tournament: Tournament;
    protected sub: any;
    protected route: ActivatedRoute;
    protected router: Router;
    protected tournamentRepository: TournamentRepository;
    protected structureRepository: StructureRepository;
    public structureService: StructureService;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository
    ) {
        this.route = route;
        this.router = router;
        this.tournamentRepository = tournamentRepository;
        this.structureRepository = structureRepository;
    }

    myNgOnInit(callback: DataProcessCallBack = null) {
        this.sub = this.route.params.subscribe(params => {
            this.tournamentRepository.getObject(+params['id'])
                .subscribe(
                    /* happy path */(tournament: Tournament) => {
                    this.tournament = tournament;



                    this.structureRepository.getObject(tournament.getCompetitionseason())
                        .subscribe(
                                /* happy path */(round: Round) => {
                            this.structureService = new StructureService(
                                tournament.getCompetitionseason(),
                                { min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS },
                                round
                            );
                            if (callback !== null) {
                                callback();
                            }
                        },
                                /* error path */ e => { },
                                /* onComplete */() => { }
                        );
                },
                    /* error path */ e => { },
                    /* onComplete */() => { }
                );
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}

type DataProcessCallBack = () => void;
