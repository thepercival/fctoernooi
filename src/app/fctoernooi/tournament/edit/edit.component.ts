import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker.module';
import { League, PlanningRepository, PlanningService, StructureRepository } from 'ngx-sport';

import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';
import { TournamentService } from '../service';

@Component({
    selector: 'app-tournament-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class TournamentEditComponent extends TournamentComponent implements OnInit {
    customForm: FormGroup;
    minDateStruct: NgbDateStruct;

    validations: any = {
        minlengthname: League.MIN_LENGTH_NAME,
        maxlengthname: League.MAX_LENGTH_NAME,
        minbreakduration: 0,
        maxbreakduration: 360
    };

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private planningRepository: PlanningRepository,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.customForm = fb.group({
            name: ['', Validators.compose([
                Validators.required,
                Validators.minLength(this.validations.minlengthname),
                Validators.maxLength(this.validations.maxlengthname)
            ])],
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
            ])],

        });
        const date = new Date();
        this.minDateStruct = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
    }

    ngOnInit() {
        super.myNgOnInit(() => this.initFields());
    }

    initFields() {
        const date = this.tournament.getCompetition().getStartDateTime();

        this.customForm.controls.name.setValue(this.tournament.getCompetition().getLeague().getName());
        this.customForm.controls.date.setValue({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
        this.customForm.controls.time.setValue({ hour: date.getHours(), minute: date.getMinutes() });

        this.customForm.controls.togglebreak.setValue(this.tournament.hasBreak());
        this.toggleBreak(this.tournament.hasBreak(), this.tournament.getBreakDuration(), this.tournament.getBreakStartDateTime());

        this.processing = false;
    }

    shouldReschedule(startDateTime: Date, breakStartDateTime: Date, breakDration: number): boolean {
        if (startDateTime.getTime() === this.tournament.getCompetition().getStartDateTime().getTime()
            && (breakStartDateTime === undefined && this.tournament.getBreakStartDateTime() === undefined
                || (breakStartDateTime !== undefined && this.tournament.getBreakStartDateTime() !== undefined
                    && breakStartDateTime.getTime() === this.tournament.getBreakStartDateTime().getTime()))
            && breakDration === this.tournament.getBreakDuration()
        ) {
            return false;
        }
        if (this.structureService.getFirstRound().isStarted()) {
            this.setAlert('info', 'de startdatum mag niet veranderen omdat het toernooi al is begonnen');
        }
        return true;
    }

    isTimeEnabled() {
        return this.structureService.getFirstRound().getConfig().getEnableTime();
    }

    toggleBreak(breakX: boolean, p_breakDuration: number, breakDateTime: Date = undefined) {
        let breakTime;
        let breakDuration = 0;

        if (breakX === true) {
            const date = this.tournament.getCompetition().getStartDateTime();
            console.log(date);
            if (breakDateTime === undefined) {
                breakDateTime = new Date(date.getTime());
                breakDateTime.setHours(date.getHours() + 2);
            }
            breakTime = { hour: breakDateTime.getHours(), minute: breakDateTime.getMinutes() };
            breakDuration = p_breakDuration > 0 ? p_breakDuration : 60;
        }

        this.customForm.controls.breaktime.setValue(breakTime);
        this.customForm.controls.breakduration.setValue(breakDuration);
    }

    edit() {
        this.processing = true;
        this.setAlert('info', 'het toernooi wordt opgeslagen');

        const name = this.customForm.controls.name.value;

        const startDateTime = new Date(
            this.customForm.controls.date.value.year,
            this.customForm.controls.date.value.month - 1,
            this.customForm.controls.date.value.day,
            this.customForm.controls.time.value.hour,
            this.customForm.controls.time.value.minute
        );
        let breakStartDateTime: Date;
        if (this.customForm.controls.togglebreak.value) {
            breakStartDateTime = new Date(
                this.customForm.controls.date.value.year,
                this.customForm.controls.date.value.month - 1,
                this.customForm.controls.date.value.day,
                this.customForm.controls.breaktime.value.hour,
                this.customForm.controls.breaktime.value.minute
            );
        }
        const breakDuration = this.customForm.controls.breakduration.value;

        const round = this.structureService.getFirstRound();
        try {
            this.tournament.getCompetition().getLeague().setName(this.customForm.controls.name.value);
            const reschedule = this.shouldReschedule(startDateTime, breakStartDateTime, breakDuration);
            if (reschedule === true) {
                this.tournament.getCompetition().setStartDateTime(startDateTime);
                this.tournament.setBreakStartDateTime(undefined);
                this.tournament.setBreakDuration(0);
                if (this.customForm.controls.togglebreak.value) {
                    this.tournament.setBreakStartDateTime(breakStartDateTime);
                    this.tournament.setBreakDuration(breakDuration);
                }
                const tournamentService = new TournamentService(this.tournament);
                tournamentService.reschedule(new PlanningService(this.structureService), round.getNumber());
            }

            this.tournamentRepository.editObject(this.tournament)
                .subscribe(
                    /* happy path */ tournamentRes => {
                        this.tournament = tournamentRes;
                        if (reschedule === true) {
                            this.planningRepository.editObject([round]).subscribe(
                                    /* happy path */ gamesRes => {
                                    this.router.navigate(['/toernooi', tournamentRes.getId()]);
                                },
                                /* error path */ e => {
                                    this.setAlert('danger', 'de planning is niet opgeslagen: ' + e);
                                    this.processing = false;
                                }
                            );
                        } else {
                            this.router.navigate(['/toernooi', tournamentRes.getId()]);
                        }
                    },
                    /* error path */ e => { this.setAlert('danger', 'het toernooi is niet opgeslagen: ' + e); this.processing = false; }
                );
        } catch (e) {
            this.setAlert('danger', e.message);
            this.processing = false;
        }
    }

    equals(one: NgbDateStruct, two: NgbDateStruct) {
        return one && two && two.year === one.year && two.month === one.month && two.day === one.day;
    }
    isSelected = date => this.equals(date, this.customForm.controls.date.value);
}
