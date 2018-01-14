import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IReferee, PlanningService, Referee, RefereeRepository, Round, StructureRepository } from 'ngx-sport';

import { IAlert } from '../../../../app.definitions';
import { Tournament } from '../../../tournament';

@Component({
    selector: 'app-tournament-planning-referees',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class TournamentPlanningRefereesComponent implements OnInit {

    @Input() tournament: Tournament;
    @Input() round: Round;
    @Output() updateRound = new EventEmitter<Round>();
    public alert: IAlert;
    public processing = true;
    public disableEditButtons = false;
    private planningService: PlanningService;
    refereesList: Array<IRefereeListItem>;

    validations: any = {
        'minlengthname': Referee.MIN_LENGTH_NAME,
        'maxlengthname': Referee.MAX_LENGTH_NAME
    };

    constructor(
        private refereeRepository: RefereeRepository,
        private structureRepository: StructureRepository) {
        this.resetAlert();
    }

    ngOnInit() {
        this.createRefereesList();
        this.planningService = new PlanningService(
            this.tournament.getCompetitionseason().getStartDateTime()
        );
        this.processing = false;
        if (this.round.isStarted()) {
            this.setAlert('warning', 'het toernooi is al begonnen, je kunt niet meer wijzigen');
        }
    }


    createRefereesList() {
        const referees = this.tournament.getCompetitionseason().getReferees();
        this.refereesList = [];
        referees.forEach(function (refereeIt) {
            this.refereesList.push({
                referee: refereeIt,
                editable: false
            });
        }, this);
    }

    saveedit(refereeListItem: IRefereeListItem) {
        if (refereeListItem.editable) {
            this.editReferee(refereeListItem);
        }
        refereeListItem.editable = !refereeListItem.editable;
        this.disableEditButtons = refereeListItem.editable;
    }

    addReferee() {
        this.setAlert('info', 'scheidsrechter toevoegen..');
        this.processing = true;

        const jsonReferee: IReferee = {
            number: this.refereesList.length + 1,
            name: '' + (this.refereesList.length + 1)
        };

        this.refereeRepository.createObject(jsonReferee, this.tournament.getCompetitionseason())
            .subscribe(
            /* happy path */ refereeRes => {
                const refereeItem: IRefereeListItem = { referee: refereeRes, editable: false };
                this.refereesList.push(refereeItem);
                this.planningService.reschedule(this.round);

                this.structureRepository.editObject(this.round, this.round.getCompetitionseason())
                    .subscribe(
                        /* happy path */ roundRes => {
                        this.round.setName('cdk');
                        this.round = roundRes;
                        this.updateRound.emit(roundRes);
                        this.processing = false;
                        this.setAlert('info', 'scheidsrechter toegevoegd');
                    },
                /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                /* onComplete */() => this.processing = false
                    );
            },
            /* error path */ e => { this.setAlert('danger', e); },
        );
    }

    removeReferee(refereeItem: IRefereeListItem) {
        this.setAlert('info', 'scheidsrechter verwijderen..');
        this.processing = true;

        this.refereeRepository.removeObject(refereeItem.referee)
            .subscribe(
            /* happy path */ refereeRes => {

                const index = this.refereesList.indexOf(refereeItem);
                if (index > -1) {
                    this.refereesList.splice(index, 1);
                }

                this.planningService.reschedule(this.round);

                // setTimeout(3000);
                this.structureRepository.editObject(this.round, this.round.getCompetitionseason())
                    .subscribe(
                        /* happy path */ roundRes => {
                        this.round = roundRes;
                        this.updateRound.emit(roundRes);
                        this.processing = false;
                        this.setAlert('info', 'veld verwijderd');
                    },
                /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                /* onComplete */() => this.processing = false
                    );
            },
            /* error path */ e => { this.setAlert('danger', 'X' + e); this.processing = false; },
        );
    }

    editReferee(refereeItem) {
        this.setAlert('info', 'scheidsrechter wijzigen..');
        this.processing = true;

        this.refereeRepository.editObject(refereeItem.referee, this.tournament.getCompetitionseason())
            .subscribe(
            /* happy path */ refereeRes => {
                this.setAlert('info', 'scheidsrechter gewijzigd');
            },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => { this.processing = false; }
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

export interface IRefereeListItem {
    referee: Referee;
    editable: boolean;
}
