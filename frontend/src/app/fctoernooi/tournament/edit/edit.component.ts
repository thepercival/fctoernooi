import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentRepository } from '../repository';
import { Competition } from 'voetbaljs/competition';
import { TournamentComponent } from '../component';
import { StructureRepository } from 'voetbaljs/structure/repository';
import { PlanningService } from 'voetbaljs/planning/service';
import { forkJoin } from 'rxjs/observable/forkJoin';

@Component({
    selector: 'app-tournament-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class TournamentEditComponent extends TournamentComponent implements OnInit {

    model: any;
    loading = false;
    error = '';
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
            name: null
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

    edit() {
        const startdate = new Date(
            this.model.startdate.year,
            this.model.startdate.month - 1,
            this.model.startdate.day,
            this.model.starttime.hour,
            this.model.starttime.minute
        );

        this.loading = true;

        this.tournament.getCompetitionseason().setStartDateTime(startdate);
        this.tournament.getCompetitionseason().getCompetition().setName(this.model.name);

        const round = this.structureService.getFirstRound();
        const planningService = new PlanningService(startdate);
        planningService.reschedule(round);

        this.tournamentRepository.editObject(this.tournament)
            .subscribe(
            /* happy path */ tournamentRes => {
                this.tournament = tournamentRes;
                // setTimeout(3000);
                this.structureRepository.editObject(round, round.getCompetitionseason())
                    .subscribe(
                        /* happy path */ roundRes => {
                        this.router.navigate(['/toernooi/home', tournamentRes.getId()]);
                    },
                /* error path */ e => { this.error = e; this.loading = false; },
                /* onComplete */() => this.loading = false
                    );
            },
            /* error path */ e => { this.error = e; this.loading = false; }
            );
    }
}
