import { ActivatedRoute, Router } from '@angular/router';
import { Structure, Competition } from 'ngx-sport';

import { IAlert } from '../common/alert';
import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { AuthService } from '../../lib/auth/auth.service';

export class TournamentComponent {

    public tournament!: Tournament;
    public competition!: Competition;
    public structure!: Structure;
    public alert: IAlert | undefined;
    public processing = true;

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

    hasRole(authService: AuthService, roles: number): boolean {
        const authUser = authService.getUser();
        const tournamentUser = authUser ? this.tournament.getUser(authUser) : undefined;
        return tournamentUser ? tournamentUser.hasARole(roles) : false;
    }
}

type DataProcessCallBack = () => void;
