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
    PoulePlace,
    PoulePlaceRepository,
    QualifyService,
    RoundConfigScore,
    StructureNameService,
    StructureRepository,
} from 'ngx-sport';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../auth/auth.service';
import { TournamentComponent } from '../component';
import { TournamentRepository } from '../repository';
import { TournamentRole } from '../role';

@Component({
    selector: 'app-tournament-game-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class TournamentGameEditComponent extends TournamentComponent implements OnInit {
    game: Game;
    planningService: PlanningService;
    model: any;
    error;
    errorHomeAwayScore;
    returnUrl: string;
    returnUrlParam: number;
    returnUrlQueryParamKey: string;
    returnUrlQueryParamValue: string;
    userRefereeId: number;

    validations: any = {
        'minlengthname': League.MIN_LENGTH_NAME,
        'maxlengthname': League.MAX_LENGTH_NAME
    };

    constructor(
        route: ActivatedRoute,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private gameRepository: GameRepository,
        private poulePlaceRepository: PoulePlaceRepository,
        public nameService: StructureNameService
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
            super.myNgOnInit(() => {
                this.setGame(+params.gameId);
                this.tournamentRepository.getUserRefereeId(this.tournament).subscribe(
                /* happy path */ userRefereeIdRes => {
                        this.userRefereeId = userRefereeIdRes;
                    },
                /* error path */ e => { this.setAlert('danger', e); }
                );
            });
        });

        this.route.queryParamMap.subscribe(params => {
            this.returnUrl = params.get('returnAction');
            this.returnUrlParam = +params.get('returnParam');
            this.returnUrlQueryParamKey = params.get('returnQueryParamKey');
            this.returnUrlQueryParamValue = params.get('returnQueryParamValue');
        });
    }

    hasAllEditPermissions() {
        const loggedInUserId = this.authService.getLoggedInUserId();
        if (this.tournament.hasRole(loggedInUserId, TournamentRole.GAMERESULTADMIN)) {
            return true;
        }
        return false;
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
        this.processing = false;
    }

    setHome(home) {
        this.error = undefined;
        // const scoreConfig = this.game.getScoreConfig();
        // if (!this.validScore(home, scoreConfig)) {
        //     this.errorHomeAwayScore = 'thuisscore moet tussen 0 en ' + scoreConfig.getMaximum() + ' liggen';
        //     return;
        // }
        if ((this.model.home === 0 || this.model.home === null) && this.model.away === 0 && home > 0) {
            this.setPlayed(true);
        }
        this.model.home = home;
    }

    setAway(away) {
        this.error = undefined;
        // const scoreConfig = this.game.getScoreConfig();
        // if (!this.validScore(away, scoreConfig)) {
        //     this.errorHomeAwayScore = 'uitscore moet tussen 0 en ' + scoreConfig.getMaximum() + ' liggen';
        //     return;
        // }
        if ((this.model.away === 0 || this.model.away === null) && this.model.home === 0 && away > 0) {
            this.setPlayed(true);
        }
        this.model.away = away;
    }

    validScore(score, scoreConfig: RoundConfigScore) {
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
        const queryParams = { scrollToGameId: this.game.getId(), scrollToRoundNumber: this.game.getRound().getNumber() };
        if (this.returnUrlQueryParamKey !== undefined) {
            queryParams[this.returnUrlQueryParamKey] = this.returnUrlQueryParamValue;
        }
        return queryParams;
    }

    navigateBack() {
        this.router.navigate(this.getForwarUrl(), { queryParams: this.getForwarUrlQueryParams() });
    }

    save() {
        this.processing = true;
        this.setAlert('info', 'de wedstrijd wordt opgeslagen');
        let gameScore = this.game.getFinalScore();
        if (!gameScore) {
            gameScore = new GameScore(this.game);
        }
        const moment = this.model.extratime === true ? Game.MOMENT_EXTRATIME : Game.MOMENT_FULLTIME;
        const state = this.model.played === true ? Game.STATE_PLAYED : Game.STATE_CREATED;
        const stateChanged = this.game.getState() !== state;
        let scoreChanged = gameScore.getHome() !== this.model.home || gameScore.getAway() !== this.model.away;
        scoreChanged = scoreChanged || gameScore.getMoment() !== moment;
        const oldPouleState = this.game.getPoule().getState();
        const oldRoundState = this.game.getRound().getState();
        gameScore.setHome(this.model.home);
        gameScore.setAway(this.model.away);
        gameScore.setMoment(moment);

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

        this.gameRepository.editObject(this.game, this.game.getPoule())
            .subscribe(
            /* happy path */ gameRes => {
                    this.game = gameRes;
                    if (!stateChanged && !scoreChanged) {
                        this.processing = false;
                        this.setAlert('success', 'de wedstrijd is opgeslagen');
                        this.navigateBack();
                        return;
                    }

                    const currentQualifiedPoulePlaces: PoulePlace[] = [];
                    this.game.getRound().getChildRounds().forEach(childRound => {
                        childRound.getPoulePlaces().forEach(poulePlace => {
                            currentQualifiedPoulePlaces.push(poulePlace);
                        });
                    });
                    const newQualifiers: INewQualifier[] = [];
                    this.game.getRound().getChildRounds().forEach(childRound => {
                        const qualService = new QualifyService(childRound);
                        const qualifyRules = qualService.getRulesToProcess(this.game.getPoule(), oldPouleState, oldRoundState);
                        qualService.getNewQualifiers(qualifyRules).forEach((newQualifier) => {
                            newQualifiers.push(newQualifier);
                        });
                    });
                    const changedPoulePlaces = this.setTeams(newQualifiers, currentQualifiedPoulePlaces);
                    if (changedPoulePlaces.length > 0) {
                        const reposUpdates = [];
                        changedPoulePlaces.forEach((changedPoulePlace) => {
                            reposUpdates.push(this.poulePlaceRepository.editObject(changedPoulePlace, changedPoulePlace.getPoule()));
                        });

                        forkJoin(reposUpdates).subscribe(results => {
                            this.navigateBack();
                            this.processing = false;
                        },
                            err => {
                                this.processing = false;
                                this.setAlert('info', 'de wedstrijd is niet opgeslagen: ' + err);
                            }
                        );
                    } else {
                        this.navigateBack();
                    }
                },
            /* error path */ e => { this.setAlert('danger', 'de wedstrijd kan niet worden opgeslagen: ' + e); this.processing = false; },
            // /* onComplete */() => {
            //     if (!stateChanged && !scoreChanged) {
            //             this.processing = false;
            //             this.setAlert('success', 'de wedstrijd is opgeslagen');
            //         }
            //     }
        );
    }

    protected setTeams(newQualifiers: INewQualifier[], poulePlaces: PoulePlace[]): PoulePlace[] {
        const changedPoulePlaces: PoulePlace[] = [];
        newQualifiers.forEach(newQualifier => {
            const poulePlace = poulePlaces.find(poulePlaceIt => newQualifier.poulePlace === poulePlaceIt);
            if (poulePlace.getTeam() !== newQualifier.team) {
                poulePlace.setTeam(newQualifier.team);
                changedPoulePlaces.push(poulePlace);
            }
        });
        return changedPoulePlaces;
    }

    equals(one: NgbDateStruct, two: NgbDateStruct) {
        return one && two && two.year === one.year && two.month === one.month && two.day === one.day;
    }
    isSelected = date => this.equals(date, this.model.startdate);
}

