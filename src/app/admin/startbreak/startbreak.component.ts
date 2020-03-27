import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NameService, PlanningPeriod } from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';

@Component({
    selector: 'app-tournament-startbreak',
    templateUrl: './startbreak.component.html',
    styleUrls: ['./startbreak.component.css']
})
export class StartBreakComponent extends TournamentComponent implements OnInit {
    form: FormGroup;
    minDateStruct: NgbDateStruct;
    processing = true;
    hasBegun: boolean;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private planningRepository: PlanningRepository,
        public nameService: NameService,
        private myNavigation: MyNavigation,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);

        this.form = fb.group({
            date: ['', Validators.compose([])],
            time: ['', Validators.compose([])],
            togglebreak: ['', Validators.compose([])],
            breakstartdate: ['', Validators.compose([])],
            breakstarttime: ['', Validators.compose([])],
            breakenddate: ['', Validators.compose([])],
            breakendtime: ['', Validators.compose([])],
        });
    }

    ngOnInit() {
        super.myNgOnInit(() => this.initFields());
    }

    initFields() {
        this.hasBegun = this.structure.getRootRound().hasBegun();
        const date = this.competition.getStartDateTime();

        const now = new Date();
        const minDate = date > now ? now : date;
        this.minDateStruct = { year: minDate.getFullYear(), month: minDate.getMonth() + 1, day: minDate.getDate() };

        this.setDate(this.form.controls.date, this.form.controls.time, date);
        this.setDefaultBreak();
        this.form.controls.togglebreak.setValue(this.tournament.hasBreak());

        if (this.hasBegun) {
            this.setAlert('warning', 'er zijn al wedstrijden gespeeld, je kunt niet meer wijzigen');
        }
        this.processing = false;
    }

    isTimeEnabled() {
        return this.structure.getFirstRoundNumber().getPlanningConfig().getEnableTime();
    }

    setDefaultBreak() {
        const breakStartDateTime = this.getDate(this.form.controls.date, this.form.controls.time);
        breakStartDateTime.setHours(breakStartDateTime.getHours() + 2);
        const breakEndDateTime = new Date(breakStartDateTime.getTime());
        breakEndDateTime.setMinutes(breakEndDateTime.getMinutes() + 30);

        this.setDate(this.form.controls.breakstartdate, this.form.controls.breakstarttime, breakStartDateTime);
        this.setDate(this.form.controls.breakenddate, this.form.controls.breakendtime, breakEndDateTime);
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

    setDate(dateFormControl: AbstractControl, timeFormControl: AbstractControl, date: Date) {
        dateFormControl.setValue({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
        timeFormControl.setValue({ hour: date.getHours(), minute: date.getMinutes() });
    }

    edit(): boolean {
        this.setAlert('info', 'het toernooi wordt opgeslagen');

        const startDateTime = this.getDate(this.form.controls.date, this.form.controls.time);
        let breakX: PlanningPeriod;
        if (this.form.controls.togglebreak.value) {
            const breakStartDateTime = this.getDate(this.form.controls.breakstartdate, this.form.controls.breakstarttime);
            const breakEndDateTime = this.getDate(this.form.controls.breakenddate, this.form.controls.breakendtime);
            breakX = { start: breakStartDateTime, end: breakEndDateTime };
            const message = this.checkBreakPeriod(startDateTime, breakStartDateTime, breakEndDateTime);
            if (message !== undefined) {
                this.setAlert('danger', message);
                return;
            }
        }

        this.processing = true;
        const firstRoundNumber = this.structure.getFirstRoundNumber();
        try {
            this.competition.setStartDateTime(startDateTime);
            this.tournament.setBreakStartDateTime(breakX ? breakX.start : undefined);
            this.tournament.setBreakEndDateTime(breakX ? breakX.end : undefined);

            this.tournamentRepository.editObject(this.tournament)
                .subscribe(
                    /* happy path */ tournamentRes => {
                        this.tournament = tournamentRes;
                        this.planningRepository.reschedule(firstRoundNumber, this.tournament).subscribe(
                                /* happy path */ gamesRes => {
                                this.myNavigation.back();
                            },
                            /* error path */ e => {
                                this.setAlert('danger', 'de planning is niet opgeslagen: ' + e);
                                this.processing = false;
                            }
                        );
                    },
                    /* error path */ e => { this.setAlert('danger', 'het toernooi is niet opgeslagen: ' + e); this.processing = false; }
                );
        } catch (e) {
            this.setAlert('danger', e.message);
            this.processing = false;
        }
        return false;
    }

    equals(one: NgbDateStruct, two: NgbDateStruct) {
        return one && two && two.year === one.year && two.month === one.month && two.day === one.day;
    }
    isSelected = date => this.equals(date, this.form.controls.date.value);

    checkBreakPeriod(startDateTime: Date, breakStartDateTime: Date, breakEndDateTime: Date): string {
        if (breakStartDateTime.getTime() < startDateTime.getTime()) {
            return 'de start van de pauze moet na het begin van het toernooi zijn';
        } else if (breakStartDateTime.getTime() >= breakEndDateTime.getTime()) {
            return 'het einde van de pauze moet na de start van de pauze zijn';
        }
        return undefined;
    }
}
