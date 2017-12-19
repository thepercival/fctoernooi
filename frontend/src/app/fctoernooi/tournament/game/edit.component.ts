import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Competition } from 'voetbaljs/competition';
import { Game } from 'voetbaljs/game';
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
            name: null
        };
    }

    ngOnInit() {

        this.sub = this.route.params.subscribe(params => {
            super.myNgOnInit(() => this.setGame(+params.gameId));
        });

        this.route.queryParamMap.subscribe(params => {
            this.returnUrl.push(params.get('returnAction'));
            this.returnUrl.push(+params.get('returnParams'));
            console.log(this.returnUrl);
        });
    }

    setGame(gameId: number) {
        this.game = this.structureService.getGameById(gameId);
        console.log(this.game);
    }

    setPlayed(played: boolean) {
        // set model to played and do some checks before
    }
    // edit() {
    //     const startdate = new Date(
    //         this.model.startdate.year,
    //         this.model.startdate.month - 1,
    //         this.model.startdate.day,
    //         this.model.starttime.hour,
    //         this.model.starttime.minute
    //     );

    //     this.loading = true;

    //     this.tournament.getCompetitionseason().setStartDateTime(startdate);
    //     this.tournament.getCompetitionseason().getCompetition().setName(this.model.name);

    //     const round = this.structureService.getFirstRound();
    //     const planningService = new PlanningService(startdate);
    //     planningService.reschedule(round);

    //     this.tournamentRepository.editObject(this.tournament)
    //         .subscribe(
    //         /* happy path */ tournamentRes => {
    //             this.tournament = tournamentRes;
    //             // setTimeout(3000);
    //             this.structureRepository.editObject(round, round.getCompetitionseason())
    //                 .subscribe(
    //                     /* happy path */ roundRes => {
    //                     this.router.navigate(['/toernooi/home', tournamentRes.getId()]);
    //                 },
    //             /* error path */ e => { this.error = e; this.loading = false; },
    //             /* onComplete */() => this.loading = false
    //                 );
    //         },
    //         /* error path */ e => { this.error = e; this.loading = false; }
    //         );
    // }
}
