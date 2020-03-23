import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NameService } from 'ngx-sport';

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

    validations: any = {
        minbreakduration: 0,
        maxbreakduration: 60 * 24 * 14
    };

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
            date: ['', Validators.compose([
            ])],
            time: ['', Validators.compose([

            ])],
            togglebreak: ['', Validators.compose([
            ])],
            breaktime: ['', Validators.compose([

            ])],
            breakduration: ['', Validators.compose([
                Validators.min(this.validations.minbreakduration),
                Validators.max(this.validations.maxbreakduration)
            ])]
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

        this.form.controls.date.setValue({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
        this.form.controls.time.setValue({ hour: date.getHours(), minute: date.getMinutes() });

        this.form.controls.togglebreak.setValue(this.tournament.hasBreak());
        this.toggleBreak(this.tournament.hasBreak(), this.tournament.getBreakDuration(), this.tournament.getBreakStartDateTime());

        if (this.hasBegun) {
            this.setAlert('warning', 'er zijn al wedstrijden gespeeld, je kunt niet meer wijzigen');
        }
        this.processing = false;
    }

    shouldReschedule(startDateTime: Date, breakStartDateTime: Date, breakDration: number): boolean {
        if (startDateTime.getTime() === this.competition.getStartDateTime().getTime()
            && (breakStartDateTime === undefined && this.tournament.getBreakStartDateTime() === undefined
                || (breakStartDateTime !== undefined && this.tournament.getBreakStartDateTime() !== undefined
                    && breakStartDateTime.getTime() === this.tournament.getBreakStartDateTime().getTime()))
            && breakDration === this.tournament.getBreakDuration()
        ) {
            return false;
        }
        if (this.structure.getRootRound().hasBegun()) {
            this.setAlert('info', 'de startdatum kan niet meer gewijzigd worden, omdat er al wedstrijden zijn gespeeld');
        }
        return true;
    }

    isTimeEnabled() {
        return this.structure.getFirstRoundNumber().getPlanningConfig().getEnableTime();
    }

    toggleBreak(breakX: boolean, p_breakDuration: number, breakDateTime?: Date) {
        let breakTime;
        let breakDuration = 0;

        if (breakX === true) {
            const date = this.competition.getStartDateTime();
            if (breakDateTime === undefined) {
                breakDateTime = new Date(date.getTime());
                breakDateTime.setHours(date.getHours() + 2);
            }
            breakTime = { hour: breakDateTime.getHours(), minute: breakDateTime.getMinutes() };
            breakDuration = p_breakDuration > 0 ? p_breakDuration : 60;
        }

        this.form.controls.breaktime.setValue(breakTime);
        this.form.controls.breakduration.setValue(breakDuration);
    }

    edit(): boolean {
        this.processing = true;
        this.setAlert('info', 'het toernooi wordt opgeslagen');

        const startDateTime = new Date(
            this.form.controls.date.value.year,
            this.form.controls.date.value.month - 1,
            this.form.controls.date.value.day,
            this.form.controls.time.value.hour,
            this.form.controls.time.value.minute
        );
        let breakStartDateTime: Date;
        if (this.form.controls.togglebreak.value) {
            breakStartDateTime = new Date(
                this.form.controls.date.value.year,
                this.form.controls.date.value.month - 1,
                this.form.controls.date.value.day,
                this.form.controls.breaktime.value.hour,
                this.form.controls.breaktime.value.minute
            );
            if (breakStartDateTime.getTime() < startDateTime.getTime()) {
                this.setAlert('danger', 'de pauze moet na het begin van het toernooi starten');
                this.processing = false;
                return;
            }
        }
        const breakDuration = this.form.controls.breakduration.value;

        const firstRoundNumber = this.structure.getFirstRoundNumber();
        try {
            const reschedule = this.shouldReschedule(startDateTime, breakStartDateTime, breakDuration);
            if (reschedule === true) {
                this.competition.setStartDateTime(startDateTime);
                this.tournament.setBreakStartDateTime(undefined);
                this.tournament.setBreakDuration(0);
                if (this.form.controls.togglebreak.value) {
                    this.tournament.setBreakStartDateTime(breakStartDateTime);
                    this.tournament.setBreakDuration(breakDuration);
                }
            }

            this.tournamentRepository.editObject(this.tournament)
                .subscribe(
                    /* happy path */ tournamentRes => {
                        this.tournament = tournamentRes;
                        if (reschedule === true) {
                            this.planningRepository.editObject(firstRoundNumber, this.tournament).subscribe(
                                    /* happy path */ gamesRes => {
                                    this.myNavigation.back();
                                },
                                /* error path */ e => {
                                    this.setAlert('danger', 'de planning is niet opgeslagen: ' + e);
                                    this.processing = false;
                                }
                            );
                        } else {
                            this.router.navigate(['/admin', tournamentRes.getId()]);
                        }
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
}
