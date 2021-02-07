import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Game,
    NameService,
    Place,
    Poule,
    QualifyRuleMultiple,
    QualifyService,
    RankedRoundItem,
    RankingService,
    Round,
    State,
    QualifyGroup,
    RoundNumber,
    PlaceLocationMap,
    ScoreConfigService,
    ScoreConfig,
    AgainstGame,
    GameMode,
    PlanningConfigMapper,
    PlanningConfig,
    TogetherGame,
    GameMapper,
    JsonAgainstGame,
    JsonTogetherGame,
    ScoreConfigMapper,
    AgainstScoreHelper,
} from 'ngx-sport';
import { forkJoin, Observable, of } from 'rxjs';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TranslateService } from '../../lib/translate';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { GameRepository } from '../../lib/ngx-sport/game/repository';
import { TournamentUser } from '../../lib/tournament/user';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-tournament-againstgame-edit',
    templateUrl: './editagainst.component.html',
    styleUrls: ['./editagainst.component.scss']
})
export class GameAgainstEditComponent extends TournamentComponent implements OnInit {
    public game: AgainstGame;
    public scoreConfigService: ScoreConfigService;
    public form: FormGroup;
    public hasAuthorization: boolean = false;
    // private originalPouleState: number;    
    public planningConfig: PlanningConfig;
    public firstScoreConfig: ScoreConfig;
    public nameService: NameService;
    public warningsForEqualQualifiers: string[] = [];
    private equalQualifiersChecker: EqualQualifiersChecker;
    public calculateScoreControl: AgainstScoreFormControl;
    public scoreControls: AgainstScoreFormControl[] = [];
    public pristineScore = true;

