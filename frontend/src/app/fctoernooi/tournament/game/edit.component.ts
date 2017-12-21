import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Competition } from 'voetbaljs/competition';
import { Game } from 'voetbaljs/game';
import { PlanningService } from 'voetbaljs/planning/service';
import { StructureRepository } from 'voetbaljs/structure/repository';

import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';

@Component({
    selector: 'app-tournament-game-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class TournamentGameEditComponent extends TournamentComponent implements OnInit {

    game: Game;
    planningService: PlanningService;
    model: any;
    loading = false;
    error = '';
    returnUrl = [];

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
            home: 0,
            away: 0,
            played: false,
            startdate: undefined,
            starttime: undefined
        };
    }

    ngOnInit() {

        this.sub = this.route.params.subscribe(params => {
            super.myNgOnInit(() => this.setGame(+params.gameId));
        });

        this.route.queryParamMap.subscribe(params => {
            this.returnUrl.push(params.get('returnAction'));
            this.returnUrl.push(+params.get('returnParams'));
        });
    }

    setGame(gameId: number) {
        this.game = this.structureService.getGameById(gameId, this.structureService.getFirstRound());
        const date = this.game.getStartDateTime();
        // bepaal scoreconfig
        this.model = {
            home: 0,
            away: 0,
            played: this.game.getState() === Game.STATE_PLAYED
        };
        if (date !== undefined) {
            console.log(date);
            this.model.startdate = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
            this.model.starttime = { hour: date.getHours(), minute: date.getMinutes() };
        }
        this.planningService = new PlanningService(this.tournament.getCompetitionseason().getStartDateTime());
    }

    getScoreConfigForInput(game: Game) {
        // this.game.getScores()
        // bepaal de parent en hier kan 1 score van worden ingevuld!! 
    }

    setHome(home) {
        // if (drawPoints < this.validations.minDrawPoints
        //     || drawPoints > this.validations.maxDrawPoints) {
        //     return;
        // }
        // check here againt scoreConfig
        this.model.home = home;
    }

    setAway(away) {
        // if (drawPoints < this.validations.minDrawPoints
        //     || drawPoints > this.validations.maxDrawPoints) {
        //     return;
        // }
        // check here againt scoreConfig
        this.model.away = away;
    }

    setPlayed(played: boolean) {
        // set model to played and do some checks before
    }

    save() {
        const startdate = new Date(
            this.model.startdate.year,
            this.model.startdate.month - 1,
            this.model.startdate.day,
            this.model.starttime.hour,
            this.model.starttime.minute
        );

        // this.loading = true;

        // this.tournament.getCompetitionseason().setStartDateTime(startdate);
        // this.tournament.getCompetitionseason().getCompetition().setName(this.model.name);

        // const round = this.structureService.getFirstRound();
        // const planningService = new PlanningService(startdate);
        // planningService.reschedule(round);

        // this.tournamentRepository.editObject(this.tournament)
        //     .subscribe(
        //     /* happy path */ tournamentRes => {
        //         this.tournament = tournamentRes;
        //         // setTimeout(3000);
        //         this.structureRepository.editObject(round, round.getCompetitionseason())
        //             .subscribe(
        //                 /* happy path */ roundRes => {
        //                 this.router.navigate(['/toernooi/home', tournamentRes.getId()]);
        //             },
        //         /* error path */ e => { this.error = e; this.loading = false; },
        //         /* onComplete */() => this.loading = false
        //             );
        //     },
        //     /* error path */ e => { this.error = e; this.loading = false; }
        //     );
    }
}
