import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Game,
    GameRepository,
    GameScore,
    GameScoreHomeAway,
    INewQualifier,
    NameService,
    Place,
    PlaceRepository,
    PlanningService,
    Poule,
    QualifyRuleMultiple,
    QualifyService,
    RankedRoundItem,
    RankingService,
    Round,
    SportScoreConfig,
    SportScoreConfigService,
    State,
    StructureRepository,
} from 'ngx-sport';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { MyNavigation } from '../../common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TranslateService } from '../../lib/translate';
import { TournamentComponent } from '../component';

@Component({
    selector: 'app-tournament-game-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class GameEditComponent extends TournamentComponent implements OnInit {
    game: Game;
    planningService: PlanningService;
    sportScoreConfigService: SportScoreConfigService;
    form: FormGroup;
    scoreControls: HomeAwayFormControl[] = [];
    calculateScoreControl: HomeAwayFormControl;
    userRefereeId: number;
    private enablePlayedAtFirstChange;
    private originalPouleState: number;

    constructor(
        route: ActivatedRoute,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private gameRepository: GameRepository,
        private placeRepository: PlaceRepository,
        public nameService: NameService,
        private myNavigation: MyNavigation,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);
        this.originalPouleState = State.Created;
        this.sportScoreConfigService = new SportScoreConfigService();
        this.form = fb.group({
            played: [''],
            extratime: ['']
        });
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => {
                this.setGame(+params.gameId);
                this.originalPouleState = this.game.getPoule().getState();
                this.tournamentRepository.getUserRefereeId(this.tournament).subscribe(
                /* happy path */ userRefereeIdRes => {
                        this.userRefereeId = userRefereeIdRes;
                    },
                /* error path */ e => { this.setAlert('danger', e); }
                );
            });
        });
    }

    get GameHOME(): boolean { return Game.HOME; }
    get GameAWAY(): boolean { return Game.AWAY; }

    hasAllEditPermissions() {
        const loggedInUserId = this.authService.getLoggedInUserId();
        if (this.tournament.hasRole(loggedInUserId, Role.GAMERESULTADMIN)) {
            return true;
        }
        return false;
    }

    getCalculateScoreDescription() {
        const scoreConfig = this.sportScoreConfigService.getCalculate(this.game.getSportScoreConfig());
        let description = '';
        if (scoreConfig.getDirection() === SportScoreConfig.UPWARDS && scoreConfig.getMaximum() > 0) {
            description = 'eerste bij ' + scoreConfig.getMaximum() + ' ';
        }
        // @TODO
        return description + '@TODO'; // scoreConfig.getName()
    }

    getInputScoreDescription() {
        const scoreConfig = this.sportScoreConfigService.getInput(this.game.getSportScoreConfig());
        let description = '';
        if (scoreConfig.getDirection() === SportScoreConfig.UPWARDS && scoreConfig.getMaximum() > 0) {
            description = 'eerste bij ' + scoreConfig.getMaximum() + ' ';
        }
        // @TODO
        return description + '@TODO'; // scoreConfig.getName();
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
        const scoreConfig = this.sportScoreConfigService.getCalculate(this.game.getSportScoreConfig());
        if (scoreConfig.getDirection() !== SportScoreConfig.UPWARDS || scoreConfig.getMaximum() === 0) {
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
        const scoreConfig = this.sportScoreConfigService.getInput(this.game.getSportScoreConfig());
        if (scoreConfig.getDirection() !== SportScoreConfig.UPWARDS || scoreConfig.getMaximum() === 0) {
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
        this.game = this.getGameById(gameId, this.structure.getRootRound());
        // const date = this.game.getStartDateTime();

        this.form.controls.played.setValue(this.game.getState() === State.Finished);
        this.form.controls.extratime.setValue(this.game.getScoresMoment() === Game.MOMENT_EXTRATIME);
        if (this.calculateAndInputScoreDiffers()) {
            this.calculateScoreControl = new HomeAwayFormControl(0, 0, true);
        }

        this.initScores(this.game);
        this.updateCalculateScoreControl();

        this.enablePlayedAtFirstChange = this.game.getScores().length === 0 && this.game.getState() !== State.Finished;

        // if (date !== undefined) {
        //     this.model.startdate = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
        //     this.model.starttime = { hour: date.getHours(), minute: date.getMinutes() };
        // }
        this.planningService = new PlanningService(this.tournament.getCompetition());
        this.processing = false;
    }

    protected getGameById(id: number, round: Round): Game {
        if (round === undefined) {
            return undefined;
        }
        let game = round.getGames().find(gameIt => gameIt.getId() === id);
        if (game !== undefined) {
            return game;
        }
        round.getChildren().some(child => {
            game = this.getGameById(id, child);
            return (game !== undefined);
        });
        return game;
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

    protected syncGameScores(alwaysAdd: boolean = true) {
        const scores = this.game.getScores();
        while (scores.length > 0) {
            scores.pop();
        }
        if (alwaysAdd || this.game.getState() === State.Finished) {
            let counter = 0;
            this.scoreControls.forEach(scoreControl => {
                const scoreHomeAway = scoreControl.getScore();
                const newGameScore = new GameScore(this.game, scoreHomeAway.getHome(), scoreHomeAway.getAway(), ++counter);
            });
        }
    }

    setHome(scoreControl: HomeAwayFormControl, home) {
        if (this.isScoreValid(scoreControl.getScore()) && this.enablePlayedAtFirstChange === true) {
            this.form.controls.played.setValue(true);
            this.game.setState(State.Finished);
        }
        this.updateCalculateScoreControl();
        this.syncGameScores();
    }

    setAway(scoreControl: HomeAwayFormControl, away) {
        if (this.isScoreValid(scoreControl.getScore()) && this.enablePlayedAtFirstChange === true) {
            this.form.controls.played.setValue(true);
            this.game.setState(State.Finished);
        }
        this.updateCalculateScoreControl();
        this.syncGameScores();
    }

    setExtratime(extratime: boolean) {
        if (this.game.getScores().length === 0) {
            this.updateCalculateScoreControl();
            this.syncGameScores();
        }
        this.game.setScoresMoment(extratime ? Game.MOMENT_EXTRATIME : Game.MOMENT_FULLTIME);
    }

    calculateAndInputScoreDiffers() {
        const inputScoreConfig = this.sportScoreConfigService.getInput(this.game.getSportScoreConfig());
        const calculateScoreConfig = this.sportScoreConfigService.getCalculate(this.game.getSportScoreConfig());
        return inputScoreConfig !== calculateScoreConfig;
    }

    addScoreControl(home: number, away: number) {
        this.scoreControls.push(new HomeAwayFormControl(home, away));
    }

    removeScoreControl(scoreControl: HomeAwayFormControl) {
        const index = this.scoreControls.indexOf(scoreControl);
        if (index >= 0) {
            this.scoreControls.splice(index, 1);
            this.updateCalculateScoreControl();
            this.syncGameScores();
        }
    }

    setPlayed(played: boolean) {
        if (played === false) {
            this.form.controls.extratime.setValue(false);
            this.initScores();
            this.updateCalculateScoreControl();
            this.syncGameScores();
        } else if (this.game.getScores().length === 0) {
            this.updateCalculateScoreControl();
            this.syncGameScores();
        }
        this.game.setState(played ? State.Finished : State.Created);
    }

    getWarningsForEqualQualifiers(): string[] {
        const poule = this.game.getPoule();
        if (poule.getState() !== State.Finished) {
            return [];
        }

        const round = poule.getRound();
        const ranking = new RankingService(round, this.tournament.getCompetition().getRuleSet());
        const pouleRankingItems = ranking.getItemsForPoule(this.game.getPoule());
        const equalPouleItems = this.getEqualPouleRankingItemsWithQualifyRules(pouleRankingItems);
        const postFix = '(' + this.nameService.getPouleName(this.game.getPoule(), true) + ')';
        let warnings: string[] = this.getWarningsForEqualQualifiersHelper(equalPouleItems, postFix);

        if (round.getState() !== State.Finished) {
            return warnings;
        }
        round.getQualifyGroups().forEach(qualifyGroup => {
            qualifyGroup.getHorizontalPoules().forEach(horizontalPoule => {
                const multipleRule = horizontalPoule.getQualifyRuleMultiple();
                if (multipleRule === undefined) {
                    return;
                }
                const rankedItems = ranking.getItemsForHorizontalPoule(horizontalPoule);
                const equalRuleItems = this.getEqualRuleRankingItems(multipleRule, rankedItems);
                const postFixTmp = '(' + this.nameService.getHorizontalPouleName(horizontalPoule) + ')';
                warnings = warnings.concat(this.getWarningsForEqualQualifiersHelper(equalRuleItems, postFixTmp));
            });
        });

        return warnings;
    }

    protected getWarningsForEqualQualifiersHelper(equalItemsPerRank: RankedRoundItem[][], postFix: string): string[] {
        return equalItemsPerRank.map(equalItems => {
            const names: string[] = equalItems.map(equalItem => {
                return this.nameService.getPlaceName(equalItem.getPlace(), true, true);
            });
            return names.join(' & ') + ' zijn precies gelijk geëindigd' + postFix;
        });
    }

    protected getEqualRuleRankingItems(multipleRule: QualifyRuleMultiple, rankingItems: RankedRoundItem[]): RankedRoundItem[][] {
        const equalItemsPerRank = this.getEqualRankedItems(rankingItems);
        const nrToQualify = multipleRule.getToPlaces().length;
        return equalItemsPerRank.filter(equalItems => {
            const equalRank = equalItems[0].getRank();
            return equalRank <= nrToQualify && ((equalRank + (equalItems.length - 1)) > nrToQualify);
        });
    }

    protected getEqualPouleRankingItemsWithQualifyRules(rankingItems: RankedRoundItem[]): RankedRoundItem[][] {
        const equalItemsPerRank = this.getEqualRankedItems(rankingItems);
        return equalItemsPerRank.filter(equalItems => {
            return equalItems.some(item => {
                const place = item.getPlace();
                return place.getToQualifyRules().length > 0;
            });
        });
    }

    protected getEqualRankedItems(rankingItems: RankedRoundItem[]): RankedRoundItem[][] {
        const equalItems = [];
        const maxRank = rankingItems[rankingItems.length - 1].getRank();
        for (let rank = 1; rank <= maxRank; rank++) {
            const equalItemsTmp = rankingItems.filter(item => item.getRank() === rank);
            if (equalItemsTmp.length > 1) {
                equalItems.push(equalItemsTmp);
            }
        }
        return equalItems;
    }

    getCalculateScoreUnitName(game: Game): string {
        const calculateScore = this.sportScoreConfigService.getCalculate(game.getSportScoreConfig());
        const translateService = new TranslateService();
        return translateService.getScoreNameSingle(calculateScore);
    }

    save(): boolean {
        this.processing = true;
        this.setAlert('info', 'de wedstrijd wordt opgeslagen');
        if (this.game.getState() === State.Finished && this.scoreControls.length === 0) {
            this.scoreControls.push(new HomeAwayFormControl(0, 0));
        }
        const moment = this.form.controls.extratime.value === true ? Game.MOMENT_EXTRATIME : Game.MOMENT_FULLTIME;
        const state = this.form.controls.played.value === true ? State.Finished : State.Created;
        this.game.setScoresMoment(moment);
        this.game.setState(state);
        this.syncGameScores(false);

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
                    const poule = this.game.getPoule();
                    const round = poule.getRound();
                    const qualifyService = new QualifyService(round, this.tournament.getCompetition().getRuleSet());
                    if (!this.shouldQualifiersBeCalculated(poule)) {
                        return this.navigateBack();
                    }
                    const pouleToFilter = this.shouldQualifiersBeCalculatedForRound(poule) ? undefined : poule;
                    const changedPlaces = qualifyService.setQualifiers(pouleToFilter);
                    if (changedPlaces.length === 0) {
                        this.navigateBack();
                        this.processing = false;
                    }

                    const reposUpdates = [];
                    changedPlaces.forEach((changedPlace) => {
                        reposUpdates.push(this.placeRepository.editObject(changedPlace, changedPlace.getPoule()));
                    });

                    forkJoin(reposUpdates).subscribe(results => {
                        this.navigateBack();
                        this.processing = false;
                    },
                        err => {
                            this.processing = false;
                            this.setAlert('danger', 'de wedstrijd is niet opgeslagen: ' + err);
                        }
                    );

                },
             /* error path */ e => { this.setAlert('danger', 'de wedstrijd kan niet worden opgeslagen: ' + e); this.processing = false; },
                // /* onComplete */() => {
                //     if (!stateChanged && !scoreChanged) {
                //             this.processing = false;
                //             this.setAlert('success', 'de wedstrijd is opgeslagen');
                //         }
                //     }
            );
        return false;
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

    protected setCompetitors(newQualifiers: INewQualifier[], places: Place[]): Place[] {
        const changedPlaces: Place[] = [];
        newQualifiers.forEach(newQualifier => {
            const place = places.find(placeIt => newQualifier.place === placeIt);
            if (place.getCompetitor() !== newQualifier.competitor) {
                place.setCompetitor(newQualifier.competitor);
                changedPlaces.push(place);
            }
        });
        return changedPlaces;
    }

    protected shouldQualifiersBeCalculated(poule: Poule): boolean {
        return !(this.originalPouleState !== State.Finished && poule.getState() !== State.Finished);
    }

    shouldQualifiersBeCalculatedForRound(poule: Poule): boolean {
        return poule.getRound().getQualifyGroups().some(qualifyGroup => qualifyGroup.getNrOfToPlacesTooMuch() > 0);
    }

    navigateBack() {
        this.myNavigation.back();
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
