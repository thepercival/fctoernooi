import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Field } from 'voetbaljs/field';
import { FieldRepository, IField } from 'voetbaljs/field/repository';
import { PlanningService } from 'voetbaljs/planning/service';
import { Round } from 'voetbaljs/round';
import { StructureRepository } from 'voetbaljs/structure/repository';

import { IAlert } from '../../../../app.definitions';
import { Tournament } from '../../../tournament';

@Component({
    selector: 'app-tournament-planning-fields',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class TournamentPlanningFieldsComponent implements OnInit {

    @Input() tournament: Tournament;
    @Input() round: Round;
    @Output() updateRound = new EventEmitter<Round>();
    public alert: IAlert;
    public processing = true;
    public disableEditButtons = false;
    private planningService: PlanningService;
    fieldsList: Array<IFieldListItem>;

    validations: any = {
        'minlengthname': Field.MIN_LENGTH_NAME,
        'maxlengthname': Field.MAX_LENGTH_NAME
    };

    constructor(
        private fieldRepository: FieldRepository,
        private structureRepository: StructureRepository) {
        this.resetAlert();
    }

    ngOnInit() {
        this.createFieldsList();

        this.planningService = new PlanningService(
            this.tournament.getCompetitionseason().getStartDateTime()
        );

        this.processing = false;
    }


    createFieldsList() {
        const fields = this.tournament.getCompetitionseason().getFields();
        this.fieldsList = [];
        fields.forEach(function (fieldIt) {
            this.fieldsList.push({
                field: fieldIt,
                editable: false
            });
        }, this);
    }

    saveedit(fieldListItem: IFieldListItem) {
        if (fieldListItem.editable) {
            this.editField(fieldListItem);
        }
        fieldListItem.editable = !fieldListItem.editable;
        this.disableEditButtons = fieldListItem.editable;
    }

    addField() {
        this.setAlert('info', 'veld toevoegen..');
        this.processing = true;

        const jsonField: IField = {
            number: this.fieldsList.length + 1,
            name: '' + (this.fieldsList.length + 1)
        };

        this.fieldRepository.createObject(jsonField, this.tournament.getCompetitionseason())
            .subscribe(
            /* happy path */ fieldRes => {
                const fieldItem: IFieldListItem = { field: fieldRes, editable: false };
                this.fieldsList.push(fieldItem);
                this.planningService.reschedule(this.round);
                // probleem is dat ronde wordt vervangen, terwijl ik het update.
                // dit komt weer doordat het in de backend wordt vervangen en ook in de repository
                // eigenlijk moet alles bijgewerkt worden voor de bijbehorde ronde.
                // dit kan dus zijn:
                // 1 onderliggende structuur(hier horen ook games bij)
                // 2 onderliggende wedstrijden(ook van onderliggende ronden)
                // 3 configuraties(ook van onderliggende ronden)

                this.structureRepository.editObject(this.round, this.round.getCompetitionseason())
                    .subscribe(
                        /* happy path */ roundRes => {
                        this.round.setName('cdk');
                        this.round = roundRes;
                        this.updateRound.emit(roundRes);
                        this.processing = false;
                        this.setAlert('info', 'veld toegevoegd');
                    },
                /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                /* onComplete */() => this.processing = false
                    );
            },
            /* error path */ e => { this.setAlert('danger', e); },
        );
    }

    removeField(fieldItem: IFieldListItem) {
        this.setAlert('info', 'veld verwijderen..');
        this.processing = true;

        this.fieldRepository.removeObject(fieldItem.field)
            .subscribe(
            /* happy path */ fieldRes => {

                const index = this.fieldsList.indexOf(fieldItem);
                if (index > -1) {
                    this.fieldsList.splice(index, 1);
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

    editField(fieldItem) {
        this.setAlert('info', 'veldnaam wijzigen..');
        this.processing = true;

        this.fieldRepository.editObject(fieldItem.field, this.tournament.getCompetitionseason())
            .subscribe(
            /* happy path */ fieldRes => {
                this.setAlert('info', 'veldnaam gewijzigd');
            },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => { this.processing = false; }
            );
    }

    protected setAlert(type: string, message: string) {
        this.alert = { 'type': type, 'message': message };
    }

    protected resetAlert(): void {
        this.alert = null;
    }

    // public closeAlert( name: string) {
    //     this.progressAlert = null;
    // }
}

export interface IFieldListItem {
    field: Field;
    editable: boolean;
}
