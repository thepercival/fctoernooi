import { ActivatedRoute, Router } from '@angular/router';
import { Structure, StructureService, Competition } from 'ngx-sport';

import { IAlert } from '../common/alert';
import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';

/**
 * Created by coen on 11-10-17.
 */
export class TournamentComponent {

    public tournament: Tournament;
    public competition: Competition;
    public structure: Structure;
    public alert: IAlert;
    public processing = true;
    public oldStructure = false;

    constructor(
        protected route: ActivatedRoute,
        protected router: Router,
        protected tournamentRepository: TournamentRepository,
        protected structureRepository: StructureRepository
    ) {
    }

    myNgOnInit(callback?: DataProcessCallBack, noStructure?: boolean) {
        this.route.params.subscribe(params => {
            this.setData(+params['id'], callback, noStructure);
        });
    }

    setData(tournamentId: number | string, callback?: DataProcessCallBack, noStructure?: boolean) {
        this.tournamentRepository.getObject(tournamentId)
            .subscribe(
                /* happy path */(tournament: Tournament) => {
                    this.tournament = tournament;
                    this.competition = tournament.getCompetition();
                    if (noStructure === true) {
                        if (callback !== undefined) {
                            callback();
                        }
                        return;
                    }
                    this.structureRepository.getObject(tournament)
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
                /* error path */(e: string) => {
                    this.setAlert('danger', e); this.processing = false;
                },
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
        return new StructureService(Tournament.PlaceRanges);
    }
}

type DataProcessCallBack = () => void;
