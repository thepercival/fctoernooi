import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Period } from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { IAlertType } from '../../shared/common/alert';
import { RecessRepository } from '../../lib/recess/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Recess } from '../../lib/recess';
import { RecessValidator } from '../../lib/recess/validator';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { JsonRecess } from '../../lib/recess/json';
import { DateConverter } from '../../lib/dateConverter';

@Component({
    selector: 'app-tournament-competitor-edit',
    templateUrl: './addRecess.component.html',
    styleUrls: ['./addRecess.component.css']
})
export class RecessAddComponent extends TournamentComponent implements OnInit {
    public typedForm: FormGroup<{
        name: FormControl<string>,
        startdate: FormControl<string>,
        starttime: FormControl<string>,
        enddate: FormControl<string>,
        endtime: FormControl<string>,
      }>;
    hasBegun!: boolean;
    minDateStruct!: NgbDateStruct;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        private recessRepository: RecessRepository,
        private planningRepository: PlanningRepository,
        private myNavigation: MyNavigation,
        private dateConverter: DateConverter,
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
        this.typedForm = new FormGroup({
            name: new FormControl('pauze', { nonNullable: true, validators: 
                [
                    Validators.required,
                    Validators.minLength(1),
                    Validators.maxLength(this.MaxLengthName)
                ] 
            }),
            startdate: new FormControl('', { nonNullable: true }),
            starttime: new FormControl('', { nonNullable: true }),
            enddate: new FormControl('', { nonNullable: true }),
            endtime: new FormControl('', { nonNullable: true }),
        });
    }

    // initialsValidator(control: FormControl): { [s: string]: boolean } {
    //     if (control.value.length < this.validations.minlengthinitials || control.value.length < this.validations.maxlengthinitials) {
    //         return { invalidInitials: true };
    //     }
    // }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => this.postInit());
        });
    }

    private postInit() {
        this.hasBegun = this.structure.getFirstRoundNumber().hasBegun();

        const minDate = this.getMinStartDate();
        this.minDateStruct = { year: minDate.getFullYear(), month: minDate.getMonth() + 1, day: minDate.getDate() };
        this.initForm(minDate);
        this.processing = false;
    }

    initForm(minDate: Date) {
        const lastRecess = this.tournament.getRecesses().slice().pop();
        const previousEndDate: Date = lastRecess?.getEndDateTime() ?? minDate;

        const startDateTime = new Date(previousEndDate);
        startDateTime.setMinutes(startDateTime.getMinutes() + 60);
        const endDateTime = new Date(startDateTime);
        endDateTime.setMinutes(startDateTime.getMinutes() + 30);

        this.dateConverter.setDateTime(this.typedForm.controls.startdate, this.typedForm.controls.starttime, startDateTime);
        this.dateConverter.setDateTime(this.typedForm.controls.enddate, this.typedForm.controls.endtime, endDateTime);
    }

    get MaxLengthName(): number { return Recess.MAX_LENGTH_NAME };

    

    formToJson(): JsonRecess {
        return {
            id: 0,
            name: this.typedForm.controls.name.value,
            start: this.dateConverter.getDateTime(this.typedForm.controls.startdate, this.typedForm.controls.starttime).toISOString(),
            end: this.dateConverter.getDateTime(this.typedForm.controls.enddate, this.typedForm.controls.endtime).toISOString()
        };
    }

    save(): boolean {
        const jsonRecess = this.formToJson();
        const newRecessPeriod = new Period(new Date(jsonRecess.start), new Date(jsonRecess.end));
        const message = this.validatePeriod(newRecessPeriod);
        if (message !== undefined) {
            this.setAlert(IAlertType.Danger, message);
            return false;
        }
        

        this.processing = true;
        this.setAlert(IAlertType.Info, 'de pauze wordt opgeslagen');
        this.recessRepository.createObject(jsonRecess, this.tournament)
            .subscribe({
                next: () => {
                    this.planningRepository.reschedule(this.structure.getFirstRoundNumber(), this.tournament)
                        .subscribe({
                            next: () => {
                                this.myNavigation.back();
                            },
                            error: (e) => {
                                this.setAlert(IAlertType.Danger, 'de wedstrijdplanning is niet opgeslagen: ' + e);
                                this.processing = false;
                            }
                        });
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, e);
                    this.processing = false;
                }
            });
        return false;
    }

    validatePeriod(newRecessPeriod: Period): string|undefined {
        const validator = new RecessValidator();
        return validator.validateNewPeriod(newRecessPeriod, this.tournament.getRecesses(), this.getMinStartDate());
    }

    getMinStartDate(): Date {
        const planningConfig = this.structure.getFirstRoundNumber().getValidPlanningConfig();
        const startDate = new Date(this.tournament.getCompetition().getStartDateTime());
        startDate.setMinutes(startDate.getMinutes() + planningConfig.getMaxNrOfMinutesPerGame() );
        return startDate;
    }

    navigateBack() {
        this.myNavigation.back();
    }

    // setName(name) {
    //     this.error = undefined;
    //     if (name.length < this.validations.minlengthinitials || name.length > this.validations.maxlengthinfo) {
    //         return;
    //     }
    //     this.model.name = name;
    // }
}

export interface CompetitorValidations {
    minlengthname: number;
    maxlengthname: number;
    maxlengthinfo: number;
}
