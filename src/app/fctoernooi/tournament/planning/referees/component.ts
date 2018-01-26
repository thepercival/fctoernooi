import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PlanningService, Referee, RefereeRepository, Round, StructureRepository, StructureService } from 'ngx-sport';

import { Tournament } from '../..';
import { IAlert } from '../../../../app.definitions';

@Component({
    selector: 'app-tournament-planning-referees',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class TournamentPlanningRefereesComponent implements OnInit {

    @Input() tournament: Tournament;
    @Input() structureService: StructureService;
    @Output() updateRound = new EventEmitter<Round>();
    public alert: IAlert;
    public processing = true;
    referees: Referee[];

    validations: any = {
        'minlengthname': Referee.MIN_LENGTH_NAME,
        'maxlengthname': Referee.MAX_LENGTH_NAME
    };

    constructor(
        private router: Router,
        private refereeRepository: RefereeRepository,
        private structureRepository: StructureRepository) {
        this.resetAlert();
    }

    ngOnInit() {
        this.createRefereesList();
        this.processing = false;
        if (this.isStarted()) {
            this.setAlert('warning', 'het toernooi is al begonnen, je kunt niet meer wijzigen');
        }
    }

    isStarted() {
        return this.structureService.getFirstRound().isStarted();
    }

    createRefereesList() {
        this.referees = this.structureService.getCompetitionseason().getReferees();
    }

    addReferee() {
        this.linkToEdit(this.tournament);
    }

    editReferee(referee: Referee) {
        this.linkToEdit(this.tournament, referee);
    }

    linkToEdit(tournament: Tournament, referee?: Referee) {
        this.router.navigate(
            ['/toernooi/refereeedit', tournament.getId(), referee ? referee.getId() : 0],
            {
                queryParams: {
                    returnAction: '/toernooi/planning',
                    returnParam: tournament.getId(),
                    returnQueryParamKey: 'tabid',
                    returnQueryParamValue: 'tab-referees'
                }
            }
        );
    }

    removeReferee(referee: Referee) {
        this.setAlert('info', 'scheidsrechter verwijderen..');
        this.processing = true;

        this.refereeRepository.removeObject(referee)
            .subscribe(
            /* happy path */ refereeRes => {

                const index = this.referees.indexOf(referee);
                if (index > -1) {
                    this.referees.splice(index, 1);
                }
                const firstRound = this.structureService.getFirstRound();
                const planningService = new PlanningService(this.structureService);
                planningService.reschedule(firstRound.getNumber());
                this.structureRepository.editObject(firstRound, this.structureService.getCompetitionseason())
                    .subscribe(
                        /* happy path */ roundRes => {
                        this.updateRound.emit(roundRes);
                        this.processing = false;
                        this.setAlert('info', 'scheidsrechter verwijderd');
                    },
                /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                /* onComplete */() => this.processing = false
                    );
            },
            /* error path */ e => { this.setAlert('danger', 'X' + e); this.processing = false; },
        );
    }

    protected setAlert(type: string, message: string) {
        this.alert = { 'type': type, 'message': message };
    }

    protected resetAlert(): void {
        this.alert = undefined;
    }

    // public closeAlert( name: string) {
    //     this.progressAlert = undefined;
    // }
}
