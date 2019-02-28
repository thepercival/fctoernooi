import { ActivatedRoute, Router } from '@angular/router';
import { Structure, StructureRepository, StructureService } from 'ngx-sport';

import { IAlert } from '../common/alert';
import { Tournament } from '../lib/tournament';
import { TournamentRepository } from '../lib/tournament/repository';

/**
 * Created by coen on 11-10-17.
 */
export class TournamentComponent {

    public tournament: Tournament;
    protected route: ActivatedRoute;
    protected router: Router;
    protected tournamentRepository: TournamentRepository;
    protected structureRepository: StructureRepository;
    public structure: Structure;
    public alert: IAlert;
    public processing = true;

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

    myNgOnInit(callback?: DataProcessCallBack) {
        this.route.params.subscribe(params => {
            this.setData(+params['id'], callback);
        });
    }

    setData(tournamentId: number, callback?: DataProcessCallBack) {
        this.tournamentRepository.getObject(tournamentId)
            .subscribe(
                    /* happy path */(tournament: Tournament) => {
                    this.tournament = tournament;

                    this.structureRepository.getObject(tournament.getCompetition())
                        .subscribe(
                                /* happy path */(structure: Structure) => {
                                this.structure = structure;
                                if (callback !== undefined) {
                                    callback();
                                }
                            },
                                /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                                /* onComplete */() => { }
                        );
                },
                    /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                    /* onComplete */() => { }
            );
    }

    protected setAlert(type: string, message: string) {
        this.alert = { 'type': type, 'message': message };
    }

    protected resetAlert(): void {
        this.alert = undefined;
    }

    protected getStructureService(): StructureService {
        return new StructureService({ min: Tournament.MINNROFCOMPETITORS, max: Tournament.MAXNROFCOMPETITORS });
    }
}

type DataProcessCallBack = () => void;
