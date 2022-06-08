import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    JsonPeriod,
    Period,
} from 'ngx-sport';

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

@Component({
    selector: 'app-tournament-competitor-edit',
    templateUrl: './addRecess.component.html',
    styleUrls: ['./addRecess.component.css']
})
export class RecessAddComponent extends TournamentComponent implements OnInit {
    form: FormGroup;
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
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
        this.form = fb.group({
            name: ['pauze', Validators.compose([Validators.required,
            Validators.minLength(1),
            Validators.maxLength(this.MaxLengthName)])],
            startdate: ['', Validators.compose([])],
            starttime: ['', Validators.compose([])],
            enddate: ['', Validators.compose([])],
            endtime: ['', Validators.compose([])],
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

        const minDate = this.competition.getStartDateTime();
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

        this.setDate(this.form.controls.startdate, this.form.controls.starttime, startDateTime);
        this.setDate(this.form.controls.enddate, this.form.controls.endtime, endDateTime);
    }

    get MaxLengthName(): number { return Recess.MAX_LENGTH_NAME };

    setDate(dateFormControl: AbstractControl, timeFormControl: AbstractControl, date: Date) {
        dateFormControl.setValue({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
        timeFormControl.setValue({ hour: date.getHours(), minute: date.getMinutes() });
    }

    formToJson(): JsonRecess {
        return {
            id: 0,
            name: this.form.controls.name.value,
            start: this.getDate(this.form.controls.startdate, this.form.controls.starttime).toISOString(),
            end: this.getDate(this.form.controls.enddate, this.form.controls.endtime).toISOString()
        };
    }

    getDate(dateFormControl: AbstractControl, timeFormControl: AbstractControl): Date {
        return new Date(
            dateFormControl.value.year,
            dateFormControl.value.month - 1,
            dateFormControl.value.day,
            timeFormControl.value.hour,
            timeFormControl.value.minute
        );
    }

    save(): boolean {
        const jsonRecess = this.formToJson();
        const newRecessPeriod = new Period(new Date(jsonRecess.start), new Date(jsonRecess.end));
        const validator = new RecessValidator();
        const message = this.validate(newRecessPeriod);
        if (message !== undefined) {
            this.setAlert(IAlertType.Danger, message);
            // return false;
        }

        this.processing = true;
        this.setAlert(IAlertType.Info, 'de deelnemer wordt opgeslagen');
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

    protected validate(recess: Period): string | undefined {
        if (recess.getStartDateTime().getTime() >= recess.getEndDateTime().getTime()) {
            return 'de start moet voor het einde zijn';
        }

        if (!this.isOverlapping(recess)) {
            return 'er is een overlapping met een andere pauze';
        }
        return undefined;
    }

    protected isOverlapping(recessPeriod: Period): boolean {
        return this.tournament.getRecesses().some((recessIt: Recess): boolean => {
            return recessIt.overlaps(recessPeriod);
        });
    }
}

export interface CompetitorValidations {
    minlengthname: number;
    maxlengthname: number;
    maxlengthinfo: number;
}
