import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Field,
    FieldRepository,
    JsonField,
    PlanningRepository,
    PlanningService,
    Sport,
    StructureRepository,
} from 'ngx-sport';

import { MyNavigation } from '../../common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentService } from '../../lib/tournament/service';
import { TournamentComponent } from '../component';

@Component({
    selector: 'app-tournament-field-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class FieldEditComponent extends TournamentComponent implements OnInit {
    form: FormGroup;
    field: Field;
    chooseSport: boolean = false;
    sport: Sport;

    validations: FieldValidations = {
        minlengthname: Field.MIN_LENGTH_NAME,
        maxlengthname: Field.MAX_LENGTH_NAME
    };

    constructor(
        private fieldRepository: FieldRepository,
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private planningRepository: PlanningRepository,
        private myNavigation: MyNavigation,
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
        return this.tournament.getCompetition().getField(number);
    }

    private postInit(number: number) {
        this.field = this.getField(number);
        if (this.field === undefined) {
            this.form.controls.name.setValue(this.tournament.getCompetition().getFields().length + 1);
            this.processing = false;
            return;
        }
        this.form.controls.name.setValue(this.field.getName());
        this.form.controls.sportname.setValue(this.field.getSport().getName());
        this.sport = this.field.getSport();
        this.processing = false;
    }

    onGetSport(sport: Sport) {
        this.form.controls.sportname.setValue(sport.getName());
        this.sport = sport;
        this.chooseSport = false;
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
        this.setAlert('info', 'het veld wordt toegevoegd');
        const name = this.form.controls.name.value;

        const field: JsonField = {
            number: this.tournament.getCompetition().getFields().length + 1,
            name: name,
            sportId: this.sport.getId()
        };

        // als sportConfig nog niet bestaat dan toevoegen aan ..... 
        this.sportConfigService.createDefault(sport, this.tournament.getCompetition());
        competition.getSportConfigs().forEach(sportConfig => {
            this.sportConfigService.addToRoundNumber(sportConfig, firstRoundNumber);
        });



        this.fieldRepository.createObject(field, this.tournament.getCompetition()).subscribe(
            /* happy path */ fieldRes => {
                const firstRoundNumber = this.structure.getFirstRoundNumber();
                const tournamentService = new TournamentService(this.tournament);
                tournamentService.reschedule(new PlanningService(this.tournament.getCompetition()), firstRoundNumber);
                this.planningRepository.editObject(firstRoundNumber).subscribe(
                /* happy path */ gamesRes => {
                        this.tournamentRepository.syncRefereeRoles(this.tournament).subscribe(
                        /* happy path */ allRolesRes => {
                                this.processing = false;
                                this.navigateBack();
                            },
                        /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                        /* onComplete */() => this.processing = false
                        );
                    },
                /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                );
            },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
        );
    }

    edit() {
        this.processing = true;
        this.setAlert('info', 'het veld wordt gewijzigd');
        const name = this.form.controls.name.value;

        this.field.setName(name);
        const sportChanged = this.sport !== this.field.getSport();
        this.field.setSport(this.sport);

        this.fieldRepository.editObject(this.field, this.tournament.getCompetition())
            .subscribe(
            /* happy path */ refereeRes => {
                    if (!sportChanged) {
                        this.navigateBack();
                        return;
                    }
                    // doe planning berekenen! @TODO
                    // this.tournamentRepository.syncRefereeRoles(this.tournament).subscribe(
                    //     /* happy path */ allRolesRes => {
                    //         this.navigateBack();
                    //     },
                    //     /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                    //     /* onComplete */() => this.processing = false
                    // );
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => { this.processing = false; }
            );
    }

    navigateBack() {
        this.myNavigation.back();
    }

    // isInitialsDuplicate(initials: string, referee?: Referee): boolean {
    //     const referees = this.tournament.getCompetition().getReferees();
    //     return referees.find(refereeIt => {
    //         return (initials === refereeIt.getInitials() && (referee === undefined || refereeIt.getId() === undefined));
    //     }) !== undefined;
    // }

    // addField() {
    //     this.setAlert('info', 'het veld wordt toegevoegd');
    //     this.processing = true;

    //     const jsonField: JsonField = {
    //         number: this.fieldsList.length + 1,
    //         name: '' + (this.fieldsList.length + 1),
    //         sportId: 12 /* @TODO */
    //     };

    //     this.fieldRepository.createObject(jsonField, this.tournament.getCompetition())
    //         .subscribe(
    //         /* happy path */ fieldRes => {
    //                 const fieldItem: IFieldListItem = { field: fieldRes, editable: false };
    //                 this.fieldsList.push(fieldItem);
    //                 const tournamentService = new TournamentService(this.tournament);
    //                 tournamentService.reschedule(this.planningService, this.structure.getFirstRoundNumber());
    //                 this.planningRepository.editObject(this.structure.getFirstRoundNumber())
    //                     .subscribe(
    //                     /* happy path */ gamesRes => {
    //                             this.processing = false;
    //                             this.setAlert('success', 'het veld is toegevoegd');
    //                         },
    //             /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //             /* onComplete */() => this.processing = false
    //                     );
    //             },
    //         /* error path */ e => { this.setAlert('danger', e); this.processing = false; },

    //         );
    // }

    // editField(fieldItem) {
    //     this.setAlert('info', 'de veldnaam wordt gewijzigd');
    //     this.processing = true;

    //     this.fieldRepository.editObject(fieldItem.field, this.tournament.getCompetition())
    //         .subscribe(
    //         /* happy path */ fieldRes => {
    //                 this.setAlert('success', 'de veldnaam is gewijzigd');
    //             },
    //         /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
    //         /* onComplete */() => { this.processing = false; }
    //         );
    // }
}

export interface FieldValidations {
    minlengthname: number;
    maxlengthname: number;
}
