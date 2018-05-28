import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Field, FieldRepository, IField, PlanningRepository, PlanningService, StructureRepository } from 'ngx-sport';

import { IAlert } from '../../../app.definitions';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';

@Component({
    selector: 'app-tournament-fields',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class FieldListComponent extends TournamentComponent implements OnInit {

    public disableEditButtons = false;
    private planningService: PlanningService;
    fieldsList: Array<IFieldListItem>;
    infoAlert = true;
    alert: IAlert;
    processing = true;

    validations: any = {
        'minlengthname': Field.MIN_LENGTH_NAME,
        'maxlengthname': Field.MAX_LENGTH_NAME
    };

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        private fieldRepository: FieldRepository,
        private planningRepository: PlanningRepository
    ) {
        super(route, router, tournamentRepository, sructureRepository);
    }

    ngOnInit() {
        super.myNgOnInit(() => this.initFields());
    }

    initFields() {
        this.createFieldsList();
        this.planningService = new PlanningService(this.structureService);
        this.processing = false;
        if (this.isStarted()) {
            this.setAlert('warning', 'het toernooi is al begonnen, je kunt niet meer wijzigen');
        }
    }

    isStarted() {
        return this.structureService.getFirstRound().isStarted();
    }

    createFieldsList() {
        const fields = this.structureService.getCompetition().getFields();
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
        } else {
            this.resetAlert();
        }
        fieldListItem.editable = !fieldListItem.editable;
        this.disableEditButtons = fieldListItem.editable;
    }

    addField() {
        this.setAlert('info', 'het veld wordt toegevoegd');
        this.processing = true;

        const jsonField: IField = {
            number: this.fieldsList.length + 1,
            name: '' + (this.fieldsList.length + 1)
        };

        this.fieldRepository.createObject(jsonField, this.structureService.getCompetition())
            .subscribe(
            /* happy path */ fieldRes => {
                    const fieldItem: IFieldListItem = { field: fieldRes, editable: false };
                    this.fieldsList.push(fieldItem);
                    const firstRound = this.structureService.getFirstRound();
                    this.planningService.reschedule(firstRound.getNumber());
                    this.planningRepository.editObject([firstRound])
                        .subscribe(
                        /* happy path */ gamesdRes => {
                                this.processing = false;
                                this.setAlert('info', 'veld toegevoegd');
                            },
                /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                /* onComplete */() => this.processing = false
                        );
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },

        );
    }

    removeField(fieldItem: IFieldListItem) {
        this.setAlert('info', 'het veld wordt verwijderd');
        this.processing = true;

        this.fieldRepository.removeObject(fieldItem.field, this.structureService.getCompetition())
            .subscribe(
            /* happy path */ fieldRes => {

                    const index = this.fieldsList.indexOf(fieldItem);
                    if (index > -1) {
                        this.fieldsList.splice(index, 1);
                    }
                    const firstRound = this.structureService.getFirstRound();
                    this.planningService.reschedule(firstRound.getNumber());
                    // setTimeout(3000);
                    this.planningRepository.editObject([firstRound])
                        .subscribe(
                        /* happy path */ gamesRes => {
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
        this.setAlert('info', 'de veldnaam wordt gewijzigd');
        this.processing = true;

        this.fieldRepository.editObject(fieldItem.field, this.structureService.getCompetition())
            .subscribe(
            /* happy path */ fieldRes => {
                    this.setAlert('info', 'de veldnaam is gewijzigd');
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

export interface IFieldListItem {
    field: Field;
    editable: boolean;
}
