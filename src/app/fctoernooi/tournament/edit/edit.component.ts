import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker.module';
import { League, PlanningRepository, PlanningService, StructureRepository } from 'ngx-sport';

import { IAlert } from '../../../app.definitions';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';

@Component({
    selector: 'app-tournament-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class TournamentEditComponent extends TournamentComponent implements OnInit {

    model: any;
    loading = false;
    error = '';
    alert: IAlert;

    validations: any = {
        'minlengthname': League.MIN_LENGTH_NAME,
        'maxlengthname': League.MAX_LENGTH_NAME
    };

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private planningRepository: PlanningRepository
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.model = {
            name: undefined
        };
    }

    ngOnInit() {
        super.myNgOnInit(() => this.initFields());
    }

    initFields() {
        const date = this.tournament.getCompetition().getStartDateTime();
        this.model = {
            starttime: { hour: date.getHours(), minute: date.getMinutes() },
            startdate: { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() },
            name: this.tournament.getCompetition().getLeague().getName()
        };
    }

    shouldReschedule(startDateTime: Date): boolean {
        if (startDateTime.getTime() === this.tournament.getCompetition().getStartDateTime().getTime()) {
            return false;
        }
        // console.log(startDateTime, this.tournament.getCompetition().getStartDateTime());
        if (this.structureService.getFirstRound().isStarted()) {
            throw new Error('de startdatum mag niet veranderen omdat het toernooi al is begonnen');
        }
        return true;
    }

    protected setAlert(type: string, message: string) {
        this.alert = { 'type': type, 'message': message };
    }

    edit() {
        const startDateTime = new Date(
            this.model.startdate.year,
            this.model.startdate.month - 1,
            this.model.startdate.day,
            this.model.starttime.hour,
            this.model.starttime.minute
        );

        this.loading = true;
        const round = this.structureService.getFirstRound();
        try {
            this.tournament.getCompetition().getLeague().setName(this.model.name);
            const reschedule = this.shouldReschedule(startDateTime);
            if (reschedule === true) {
                this.tournament.getCompetition().setStartDateTime(startDateTime);
                const planningService = new PlanningService(this.structureService);
                planningService.reschedule(round.getNumber());
            }

            this.tournamentRepository.editObject(this.tournament)
                .subscribe(
                /* happy path */ tournamentRes => {
                        this.tournament = tournamentRes;
                        if (reschedule === true) {
                            this.planningRepository.editObject([round]).subscribe(
                                /* happy path */ gamesRes => {
                                    this.router.navigate(['/toernooi/home', tournamentRes.getId()]);
                                },
                               /* error path */ e => { this.error = e; this.loading = false; }
                            );
                        }
                    },
                /* error path */ e => { this.error = e; this.loading = false; },
                /* onComplete */() => this.loading = false
                );
        } catch (e) {
            this.setAlert('danger', e.message);
        }
    }

    equals(one: NgbDateStruct, two: NgbDateStruct) {
        return one && two && two.year === one.year && two.month === one.month && two.day === one.day;
    }
    isSelected = date => this.equals(date, this.model.startdate);
}