    constructor(
        route: ActivatedRoute,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private gameRepository: GameRepository,
        private scoreConfigMapper: ScoreConfigMapper,
        private mapper: GameMapper,
        private myNavigation: MyNavigation,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);
        // this.originalPouleState = State.Created;
        this.scoreConfigService = new ScoreConfigService();
        this.form = fb.group({
            played: [''],
            extratime: ['']
        });
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => {
                this.nameService = new NameService(new PlaceLocationMap(this.tournament.getCompetitors()));
                this.game = this.getGameById(+params.gameId, this.structure.getRootRound());
                if (this.game === undefined) {
                    this.setAlert('danger', 'de wedstrijd kan niet gevonden worden');
                    this.processing = false;
                    return;
                }
                this.equalQualifiersChecker = new EqualQualifiersChecker(this.game, this.nameService);
                this.initGame();
                // this.originalPouleState = this.game.getPoule().getState();
                const tournamentUser = this.tournament.getUser(this.authService.getUser());
                this.getAuthorization(tournamentUser).subscribe(
                        /* happy path */ hasAuthorization => {
                        this.hasAuthorization = hasAuthorization;
                        if (!this.hasAuthorization) {
                            this.setAlert('danger', 'je bent geen scheidsrechter voor deze wedstrijd of uitslagen-invoerder voor dit toernooi, je emailadres moet door de beheerder gekoppeld zijn');
                        }
                        this.processing = false;
                    }
                );

            });
        });
    }

    protected getAuthorization(tournamentUser?: TournamentUser): Observable<boolean> {
        if (!tournamentUser) {
            return of(false);
        }
        if (tournamentUser.hasRoles(Role.GAMERESULTADMIN)) {
            return of(true);
        }
        if (!tournamentUser.hasRoles(Role.REFEREE) || !this.game.getReferee()) {
            return of(false);
        }
        return this.tournamentRepository.getUserRefereeId(this.tournament).pipe(
            map((userRefereeId: number) => this.game.getReferee().getId() === userRefereeId)
        );
    }

    get Against(): GameMode { return GameMode.Against; }
    get Together(): GameMode { return GameMode.Together; }

    get GameHOME(): boolean { return AgainstGame.Home; }
    get GameAWAY(): boolean { return AgainstGame.Away; }

    getCalculateScoreDescription() {
        const scoreConfig = this.firstScoreConfig.getCalculate();
        let description = '';
        if (scoreConfig.getDirection() === ScoreConfig.UPWARDS && scoreConfig.getMaximum() > 0) {
            description = 'eerste bij ' + scoreConfig.getMaximum() + ' ';
        }
        const translate = new TranslateService();
        return description + translate.getScoreNamePlural(this.scoreConfigMapper.toJson(scoreConfig));
    }

    // getFieldDescription(): string {
    //     const translate = new TranslateService();
    //     return translate.getFieldNameSingular(this.firstScoreConfig.getSport());
    // }

    getInputScoreDescription() {
        let description = '';
        if (this.firstScoreConfig.getDirection() === ScoreConfig.UPWARDS && this.firstScoreConfig.getMaximum() > 0) {
            description = 'eerste bij ' + this.firstScoreConfig.getMaximum() + ' ';
        }
        const translate = new TranslateService();
        return description + translate.getScoreNamePlural(this.scoreConfigMapper.toJson(this.firstScoreConfig));
    }

    aScoreIsInvalid() {
        return this.scoreControls.some(scoreControl => !scoreControl.isScoreValid());
    }

    protected initScoreControls(onlyReset?: boolean) {
        this.scoreControls = [];
        console.log(this.scoreControls);
        if (onlyReset !== true) {
            this.game.getScores().forEach(score => {
                this.addScoreControl(score.getHome(), score.getAway());
            });
        }
        if (this.scoreControls.length === 0) {
            this.scoreControls.push(new AgainstScoreFormControl(this.firstScoreConfig, 0, 0));
        }
    }

    protected updateCalculateScoreControl() {
        if (this.firstScoreConfig === this.firstScoreConfig.getCalculate()) {
            return;
        }
        this.calculateScoreControl.home.setValue(0);
        this.calculateScoreControl.away.setValue(0);
        this.scoreControls.forEach(scoreControl => {
            if (scoreControl.isScoreValid() === false) {
                return;
            }
            if (scoreControl.home.value > scoreControl.away.value) {
                this.calculateScoreControl.home.setValue(this.calculateScoreControl.home.value + 1);
            } else if (scoreControl.home.value < scoreControl.away.value) {
                this.calculateScoreControl.away.setValue(this.calculateScoreControl.away.value + 1);
            }
        });
        this.postScoreControlUpdate();
    }

    postScoreControlUpdate() {
        if (this.pristineScore && this.game.getScores().length === 0) {
            this.form.controls.played.setValue(true);
        }
        this.updateCalculateScoreControl();
        this.pristineScore = false;
    }

    allScoresAreInvalid(): boolean {
        return this.scoreControls.every((scoreControl: AgainstScoreFormControl) => !scoreControl.isScoreValid());

    }

    setExtratime(extratime: boolean) {
        if (this.game.getScores().length === 0) {
            this.updateCalculateScoreControl();
        }
    }

    addScoreControl(home: number, away: number) {
        this.scoreControls.push(new AgainstScoreFormControl(this.firstScoreConfig, home, away));
        this.postScoreControlUpdate();
    }

    removeScoreControl() {
        this.scoreControls.pop();
        this.updateCalculateScoreControl();
    }

    setPlayed(played: boolean) {
        if (played === false) {
            this.form.controls.extratime.setValue(false);
            this.initScoreControls(true);
            this.updateCalculateScoreControl();
        } else if (this.game.getScores().length === 0) {
            this.updateCalculateScoreControl();
        }
    }

    getCalculateScoreUnitName(game: Game): string {
        const calculateScore = game.getScoreConfig().getCalculate();
        const translateService = new TranslateService();
        return translateService.getScoreNameSingular(this.scoreConfigMapper.toJson(calculateScore));
    }

    // getCalculateScoreDescription() {
    //     const scoreConfig = this.firstScoreConfig.getCalculate();
    //     let description = '';
    //     if (scoreConfig.getDirection() === ScoreConfig.UPWARDS && scoreConfig.getMaximum() > 0) {
    //         description = 'eerste bij ' + scoreConfig.getMaximum() + ' ';
    //     }
    //     const translate = new TranslateService();
    //     return description + translate.getScoreNamePlural(scoreConfig);
    // }

    getFieldDescription(): string {
        const translate = new TranslateService();
        return translate.getFieldNameSingular(this.firstScoreConfig.getSport());
    }

    // getInputScoreDescription() {
    //     let description = '';
    //     if (this.firstScoreConfig.getDirection() === ScoreConfig.UPWARDS && this.firstScoreConfig.getMaximum() > 0) {
    //         description = 'eerste bij ' + this.firstScoreConfig.getMaximum() + ' ';
    //     }
    //     const translate = new TranslateService();
    //     return description + translate.getScoreNamePlural(this.firstScoreConfig);
    // }

    // aScoreIsInvalid() {
    //     return this.scoreControls.some(scoreControl => !this.isScoreValid(scoreControl.getScore()));
    // }

    // isScoreValid(score: GameScoreHomeAway): boolean {
    //     return score.getHome() >= 0 && score.getAway() >= 0;
    // }

    // isScoreEqual(score: GameScoreHomeAway): boolean {
    //     return score.getHome() === score.getAway() && (this.firstScoreConfig !== this.firstScoreConfig.getCalculate());
    // }

    protected initGame() {
        const roundNumber = this.game.getRound().getNumber();
        if (this.nextRoundNumberBegun(roundNumber)) {
            this.setAlert('warning', 'het aanpassen van de score kan gevolgen hebben voor de al begonnen volgende ronde');
        }
        this.planningConfig = roundNumber.getValidPlanningConfig();
        this.firstScoreConfig = this.game.getScoreConfig();

        this.firstScoreConfig = this.game.getScoreConfig();
        //     this.form.controls.played.setValue(this.game.getState() === State.Finished);
        //     this.form.controls.extratime.setValue(this.game.getFinalPhase() === Game.Phase_ExtraTime);
        if (this.firstScoreConfig !== this.firstScoreConfig.getCalculate()) {
            this.calculateScoreControl = new AgainstScoreFormControl(this.firstScoreConfig.getCalculate(), 0, 0, true);
        }
        this.initScoreControls();
        //     this.updateCalculateScoreControl();
        //     this.enablePlayedAtFirstChange = this.game.getScores().length === 0 && this.game.getState() !== State.Finished;

        this.form.controls.played.setValue(this.game.getState() === State.Finished);
    }

    protected nextRoundNumberBegun(roundNumber: RoundNumber): boolean {
        if (!roundNumber.hasNext()) {
            return false;
        }
        if (roundNumber.getNext().hasBegun()) {
            return true;
        }
        return this.nextRoundNumberBegun(roundNumber.getNext());
    }

    protected getGameById(id: number, round: Round): AgainstGame {
        if (round === undefined) {
            return undefined;
        }
        let game = round.getGames().find((gameIt: AgainstGame | TogetherGame) => gameIt.getId() === id);
        if (game !== undefined) {
            return <AgainstGame>game;
        }
        round.getChildren().some(child => {
            game = this.getGameById(id, child);
            return (game !== undefined);
        });
        return <AgainstGame>game;
    }

    // protected initScores(game?: Game) {
    //     this.scoreControls = [];
    //     if (game !== undefined) {
    //         game.getScores().forEach(score => {
    //             this.addScoreControl(score.getHome(), score.getAway());
    //         });
    //     }
    //     if (this.scoreControls.length === 0) {
    //         this.scoreControls.push(new HomeAwayFormControl(0, 0));
    //     }
    // }

    // protected updateCalculateScoreControl() {
    //     if (this.firstScoreConfig === this.firstScoreConfig.getCalculate()) {
    //         return;
    //     }
    //     this.calculateScoreControl.home.setValue(0);
    //     this.calculateScoreControl.away.setValue(0);
    //     this.scoreControls.forEach(scoreControl => {
    //         if (this.isScoreValid(scoreControl.getScore()) === false) {
    //             return;
    //         }
    //         if (scoreControl.home.value > scoreControl.away.value) {
    //             this.calculateScoreControl.home.setValue(this.calculateScoreControl.home.value + 1);
    //         } else if (scoreControl.home.value < scoreControl.away.value) {
    //             this.calculateScoreControl.away.setValue(this.calculateScoreControl.away.value + 1);
    //         }
    //     });
    // }

    // calculateAndInputScoreDiffers(): boolean {
    //     return this.firstScoreConfig !== this.firstScoreConfig.getCalculate();
    // }

    protected getPhase(): number {
        if (this.form.value['extratime']) {
            return Game.Phase_ExtraTime;
        }
        if (this.form.value['played']) {
            return Game.Phase_RegularTime;
        }
        return 0;
    }

    postScoreChanged() {
        this.warningsForEqualQualifiers = this.equalQualifiersChecker.getWarnings();
    }

    formToJson(): JsonAgainstGame {
        const jsonGame = this.mapper.toJsonAgainst(this.game);;
        jsonGame.scores = [];
        this.scoreControls.forEach(scoreControl => {
            if (scoreControl.isScoreValid() === false) {
                return;
            }
            jsonGame.scores.push({
                id: 0,
                home: scoreControl.home.value,
                away: scoreControl.away.value,
                phase: this.getPhase(),
                number: jsonGame.scores.length + 1
            });
        });
        jsonGame.state = this.form.controls.played.value === true ? State.Finished : State.Created;
        return jsonGame;
    }


    // getCalculateScoreUnitName(game: Game): string {
    //     const calculateScore = game.getScoreConfig().getCalculate();
    //     const translateService = new TranslateService();
    //     return translateService.getScoreNameSingular(calculateScore);
    // }

    save(): boolean {
        this.processing = true;
        this.setAlert('info', 'de wedstrijd wordt opgeslagen');

        const jsonGame = this.formToJson();
        this.gameRepository.editObject(jsonGame, this.game, this.game.getPoule(), this.tournament)
            .subscribe(
                /* happy path */ gameRes => {
                    this.navigateBack();
                },
             /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
            );
        return false;
    }

    // protected hasScoreChanges(originalGameScores: GameScoreHomeAway[], homeAwayControls: HomeAwayFormControl[]): boolean {
    //     if (originalGameScores.length !== homeAwayControls.length || originalGameScores.length === 0) {
    //         return true;
    //     }
    //     const originalGameScoresTmp = originalGameScores.slice();
    //     homeAwayControls.forEach(homeAwayControl => {
    //         const newHomeAwayScore = homeAwayControl.getScore();
    //         const originalGameScoreTmp = originalGameScoresTmp.find(originalGameScore => {
    //             return originalGameScore.getHome() === newHomeAwayScore.getHome()
    //                 && originalGameScore.getAway() === newHomeAwayScore.getAway();
    //         });
    //         if (originalGameScoreTmp === undefined) {
    //             return;
    //         }
    //         const index = originalGameScoresTmp.indexOf(originalGameScoreTmp);
    //         if (index > -1) {
    //             originalGameScoresTmp.splice(index, 1);
    //         }
    //     });
    //     return originalGameScoresTmp.length > 0;
    // }

    navigateBack() {
        this.myNavigation.back();
    }
}

