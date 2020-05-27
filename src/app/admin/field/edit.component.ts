import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Field,
    JsonField,
    Sport,
    SportConfigService,
    SportMapper,
} from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { FieldRepository } from '../../lib/ngx-sport/field/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { TranslateService } from '../../lib/translate';

@Component({
    selector: 'app-tournament-field-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class FieldEditComponent extends TournamentComponent implements OnInit {
    form: FormGroup;
    field: Field;
    chooseSport = false;
    sport: Sport;

    validations: FieldValidations = {
        minlengthname: Field.MIN_LENGTH_NAME,
        maxlengthname: Field.MAX_LENGTH_NAME
    };

    constructor(
        private sportConfigService: SportConfigService,
        private fieldRepository: FieldRepository,
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private planningRepository: PlanningRepository,
        private myNavigation: MyNavigation,
        private sportMapper: SportMapper,
        fb: FormBuilder
    ) {
        // EditPermissions, EmailAddresses
        // andere groep moet dan zijn getEditPermission, wanneer ingelogd, bij gewone view
        super(route, router, tournamentRepository, structureRepository);
        this.form = fb.group({
            name: ['', Validators.compose([
                Validators.maxLength(this.validations.maxlengthname)
            ])],
            sportname: [{ value: '', disabled: true }, Validators.compose([
                Validators.required
            ])]
        });
    }

    // initialsValidator(control: FormControl): { [s: string]: boolean } {
    //     if (control.value.length < this.validations.minlengthinitials || control.value.length < this.validations.maxlengthinitials) {
    //         return { invalidInitials: true };
    //     }
    // }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => this.postInit(+params.number));
        });
    }

    private getField(number: number): Field {
        if (number === undefined || number === 0) {
            this.processing = false;
            return;
        }
        return this.competition.getField(number);
    }

    private postInit(number: number) {
        this.field = this.getField(number);
        if (this.field === undefined) {
            this.form.controls.name.setValue(this.competition.getFields().length + 1);
            if (!this.hasMultipleSports()) {
                this.sport = this.competition.getFirstSportConfig().getSport();
                this.form.controls.sportname.setValue(this.sport.getName());
                this.form.controls.sportname.disable();
            }
            this.processing = false;
            return;
        }
        this.form.controls.name.setValue(this.field.getName());
        this.form.controls.sportname.setValue(this.field.getSport().getName());
        this.sport = this.field.getSport();
        this.processing = false;
    }

    hasMultipleSports(): boolean {
        return this.competition.hasMultipleSportConfigs();
    }

    onGetSport(sport?: Sport) {
        if (sport !== undefined) {
            this.form.controls.sportname.setValue(sport.getName());
            this.sport = sport;
        }
        this.chooseSport = false;
    }


    getFieldDescription(): string {
        const translate = new TranslateService();
        const sports = this.competition.getSports();
        return translate.getFieldNameSingular(sports.length === 1 ? sports[0] : undefined);
    }

    save(): boolean {
        if (this.field !== undefined) {
            this.edit();
        } else {
            this.add();
        }
        return false;
    }

    add() {
        this.processing = true;
        this.setAlert('info', 'het ' + this.getFieldDescription() + ' wordt toegevoegd');
        const name = this.form.controls.name.value;

        const field: JsonField = {
            number: this.competition.getFields().length + 1,
            name: name,
            sport: this.sportMapper.toJson(this.sport)
        };

        this.sportConfigService.createDefault(this.sport, this.competition, this.structure);

        this.fieldRepository.createObject(field, this.tournament).subscribe(
            /* happy path */ fieldRes => {
                this.planningRepository.create(this.structure.getFirstRoundNumber(), this.tournament).subscribe(
                /* happy path */ roundNumberOut => {
                        this.processing = false;
                        this.navigateBack();
                    },
                /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                );
            },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
        );
    }

    edit() {
        this.processing = true;
        this.setAlert('info', 'het ' + this.getFieldDescription() + ' wordt gewijzigd');
        const name = this.form.controls.name.value;

        this.field.setName(name);
        this.field.setSport(this.sport);

        this.fieldRepository.editObject(this.field, this.tournament)
            .subscribe(
            /* happy path */ fieldRes => {
                    this.navigateBack();
                    // @TODO MULTISPORTS planning opnieuw, als de sport is gewijzigd,                    
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => { this.processing = false; }
            );
    }

    navigateBack() {
        this.myNavigation.back();
    }
}

export interface FieldValidations {
    minlengthname: number;
    maxlengthname: number;
}
