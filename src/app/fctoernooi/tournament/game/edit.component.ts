import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/datepicker.module';
import {
    Game,
    GameRepository,
    GameScore,
    INewQualifier,
    League,
    PlanningService,
    PoulePlaceRepository,
    QualifyService,
    RoundScoreConfig,
    StructureRepository,
} from 'ngx-sport';
import { forkJoin } from 'rxjs/observable/forkJoin';

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
    error;
    errorHomeAwayScore;
    returnUrl: string;
    returnUrlParam: number;
    returnUrlQueryParamKey: string;
    returnUrlQueryParamValue: string;

    validations: any = {
        'minlengthname': League.MIN_LENGTH_NAME,
        'maxlengthname': League.MAX_LENGTH_NAME
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
            extratime: false,
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
            this.returnUrl = params.get('returnAction');
            this.returnUrlParam = +params.get('returnParam');
            this.returnUrlQueryParamKey = params.get('returnQueryParamKey');
            this.returnUrlQueryParamValue = params.get('returnQueryParamValue');
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
            extratime: gameScore ? gameScore.getMoment() === Game.MOMENT_EXTRATIME : false,
            played: this.game.getState() === Game.STATE_PLAYED
        };
        if (date !== undefined) {
            this.model.startdate = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
            this.model.starttime = { hour: date.getHours(), minute: date.getMinutes() };
        }
        this.planningService = new PlanningService(this.structureService);
    }

    setHome(home) {
        this.error = undefined;
        const scoreConfig = this.game.getRound().getInputScoreConfig();
        if (!this.validScore(home, scoreConfig)) {
            this.errorHomeAwayScore = 'thuisscore moet tussen 0 en ' + scoreConfig.getMaximum() + ' liggen';
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
            this.errorHomeAwayScore = 'uitscore moet tussen 0 en ' + scoreConfig.getMaximum() + ' liggen';
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
        if (this.model.played === true && played === false) {
            this.model.extratime = false;
            this.setHome(0);
            this.setAway(0);
        }
        this.model.played = played;
    }

    private getForwarUrl() {
        return [this.returnUrl, this.returnUrlParam];
    }

    private getForwarUrlQueryParams(): {} {
        const queryParams = {};
        if (this.returnUrlQueryParamKey !== undefined) {
            queryParams[this.returnUrlQueryParamKey] = this.returnUrlQueryParamValue;
        }
        return queryParams;
    }

    navigateBack() {
        this.router.navigate(this.getForwarUrl(), { queryParams: this.getForwarUrlQueryParams() });
    }

    save() {
        let gameScore = this.game.getFinalScore();
        if (!gameScore) {
            gameScore = new GameScore(this.game);
        }
        const checkQualifiers = this.model.played && (gameScore.getHome() !== this.model.home || gameScore.getAway() !== this.model.away);
        gameScore.setHome(this.model.home);
        gameScore.setAway(this.model.away);
        gameScore.setMoment(this.model.extratime === true ? Game.MOMENT_EXTRATIME : Game.MOMENT_FULLTIME);
        const state = this.model.played === true ? Game.STATE_PLAYED : Game.STATE_CREATED;
        this.game.setState(state);
        if (this.planningService.canCalculateStartDateTime(this.game.getRound().getNumber())) {
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
                        this.navigateBack();
                        return;
                    }

                    const newQualifiers: INewQualifier[] = [];
                    this.game.getRound().getChildRounds().forEach(childRound => {
                        const qualService = new QualifyService(childRound);
                        qualService.getNewQualifiers(this.game.getPoule()).forEach((newQualifier) => {
                            newQualifiers.push(newQualifier);
                        });
                    });

                    if (newQualifiers.length > 0) {
                        const reposUpdates = [];
                        newQualifiers.forEach((newQualifier) => {
                            const poulePlace = newQualifier.poulePlace;
                            poulePlace.setTeam(newQualifier.team);
                            reposUpdates.push(this.poulePlaceRepository.editObject(poulePlace, poulePlace.getPoule()));
                        });

                        forkJoin(reposUpdates).subscribe(results => {
                            this.navigateBack();
                            this.loading = false;
                        },
                            err => {
                                this.loading = false;
                            }
                        );
                        return;
                    }
                    this.navigateBack();
                },
            /* error path */ e => { this.error = e; this.loading = false; },
            /* onComplete */() => { if (checkQualifiers === false) { this.loading = false; } }
            );
    }

    equals(one: NgbDateStruct, two: NgbDateStruct) {
        return one && two && two.year === one.year && two.month === one.month && two.day === one.day;
    }
    isSelected = date => this.equals(date, this.model.startdate);
}

