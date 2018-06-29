import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Game,
    GameRepository,
    GameScore,
    GameScoreHomeAway,
    INewQualifier,
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
    customForm: FormGroup;
    scoreControls: HomeAwayFormControl[] = [];
    calculateScoreControl: HomeAwayFormControl;
    returnUrl: string;
    returnUrlParam: number;
    returnUrlQueryParamKey: string;
    returnUrlQueryParamValue: string;
    userRefereeId: number;
    private enablePlayedAtFirstChange;

    constructor(
        route: ActivatedRoute,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private gameRepository: GameRepository,
        private poulePlaceRepository: PoulePlaceRepository,
        public nameService: StructureNameService,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.customForm = fb.group({
            played: [''],
            extratime: ['']
        });
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
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

    getCalculateScoreDescription() {
        const scoreConfig = this.game.getRound().getConfig().getCalculateScore();
        let description = '';
        if (scoreConfig.getDirection() === RoundConfigScore.UPWARDS && scoreConfig.getMaximum() > 0) {
            description = 'eerste bij ' + scoreConfig.getMaximum() + ' ';
        }
        return description + scoreConfig.getName();
    }

    getInputScoreDescription() {
        const scoreConfig = this.game.getRound().getConfig().getInputScore();
        let description = '';
        if (scoreConfig.getDirection() === RoundConfigScore.UPWARDS && scoreConfig.getMaximum() > 0) {
            description = 'eerste bij ' + scoreConfig.getMaximum() + ' ';
        }
        return description + scoreConfig.getName();
    }

    aScoreIsInvalid() {
        return this.scoreControls.some(scoreControl => !this.isScoreValid(scoreControl.getScore()));
    }

    isScoreValid(score: GameScoreHomeAway): boolean {
        return score.getHome() >= 0 && score.getAway() >= 0;
    }

    isScoreEqual(score: GameScoreHomeAway): boolean {
        return score.getHome() === score.getAway() && this.calculateAndInputScoreDiffers();
    }

    getCalculateClass() {
        const scoreConfig = this.game.getRound().getConfig().getCalculateScore();
        if (scoreConfig.getDirection() !== RoundConfigScore.UPWARDS || scoreConfig.getMaximum() === 0) {
            return 'is-valid';
        }
        const score = this.calculateScoreControl.getScore();
        if ((score.getHome() === scoreConfig.getMaximum() && score.getAway() < score.getHome())
            || (score.getAway() === scoreConfig.getMaximum() && score.getHome() < score.getAway())
        ) {
            return 'is-valid';
        }
        return 'is-warning';
    }

    getInputClass(inputScoreControl: HomeAwayFormControl) {
        const score = inputScoreControl.getScore();
        if (this.isScoreValid(score) !== true) {
            return 'is-invalid';
        }
        const scoreConfig = this.game.getRound().getConfig().getInputScore();
        if (scoreConfig.getDirection() !== RoundConfigScore.UPWARDS || scoreConfig.getMaximum() === 0) {
            return 'is-valid';
        }
        if ((score.getHome() === scoreConfig.getMaximum() && score.getAway() < score.getHome())
            || (score.getAway() === scoreConfig.getMaximum() && score.getHome() < score.getAway())
        ) {
            return 'is-valid';
        }
        return 'is-warning';
    }

    setGame(gameId: number) {
        this.game = this.structureService.getGameById(gameId, this.structureService.getFirstRound());
        // const date = this.game.getStartDateTime();

        this.customForm.controls.played.setValue(this.game.getState() === Game.STATE_PLAYED);
        this.customForm.controls.extratime.setValue(this.game.getScoresMoment() === Game.MOMENT_EXTRATIME);
        if (this.calculateAndInputScoreDiffers()) {
            this.calculateScoreControl = new HomeAwayFormControl(0, 0, true);
        }

        this.initScores(this.game);
        this.updateCalculateScoreControl();

        this.enablePlayedAtFirstChange = this.game.getScores().length === 0 && this.game.getState() !== Game.STATE_PLAYED;

        // if (date !== undefined) {
        //     this.model.startdate = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
        //     this.model.starttime = { hour: date.getHours(), minute: date.getMinutes() };
        // }
        this.planningService = new PlanningService(this.structureService);
        this.processing = false;
    }

    protected initScores(game?: Game) {
        this.scoreControls = [];
        if (game !== undefined) {
            game.getScores().forEach(score => {
                this.addScoreControl(score.getHome(), score.getAway());
            });
        }
        if (this.scoreControls.length === 0) {
            this.scoreControls.push(new HomeAwayFormControl(0, 0));
        }
    }

    protected updateCalculateScoreControl() {
        if (!this.calculateAndInputScoreDiffers()) {
            return;
        }
        this.calculateScoreControl.home.setValue(0);
        this.calculateScoreControl.away.setValue(0);
        this.scoreControls.forEach(scoreControl => {
            if (this.isScoreValid(scoreControl.getScore()) === false) {
                return;
            }
            if (scoreControl.home.value > scoreControl.away.value) {
                this.calculateScoreControl.home.setValue(this.calculateScoreControl.home.value + 1);
            } else if (scoreControl.home.value < scoreControl.away.value) {
                this.calculateScoreControl.away.setValue(this.calculateScoreControl.away.value + 1);
            }
        });
    }

    setHome(scoreControl: HomeAwayFormControl, home) {
        if (this.isScoreValid(scoreControl.getScore()) && this.enablePlayedAtFirstChange === true) {
            this.customForm.controls.played.setValue(true);
        }
        this.updateCalculateScoreControl();
    }

    setAway(scoreControl: HomeAwayFormControl, away) {
        if (this.isScoreValid(scoreControl.getScore()) && this.enablePlayedAtFirstChange === true) {
            this.customForm.controls.played.setValue(true);
        }
        this.updateCalculateScoreControl();
    }

    calculateAndInputScoreDiffers() {
        return this.game.getRound().getConfig().getCalculateScore() !== this.game.getRound().getConfig().getInputScore();
    }

    addScoreControl(home: number, away: number) {
        this.scoreControls.push(new HomeAwayFormControl(home, away));
    }

    removeScoreControl(scoreControl: HomeAwayFormControl) {
        const index = this.scoreControls.indexOf(scoreControl);
        if (index >= 0) {
            this.scoreControls.splice(index, 1);
            this.updateCalculateScoreControl();
        }
    }

    setPlayed(played: boolean) {
        if (played === false) {
            this.customForm.controls.extratime.setValue(false);
            this.initScores();
            this.updateCalculateScoreControl();
        }
    }

    save() {
        this.processing = true;
        this.setAlert('info', 'de wedstrijd wordt opgeslagen');

        const moment = this.customForm.controls.extratime.value === true ? Game.MOMENT_EXTRATIME : Game.MOMENT_FULLTIME;
        const state = this.customForm.controls.played.value === true ? Game.STATE_PLAYED : Game.STATE_CREATED;
        const stateChanged = this.game.getState() !== state;
        let scoreChanged = this.hasScoreChanges(this.game.getScores(), this.scoreControls);
        scoreChanged = scoreChanged || this.game.getScoresMoment() !== moment;
        const oldPouleState = this.game.getPoule().getState();
        const oldRoundState = this.game.getRound().getState();


        this.game.setScoresMoment(moment);
        this.game.setState(state);
        if (scoreChanged) {
            const scores = this.game.getScores();
            while (scores.length > 0) {
                scores.pop();
            }
            let counter = 0;
            this.scoreControls.forEach(scoreControl => {
                const scoreHomeAway = scoreControl.getScore();
                const newGameScore = new GameScore(this.game, scoreHomeAway.getHome(), scoreHomeAway.getAway(), ++counter);
            });
        }
        // if (this.planningService.canCalculateStartDateTime(this.game.getRound().getNumber())) {
        //     const startdate = new Date(
        //         this.model.startdate.year,
        //         this.model.startdate.month - 1,
        //         this.model.startdate.day,
        //         this.model.starttime.hour,
        //         this.model.starttime.minute
        //     );
        //     this.game.setStartDateTime(startdate);
        // }

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

    protected hasScoreChanges(originalGameScores: GameScoreHomeAway[], homeAwayControls: HomeAwayFormControl[]): boolean {
        if (originalGameScores.length !== homeAwayControls.length || originalGameScores.length === 0) {
            return true;
        }
        const originalGameScoresTmp = originalGameScores.slice();
        homeAwayControls.forEach(homeAwayControl => {
            const newHomeAwayScore = homeAwayControl.getScore();
            const originalGameScoreTmp = originalGameScoresTmp.find(originalGameScore => {
                return originalGameScore.getHome() === newHomeAwayScore.getHome()
                    && originalGameScore.getAway() === newHomeAwayScore.getAway();
            });
            if (originalGameScoreTmp === undefined) {
                return;
            }
            const index = originalGameScoresTmp.indexOf(originalGameScoreTmp);
            if (index > -1) {
                originalGameScoresTmp.splice(index, 1);
            }
        });
        return originalGameScoresTmp.length > 0;
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

    // equals(one: NgbDateStruct, two: NgbDateStruct) {
    //     return one && two && two.year === one.year && two.month === one.month && two.day === one.day;
    // }
    // isSelected = date => this.equals(date, this.model.startdate);
}

class HomeAwayFormControl {
    home: FormControl;
    away: FormControl;

    constructor(
        home: number,
        away: number,
        disabled?: boolean
    ) {
        this.home = new FormControl({ value: home, disabled: disabled === true });
        this.away = new FormControl({ value: away, disabled: disabled === true });
    }

    getScore(): GameScoreHomeAway {
        return new GameScoreHomeAway(this.home.value, this.away.value);
    }
}
