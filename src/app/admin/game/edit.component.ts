import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Game,
    GameScore,
    GameScoreHomeAway,
    INewQualifier,
    NameService,
    Place,
    Poule,
    QualifyRuleMultiple,
    QualifyService,
    RankedRoundItem,
    RankingService,
    Round,
    SportScoreConfig,
    SportScoreConfigService,
    State,
    QualifyGroup,
    RoundNumber,
} from 'ngx-sport';
import { forkJoin, Observable, of } from 'rxjs';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { Role } from '../../lib/role';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TranslateService } from '../../lib/translate';
import { TournamentComponent } from '../../shared/tournament/component';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { PlaceRepository } from '../../lib/ngx-sport/place/repository';
import { GameRepository } from '../../lib/ngx-sport/game/repository';
import { TournamentUser } from '../../lib/tournament/user';
import { map } from 'rxjs/operators';

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

@Component({
    selector: 'app-tournament-game-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class GameEditComponent extends TournamentComponent implements OnInit {
    game: Game;
    sportScoreConfigService: SportScoreConfigService;
    form: FormGroup;
    scoreControls: HomeAwayFormControl[] = [];
    calculateScoreControl: HomeAwayFormControl;
    hasAuthorization: boolean = false;
    private enablePlayedAtFirstChange;
    // private originalPouleState: number;
    private rankingService: RankingService;
    private firstScoreConfig: SportScoreConfig;

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
        // this.originalPouleState = State.Created;
        this.sportScoreConfigService = new SportScoreConfigService();
        this.form = fb.group({
            played: [''],
            extratime: ['']
        });
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => {
                this.game = this.getGameById(+params.gameId, this.structure.getRootRound());
                if (this.game === undefined) {
                    this.setAlert('danger', 'de wedstrijd kan niet gevonden worden');
                    this.processing = false;
                    return;
                }

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

    get GameHOME(): boolean { return Game.HOME; }
    get GameAWAY(): boolean { return Game.AWAY; }

    getCalculateScoreDescription() {
        const scoreConfig = this.firstScoreConfig.getCalculate();
        let description = '';
        if (scoreConfig.getDirection() === SportScoreConfig.UPWARDS && scoreConfig.getMaximum() > 0) {
            description = 'eerste bij ' + scoreConfig.getMaximum() + ' ';
        }
        const translate = new TranslateService();
        return description + translate.getScoreNamePlural(scoreConfig);
    }

    getFieldDescription(): string {
        const translate = new TranslateService();
        return translate.getFieldNameSingular(this.firstScoreConfig.getSport());
    }

    getInputScoreDescription() {
        let description = '';
        if (this.firstScoreConfig.getDirection() === SportScoreConfig.UPWARDS && this.firstScoreConfig.getMaximum() > 0) {
            description = 'eerste bij ' + this.firstScoreConfig.getMaximum() + ' ';
        }
        const translate = new TranslateService();
        return description + translate.getScoreNamePlural(this.firstScoreConfig);
    }

    aScoreIsInvalid() {
        return this.scoreControls.some(scoreControl => !this.isScoreValid(scoreControl.getScore()));
    }

    isScoreValid(score: GameScoreHomeAway): boolean {
        return score.getHome() >= 0 && score.getAway() >= 0;
    }

    isScoreEqual(score: GameScoreHomeAway): boolean {
        return score.getHome() === score.getAway() && (this.firstScoreConfig !== this.firstScoreConfig.getCalculate());
    }

    getCalculateClass() {
        const scoreConfig = this.game.getSportScoreConfig().getCalculate();
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
        const scoreConfig = this.firstScoreConfig;
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

    protected initGame() {
        this.firstScoreConfig = this.game.getSportScoreConfig();
        // const date = this.game.getStartDateTime();

        this.form.controls.played.setValue(this.game.getState() === State.Finished);
        this.form.controls.extratime.setValue(this.game.getFinalPhase() === Game.PHASE_EXTRATIME);

        if (this.firstScoreConfig !== this.firstScoreConfig.getCalculate()) {
            this.calculateScoreControl = new HomeAwayFormControl(0, 0, true);
        }

        if (this.scoreChangesNextRoundNumber(this.game.getRound().getNumber())) {
            this.setAlert('warning', 'het aanpassen van de score kan gevolgen hebben voor de al begonnen volgende ronde');
        }

        this.initScores(this.game);
        this.updateCalculateScoreControl();

        this.enablePlayedAtFirstChange = this.game.getScores().length === 0 && this.game.getState() !== State.Finished;

        // if (date !== undefined) {
        //     this.model.startdate = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
        //     this.model.starttime = { hour: date.getHours(), minute: date.getMinutes() };
        // }        
    }

    protected scoreChangesNextRoundNumber(roundNumber: RoundNumber): boolean {
        if (!roundNumber.hasNext()) {
            return false;
        }
        if (roundNumber.getNext().hasBegun()) {
            return true;
        }
        return this.scoreChangesNextRoundNumber(roundNumber.getNext());
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
        if (this.firstScoreConfig === this.firstScoreConfig.getCalculate()) {
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

    calculateAndInputScoreDiffers(): boolean {
        return this.firstScoreConfig !== this.firstScoreConfig.getCalculate();
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
                new GameScore(this.game, +scoreHomeAway.getHome(), +scoreHomeAway.getAway(), this.getPhase(), ++counter);
            });
        }
    }

    protected getPhase(): number {
        if (this.form.value['extratime']) {
            return Game.PHASE_EXTRATIME;
        }
        if (this.form.value['played']) {
            return Game.PHASE_REGULARTIME;
        }
        return 0;
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
        this.rankingService = new RankingService(round, this.competition.getRuleSet());

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

    getCalculateScoreUnitName(game: Game): string {
        const calculateScore = game.getSportScoreConfig().getCalculate();
        const translateService = new TranslateService();
        return translateService.getScoreNameSingular(calculateScore);
    }

    save(): boolean {
        this.processing = true;
        this.setAlert('info', 'de wedstrijd wordt opgeslagen');
        if (this.game.getState() === State.Finished && this.scoreControls.length === 0) {
            this.scoreControls.push(new HomeAwayFormControl(0, 0));
        }
        const state = this.form.controls.played.value === true ? State.Finished : State.Created;
        this.game.setState(state);
        this.syncGameScores(false);

        this.gameRepository.editObject(this.game, this.game.getPoule(), this.tournament)
            .subscribe(
                /* happy path */ gameRes => {
                    this.navigateBack();
                },
             /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
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

    navigateBack() {
        this.myNavigation.back();
    }
}