class EqualQualifiersChecker {

    private rankingService: RankingService;

    constructor(
        private game: Game,
        private nameService: NameService,
    ) {
        const roundNumber = game.getRound().getNumber();
        const gameMode = roundNumber.getValidPlanningConfig().getGameMode();
        this.rankingService = new RankingService(gameMode, roundNumber.getCompetition().getRankingRuleSet());
    }

    getWarnings(): string[] {
        const poule = this.game.getPoule();
        if (poule.getState() !== State.Finished) {
            return [];
        }
        const round = poule.getRound();

        const pouleRankingItems = this.rankingService.getItemsForPoule(this.game.getPoule());
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
                const rankedItems = this.rankingService.getItemsForHorizontalPoule(horizontalPoule);
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
        if (multipleRule.getWinnersOrLosers() === QualifyGroup.LOSERS) {
            rankingItems = this.reverseRanking(rankingItems);
        }
        const equalItemsPerRank = this.getEqualRankedItems(rankingItems);
        const nrToQualify = multipleRule.getToPlaces().length;
        return equalItemsPerRank.filter(equalItems => {
            const equalRank = equalItems[0].getRank();
            const nrToQualifyTmp = nrToQualify - (equalRank - 1);
            return nrToQualifyTmp > 0 && equalItems.length > nrToQualifyTmp;
        });
    }

