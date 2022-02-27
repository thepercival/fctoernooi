import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Period } from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { Tournament } from '../../lib/tournament';
import { DateFormatter } from '../../lib/dateFormatter';
import { IAlertType } from '../../shared/common/alert';

@Component({
    selector: 'app-tournament-startbreak',
    templateUrl: './startbreak.component.html',
    styleUrls: ['./startbreak.component.scss']
})
export class StartBreakComponent extends TournamentComponent implements OnInit {
    form: FormGroup;
    minDateStruct!: NgbDateStruct;
    processing = true;
    hasBegun!: boolean;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private planningRepository: PlanningRepository,
        private tournamentMapper: TournamentMapper,
        private myNavigation: MyNavigation,
        public dateFormatter: DateFormatter,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);

        this.form = fb.group({
            date: ['', Validators.compose([])],
            time: ['', Validators.compose([])],
            togglebreak: [false, Validators.compose([])],
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
        this.setBreak();
        this.form.controls.togglebreak.setValue(this.tournament.hasBreak());

        if (this.hasBegun) {
            this.setAlert(IAlertType.Warning, 'er zijn al wedstrijden gespeeld, je kunt niet meer wijzigen');
        }
        this.processing = false;
    }

    isTimeEnabled() {
        return this.structure.getFirstRoundNumber().getValidPlanningConfig().getEnableTime();
    }

    setBreak() {
        let breakStartDateTime, breakEndDateTime;
        const breakX: Period | undefined = this.tournament.getBreak();
        if (breakX) {
            breakStartDateTime = new Date(breakX.getStartDateTime().getTime());
            breakEndDateTime = new Date(breakX.getEndDateTime().getTime());
        } else {
            breakStartDateTime = this.getDate(this.form.controls.date, this.form.controls.time);
            breakStartDateTime.setHours(breakStartDateTime.getHours() + 2);
            breakEndDateTime = new Date(breakStartDateTime.getTime());
            breakEndDateTime.setMinutes(breakEndDateTime.getMinutes() + 30);
        }
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
        this.setAlert(IAlertType.Info, 'het toernooi wordt opgeslagen');

        const startDateTime = this.getDate(this.form.controls.date, this.form.controls.time);
        let breakX: Period | undefined;
        if (this.form.controls.togglebreak.value) {
            const breakStartDateTime = this.getDate(this.form.controls.breakstartdate, this.form.controls.breakstarttime);
            const breakEndDateTime = this.getDate(this.form.controls.breakenddate, this.form.controls.breakendtime);
            breakX = new Period(breakStartDateTime, breakEndDateTime);
            const message = this.checkBreakPeriod(startDateTime, breakStartDateTime, breakEndDateTime);
            if (message !== undefined) {
                this.setAlert(IAlertType.Danger, message);
                return false;
            }
        }

        this.processing = true;
        const firstRoundNumber = this.structure.getFirstRoundNumber();

        const json = this.tournamentMapper.toJson(this.tournament);
        json.competition.startDateTime = startDateTime.toISOString();
        json.breakStartDateTime = breakX?.getStartDateTime().toISOString();
        json.breakEndDateTime = breakX?.getEndDateTime().toISOString();

        this.tournamentRepository.editObject(json)
            .subscribe({
                next: (tournament: Tournament) => {
                    this.tournament = tournament;
                    this.planningRepository.reschedule(firstRoundNumber, this.tournament)
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
                    this.setAlert(IAlertType.Danger, 'het toernooi is niet opgeslagen: ' + e);
                    this.processing = false;
                }
            });

        return false;
    }

    protected checkBreakPeriod(startDateTime: Date, breakStartDateTime: Date, breakEndDateTime: Date): string | undefined {
        if (breakStartDateTime.getTime() < startDateTime.getTime()) {
            return 'de start van de pauze moet na het begin van het toernooi zijn';
        } else if (breakStartDateTime.getTime() >= breakEndDateTime.getTime()) {
            return 'het einde van de pauze moet na de start van de pauze zijn';
        }
        return undefined;
    }
}
