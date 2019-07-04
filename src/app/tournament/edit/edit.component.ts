import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { League, NameService, PlanningRepository, PlanningService, RoundNumber, StructureRepository } from 'ngx-sport';

import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentService } from '../../lib/tournament/service';
import { TournamentComponent } from '../component';

@Component({
    selector: 'app-tournament-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class EditComponent extends TournamentComponent implements OnInit {
    customForm: FormGroup;
    minDateStruct: NgbDateStruct;
    processing = true;
    hasBegun: boolean;

    validations: any = {
        minlengthname: League.MIN_LENGTH_NAME,
        maxlengthname: League.MAX_LENGTH_NAME,
        minbreakduration: 0,
        maxbreakduration: 3600
    };

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private planningRepository: PlanningRepository,
        public nameService: NameService,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);

        // hier regelset toevoegen @TODO

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
            public: ['', Validators.compose([
            ])]
        });
    }

    ngOnInit() {
        super.myNgOnInit(() => this.initFields());
    }

    initFields() {
        this.hasBegun = this.structure.getRootRound().hasBegun();
        const date = this.tournament.getCompetition().getStartDateTime();

        const now = new Date();
        const minDate = date > now ? now : date;
        this.minDateStruct = { year: minDate.getFullYear(), month: minDate.getMonth() + 1, day: minDate.getDate() };

        this.customForm.controls.name.setValue(this.tournament.getCompetition().getLeague().getName());
        this.customForm.controls.date.setValue({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
        this.customForm.controls.time.setValue({ hour: date.getHours(), minute: date.getMinutes() });

        this.customForm.controls.public.setValue(this.tournament.getPublic());
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
        if (this.structure.getRootRound().hasBegun()) {
            this.setAlert('info', 'de startdatum kan niet meer gewijzigd worden, omdat er al gespeelde wedstrijden zijn');
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
            const date = this.tournament.getCompetition().getStartDateTime();
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

    edit(): boolean {
        this.processing = true;
        this.setAlert('info', 'het toernooi wordt opgeslagen');

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

        const firstRoundNumber = this.structure.getFirstRoundNumber();
        try {
            this.tournament.setPublic(this.customForm.controls.public.value);
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
                tournamentService.reschedule(new PlanningService(this.tournament.getCompetition()), firstRoundNumber);
            }

            this.tournamentRepository.editObject(this.tournament)
                .subscribe(
                    /* happy path */ tournamentRes => {
                        this.tournament = tournamentRes;
                        if (reschedule === true) {
                            this.planningRepository.editObject(firstRoundNumber).subscribe(
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
        return false;
    }

    equals(one: NgbDateStruct, two: NgbDateStruct) {
        return one && two && two.year === one.year && two.month === one.month && two.day === one.day;
    }
    isSelected = date => this.equals(date, this.customForm.controls.date.value);

    linkToRoundSettings(roundNumber: RoundNumber) {
        this.router.navigate(['/toernooi/roundssettings', this.tournament.getId(), roundNumber.getNumber()]);
    }
}