    protected reverseRanking(rankingItems: RankedRoundItem[]): RankedRoundItem[] {
        const nrOfItems = rankingItems.length;
        const reversedRankingItems = [];
        rankingItems.forEach(rankingItem => {
            const uniqueRank = (nrOfItems + 1) - rankingItem.getUniqueRank();
            const nrOfEqualRank = this.rankingService.getItemsByRank(rankingItems, rankingItem.getRank()).length;
            const rank = (nrOfItems + 1) - (rankingItem.getRank() + (nrOfEqualRank - 1));
            reversedRankingItems.push(new RankedRoundItem(rankingItem.getUnranked(), uniqueRank, rank));
        });
        reversedRankingItems.sort((itemA, itemB) => itemA.getUniqueRank() - itemB.getUniqueRank());
        return reversedRankingItems;
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
            const equalItemsTmp = this.rankingService.getItemsByRank(rankingItems, rank);
            if (equalItemsTmp.length > 1) {
                equalItems.push(equalItemsTmp);
            }
        }
        return equalItems;
    }
}

class AgainstScoreFormControl {
    home: FormControl;
    away: FormControl;

    constructor(
        private scoreConfig: ScoreConfig,
        home: number,
        away: number,
        disabled?: boolean
    ) {
        this.home = new FormControl({ value: home, disabled: disabled === true });
        this.away = new FormControl({ value: away, disabled: disabled === true });
    }

    getScore(): AgainstScoreHelper {
        return new AgainstScoreHelper(this.home.value, this.away.value);
    }

    isScoreValid(): boolean {
        return this.getScore().getHome() >= 0 && this.getScore().getAway() >= 0;
    }

    getValidateClass(): string {

        if (this.scoreConfig.getDirection() !== ScoreConfig.UPWARDS || this.scoreConfig.getMaximum() === 0) {
            return 'is-valid';
        }
        const score = this.getScore();
        if ((score.getHome() === this.scoreConfig.getMaximum() && score.getAway() < score.getHome())
            || (score.getAway() === this.scoreConfig.getMaximum() && score.getHome() < score.getAway())
        ) {
            return 'is-valid';
        }
        return 'is-warning';
    }
}