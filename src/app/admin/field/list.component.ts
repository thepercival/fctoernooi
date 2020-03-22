import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Field } from 'ngx-sport';

import { FieldRepository } from '../../lib/ngx-sport/field/repository';
import { Tournament } from '../../lib/tournament';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { TranslateService } from '../../lib/translate';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';

@Component({
    selector: 'app-tournament-fields',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class FieldListComponent extends TournamentComponent implements OnInit {

    public disableEditButtons = false;
    fields: Field[];
    hasBegun: boolean;

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
        this.fields = this.competition.getFields();
        this.hasBegun = this.structure.getRootRound().hasBegun();
        if (this.hasBegun) {
            this.setAlert('warning', 'er zijn al wedstrijden gespeeld, je kunt niet meer toevoegen en verwijderen');
        }
        this.processing = false;
    }

    addField() {
        this.linkToEdit(this.tournament);
    }

    editField(field: Field) {
        this.linkToEdit(this.tournament, field);
    }

    linkToEdit(tournament: Tournament, field?: Field) {
        this.router.navigate(['/toernooi/fieldedit', tournament.getId(), field ? field.getNumber() : 0]);
    }

    getFieldDescription(): string {
        const translate = new TranslateService();
        const sports = this.competition.getSports();
        return translate.getFieldNameSingular(sports.length === 1 ? sports[0] : undefined);
    }

    getFieldsDescription(): string {
        const translate = new TranslateService();
        const sports = this.competition.getSports();
        return translate.getFieldNamePlural(sports.length === 1 ? sports[0] : undefined);
    }

    removeField(field: Field) {
        if (this.competition.getNrOfFields(field.getSport()) === 1) {
            this.setAlert('warning', 'een sport moet minimaal 1 ' + this.getFieldDescription() + ' houden, verwijder eventueel de sport');
            return;
        }
        this.setAlert('info', 'het ' + this.getFieldDescription() + ' wordt verwijderd');
        this.processing = true;

        this.fieldRepository.removeObject(field, this.tournament)
            .subscribe(
            /* happy path */ fieldRes => {
                    this.planningRepository.createObject(this.structure.getFirstRoundNumber(), this.tournament)
                        .subscribe(
                        /* happy path */ roundNumberOut => {
                                this.processing = false;
                                this.setAlert('success', 'het ' + this.getFieldDescription() + ' is verwijderd');
                            },
                /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                /* onComplete */() => this.processing = false
                        );
                },
            /* error path */ e => { this.setAlert('danger', 'X' + e); this.processing = false; },
            );
    }
}
