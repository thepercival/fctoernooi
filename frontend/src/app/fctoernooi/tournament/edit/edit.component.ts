import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Competition } from 'voetbaljs/competition';
import { PlanningService } from 'voetbaljs/planning/service';
import { StructureRepository } from 'voetbaljs/structure/repository';

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
        'minlengthname': Competition.MIN_LENGTH_NAME,
        'maxlengthname': Competition.MAX_LENGTH_NAME
    };

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository
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
        const date = this.tournament.getCompetitionseason().getStartDateTime();
        this.model = {
            starttime: { hour: date.getHours(), minute: date.getMinutes() },
            startdate: { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() },
            name: this.tournament.getCompetitionseason().getCompetition().getName()
        };
    }

    shouldReschedule(startDateTime: Date): boolean {
        if (startDateTime.getTime() === this.tournament.getCompetitionseason().getStartDateTime().getTime()) {
            return false;
        }
        // console.log(startDateTime, this.tournament.getCompetitionseason().getStartDateTime());
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
            this.tournament.getCompetitionseason().getCompetition().setName(this.model.name);
            const reschedule = this.shouldReschedule(startDateTime);
            if (reschedule === true) {
                this.tournament.getCompetitionseason().setStartDateTime(startDateTime);
                const planningService = new PlanningService(startDateTime);
                planningService.reschedule(round);
            }

            this.tournamentRepository.editObject(this.tournament)
                .subscribe(
                /* happy path */ tournamentRes => {
                    this.tournament = tournamentRes;
                    // setTimeout(3000);
                    if (reschedule === true) {
                        this.structureRepository.editObject(round, round.getCompetitionseason())
                            .subscribe(
                            /* happy path */ roundRes => {
                                this.router.navigate(['/toernooi/home', tournamentRes.getId()]);
                            },
                    /* error path */ e => { this.error = e; this.loading = false; },
                    /* onComplete */() => this.loading = false);
                    }

                },
                /* error path */ e => { this.error = e; this.loading = false; },
                /* onComplete */() => this.loading = false
                );
        } catch (e) {
            this.setAlert('danger', e.message);
        }
    }
}
