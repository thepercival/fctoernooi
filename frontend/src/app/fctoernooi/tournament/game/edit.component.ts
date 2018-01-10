import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Competition } from 'voetbaljs/competition';
import { Game } from 'voetbaljs/game';
import { GameRepository } from 'voetbaljs/game/repository';
import { GameScore } from 'voetbaljs/game/score';
import { PlanningService } from 'voetbaljs/planning/service';
import { PoulePlaceRepository } from 'voetbaljs/pouleplace/repository';
import { INewQualifier, QualifyService } from 'voetbaljs/qualifyrule/service';
import { RoundScoreConfig } from 'voetbaljs/round/scoreconfig';
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
        structureRepository: StructureRepository,
        private gameRepository: GameRepository,
        private poulePlaceRepository: PoulePlaceRepository
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
        const gameScore = this.game.getFinalScore();
        // bepaal scoreconfig
        this.model = {
            home: gameScore ? gameScore.getHome() : 0,
            away: gameScore ? gameScore.getAway() : 0,
            played: this.game.getState() === Game.STATE_PLAYED
        };
        if (date !== undefined) {
            // console.log(date);
            this.model.startdate = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
            this.model.starttime = { hour: date.getHours(), minute: date.getMinutes() };
        }
        this.planningService = new PlanningService(this.tournament.getCompetitionseason().getStartDateTime());
    }

    setHome(home) {
        this.error = undefined;
        const scoreConfig = this.game.getRound().getInputScoreConfig();
        if (!this.validScore(home, scoreConfig)) {
            this.error = 'thuisscore moet tussen 0 en ' + scoreConfig.getMaximum();
            return;
        }
        if (this.model.home === 0 && this.model.away === 0 && home > 0) {
            this.setPlayed(true);
        }
        this.model.home = home;
    }

    setAway(away) {
        this.error = undefined;
        const scoreConfig = this.game.getRound().getInputScoreConfig();
        if (!this.validScore(away, scoreConfig)) {
            this.error = 'uitscore moet tussen 0 en ' + scoreConfig.getMaximum();
            return;
        }
        if (this.model.away === 0 && this.model.home === 0 && away > 0) {
            this.setPlayed(true);
        }
        this.model.away = away;
    }

    validScore(score, scoreConfig: RoundScoreConfig) {
        return !(score < 0 || (this.game.getRound().getConfig().getEnableTime() === false && score > scoreConfig.getMaximum()));
    }

    setPlayed(played: boolean) {
        // set model to played and do some checks before d
        this.model.played = played;
    }

    save() {
        let gameScore = this.game.getFinalScore();
        if (!gameScore) {
            gameScore = new GameScore(this.game);
        }
        const checkQualifiers = this.model.played && (gameScore.getHome() !== this.model.home || gameScore.getAway() !== this.model.away);
        console.log(checkQualifiers);
        console.log(this.model.played, gameScore.getHome(), this.model.home, gameScore.getAway(), this.model.away);
        gameScore.setHome(this.model.home);
        gameScore.setAway(this.model.away);
        gameScore.setExtraTime(false);
        const state = this.model.played === true ? Game.STATE_PLAYED : Game.STATE_CREATED;
        this.game.setState(state);
        if (this.planningService.canCalculateStartDateTime(this.game.getPoule().getRound())) {
            const startdate = new Date(
                this.model.startdate.year,
                this.model.startdate.month - 1,
                this.model.startdate.day,
                this.model.starttime.hour,
                this.model.starttime.minute
            );
            this.game.setStartDateTime(startdate);
        }

        this.loading = true;
        this.gameRepository.editObject(this.game, this.game.getPoule())
            .subscribe(
            /* happy path */ gameRes => {
                this.game = gameRes;

                if (checkQualifiers === false) {
                    this.loading = false;
                    return;
                }
                const newQualifiers: INewQualifier[] = [];
                this.game.getRound().getChildRounds().forEach(childRound => {
                    const qualService = new QualifyService(childRound);
                    qualService.getNewQualifiers(this.game.getPoule()).forEach((newQualifier) => {
                        newQualifiers.push(newQualifier);
                    });
                });

                this.loading = false;

                const reposUpdates = [];
                newQualifiers.forEach((newQualifier) => {
                    const poulePlace = newQualifier.poulePlace;
                    poulePlace.setTeam(newQualifier.team);
                    reposUpdates.push(this.poulePlaceRepository.editObject(poulePlace, poulePlace.getPoule()));
                });

                forkJoin(reposUpdates).subscribe(results => {
                    console.log('qualifier gewijzigd');
                    this.loading = false;
                },
                    err => {
                        console.log('qualifier niet gewijzigd');
                        this.loading = false;
                    }
                );

                // setTimeout(3000);
                // this.structureRepository.editObject(round, round.getCompetitionseason())
                //     .subscribe(
                //         /* happy path */ roundRes => {
                //         this.router.navigate(['/toernooi/home', tournamentRes.getId()]);
                //     },
                // /* error path */ e => { this.error = e; this.loading = false; },
                // /* onComplete */() => this.loading = false
                //     );
            },
            /* error path */ e => { this.error = e; this.loading = false; },
            /* onComplete */() => { if (checkQualifiers === false) { this.loading = false; } }
            );
    }
}
