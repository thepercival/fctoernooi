import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Field, FieldRepository, JsonField, PlanningRepository, PlanningService, StructureRepository } from 'ngx-sport';

import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentService } from '../../lib/tournament/service';
import { TournamentComponent } from '../component';

@Component({
    selector: 'app-tournament-fields',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class FieldListComponent extends TournamentComponent implements OnInit {

    public disableEditButtons = false;
    private planningService: PlanningService;
    fieldsList: Array<IFieldListItem>;

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
        this.planningService = new PlanningService(this.tournament.getCompetition());
        this.processing = false;
        if (this.hasBegun()) {
            this.setAlert('warning', 'er zijn al wedstrijden gespeeld, je kunt niet meer wijzigen');
        }
    }

    hasBegun() {
        return this.structure.getRootRound().hasBegun();
    }

    createFieldsList() {
        const fields = this.tournament.getCompetition().getFields();
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

        const jsonField: JsonField = {
            number: this.fieldsList.length + 1,
            name: '' + (this.fieldsList.length + 1),
            sportId: 12 /* @TODO */
        };

        this.fieldRepository.createObject(jsonField, this.tournament.getCompetition())
            .subscribe(
            /* happy path */ fieldRes => {
                    const fieldItem: IFieldListItem = { field: fieldRes, editable: false };
                    this.fieldsList.push(fieldItem);
                    const tournamentService = new TournamentService(this.tournament);
                    tournamentService.reschedule(this.planningService, this.structure.getFirstRoundNumber());
                    this.planningRepository.editObject(this.structure.getFirstRoundNumber())
                        .subscribe(
                        /* happy path */ gamesRes => {
                                this.processing = false;
                                this.setAlert('success', 'het veld is toegevoegd');
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

        this.fieldRepository.removeObject(fieldItem.field, this.tournament.getCompetition())
            .subscribe(
            /* happy path */ fieldRes => {
                    const tournamentService = new TournamentService(this.tournament);
                    tournamentService.reschedule(this.planningService, this.structure.getFirstRoundNumber());
                    this.planningRepository.editObject(this.structure.getFirstRoundNumber())
                        .subscribe(
                        /* happy path */ gamesRes => {
                                this.processing = false;
                                this.setAlert('success', 'het veld is verwijderd');
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

        this.fieldRepository.editObject(fieldItem.field, this.tournament.getCompetition())
            .subscribe(
            /* happy path */ fieldRes => {
                    this.setAlert('success', 'de veldnaam is gewijzigd');
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => { this.processing = false; }
            );
    }
}

export interface IFieldListItem {
    field: Field;
    editable: boolean;
}
