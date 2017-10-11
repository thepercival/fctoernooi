/**
 * Created by coen on 11-10-17.
 */
import { OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentRepository } from './repository';
import { Tournament } from '../tournament';
import { StructureService } from 'voetbaljs/structure/service';
import { RoundRepository } from 'voetbaljs/round/repository';

export class TournamentComponent implements OnInit, OnDestroy {

    tournament: Tournament;
    protected sub: any;
    protected route: ActivatedRoute;
    protected router: Router;
    protected tournamentRepository: TournamentRepository;
    protected roundRepository: RoundRepository;
    protected structureService: StructureService;

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

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.tournamentRepository.getObject( +params['id'] )
                .subscribe(
                    /* happy path */ tournament => {
                        this.tournament = tournament;

                        this.roundRepository.getObjects( tournament.getCompetitionseason() )
                            .subscribe(
                                /* happy path */ rounds => {
                                    this.structureService = new StructureService( tournament.getCompetitionseason(), rounds );
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
