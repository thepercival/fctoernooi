import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Round,
    RoundNumber,
    ScoreConfigService,
    ScoreConfig,
    AgainstGame,
    PlanningConfig,
    TogetherGame,
    GameMapper,
    JsonAgainstGame,
    AgainstScoreHelper,
    JsonTogetherGame,
    PlanningEditMode,
    FieldMapper,
    RefereeMapper,
    PlaceMapper,
    Referee,
    Place,
    GamePhase,
    Cumulative,
    Category,
    StructureNameService,
    StartLocationMap,
} from 'ngx-sport';
import { Observable, of } from 'rxjs';

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
import { EqualQualifiersChecker } from '../../lib/ngx-sport/ranking/equalQualifiersChecker';
import { IAlertType } from '../../shared/common/alert';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FavoritesRepository } from '../../lib/favorites/repository';

export class GameEditComponent extends TournamentComponent {
    public game: AgainstGame | TogetherGame | undefined;
    public scoreConfigService: ScoreConfigService;
    public hasAuthorization: boolean = false;
    // private originalPouleState: number;    
    public planningConfig!: PlanningConfig;
    public firstScoreConfig!: ScoreConfig;
    public structureNameService!: StructureNameService;
    public warningsForEqualQualifiers: string[] = [];
    private equalQualifiersChecker!: EqualQualifiersChecker;
    public pristineScore = true;
    public form: UntypedFormGroup;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        private authService: AuthService,
        private gameRepository: GameRepository,
        protected mapper: GameMapper,
        protected fieldMapper: FieldMapper,
        protected refereeMapper: RefereeMapper,
        protected placeMapper: PlaceMapper,
        private translate: TranslateService,
        private myNavigation: MyNavigation,
        fb: UntypedFormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository);
        // this.originalPouleState = State.Created;
        this.scoreConfigService = new ScoreConfigService();
        this.form = fb.group({
            played: [false],
            base: new UntypedFormGroup({})
        });
    }

    ngOnInitBase(gameId: number) {
        this.structureNameService = new StructureNameService(new StartLocationMap(this.tournament.getCompetitors()));
        const game = this.getGameById(gameId);
        if (game === undefined) {
            this.setAlert(IAlertType.Danger, 'de wedstrijd kan niet gevonden worden');
            this.processing = false;
            return;
        }
        this.game = game;
        const roundNumber = this.game.getRound().getNumber();
        const cumulative = roundNumber.getCompetition().hasMultipleSports() ? Cumulative.byPerformance : Cumulative.byRank;
        this.equalQualifiersChecker = new EqualQualifiersChecker(this.game, this.structureNameService, this.mapper, cumulative);

        if (this.nextRoundNumberBegun(roundNumber)) {
            this.setAlert(IAlertType.Warning, 'het aanpassen van de score kan gevolgen hebben voor de al begonnen volgende ronde');
        }
        this.planningConfig = roundNumber.getValidPlanningConfig();
        this.firstScoreConfig = this.game.getScoreConfig();

        const loggedInUserId = this.authService.getLoggedInUserId();
        const tournamentUser = loggedInUserId ? this.tournament.getUser(loggedInUserId) : undefined;
        this.getAuthorization(tournamentUser).subscribe(
                /* happy path */ hasAuthorization => {
                this.hasAuthorization = hasAuthorization;
                if (!this.hasAuthorization) {
                    this.setAlert(IAlertType.Danger, 'je bent geen scheidsrechter voor deze wedstrijd of uitslagen-invoerder voor dit toernooi, je emailadres moet door de beheerder gekoppeld zijn');
                }
                this.processing = false;
            }
        );
    }

    getBaseFormGroup(): UntypedFormGroup {
        return <UntypedFormGroup>this.form.controls.base;
    }

    protected getAuthorization(tournamentUser?: TournamentUser): Observable<boolean> {
        if (!tournamentUser || !this.game) {
            return of(false);
        }
        if (tournamentUser.hasRoles(Role.GameResultAdmin)) {
            return of(true);
        }
        const referee = this.game.getReferee();
        if (!tournamentUser.hasRoles(Role.Referee) || !referee) {
            return of(false);
        }
        return this.tournamentRepository.getUserRefereeId(this.tournament).pipe(
            map((userRefereeId: number | string) => referee.getId() === userRefereeId)
        );
    }

    manualEditMode(): boolean {
        return this.planningConfig.getEditMode() === PlanningEditMode.Manual;
    }

    getCalculateScoreDescription() {
        const scoreConfig = this.firstScoreConfig.getCalculate();
        let description = '';
        if (scoreConfig.getDirection() === ScoreConfig.UPWARDS && scoreConfig.getMaximum() > 0) {
            description = 'eerste bij ' + scoreConfig.getMaximum() + ' ';
        }
        return description + this.translate.getScoreNamePlural(scoreConfig);
    }

    getInputScoreDescription() {
        let description = '';
        if (this.firstScoreConfig.getDirection() === ScoreConfig.UPWARDS && this.firstScoreConfig.getMaximum() > 0) {
            description = 'eerste bij ' + this.firstScoreConfig.getMaximum() + ' ';
        }
        return description + this.translate.getScoreNamePlural(this.firstScoreConfig);
    }

    updateWarningsForEqualQualifiers(jsonGame: JsonAgainstGame | JsonTogetherGame) {
        this.warningsForEqualQualifiers = this.equalQualifiersChecker.getWarnings(jsonGame);
    }

    getCalculateScoreUnitName(): string {
        const calculateScore = this.firstScoreConfig.getCalculate();
        return this.translate.getScoreNameSingular(calculateScore);
    }

    // getCalculateScoreDescription() {
    //     const scoreConfig = this.firstScoreConfig.getCalculate();
    //     let description = '';
    //     if (scoreConfig.getDirection() === ScoreConfig.UPWARDS && scoreConfig.getMaximum() > 0) {
    //         description = 'eerste bij ' + scoreConfig.getMaximum() + ' ';
    //     }
    //     return description + this.translate.getScoreNamePlural(scoreConfig);
    // }

    // getFieldDescription(): string {
    //     return this.translate.getFieldNameSingular(this.firstScoreConfig.getSport());
    // }

    // getInputScoreDescription() {
    //     let description = '';
    //     if (this.firstScoreConfig.getDirection() === ScoreConfig.UPWARDS && this.firstScoreConfig.getMaximum() > 0) {
    //         description = 'eerste bij ' + this.firstScoreConfig.getMaximum() + ' ';
    //     }
    //     return description + this.translate.getScoreNamePlural(this.firstScoreConfig);
    // }

    // isScoreEqual(score: GameScoreHomeAway): boolean {
    //     return score.getHome() === score.getAway() && (this.firstScoreConfig !== this.firstScoreConfig.getCalculate());
    // }

    protected nextRoundNumberBegun(roundNumber: RoundNumber): boolean {
        const nextRoundNumber = roundNumber.getNext();
        if (nextRoundNumber === undefined) {
            return false;
        }
        return nextRoundNumber.hasBegun() || this.nextRoundNumberBegun(nextRoundNumber);
    }

    protected getGameById(id: number): AgainstGame | TogetherGame | undefined {
        let game;
        this.structure.getCategories().some((category: Category): boolean => {
            game = this.getGameByIdForCategory(id, category.getRootRound());
            return game !== undefined;
        });
        return game;
    }

    protected getGameByIdForCategory(id: number, round: Round): AgainstGame | TogetherGame | undefined {
        if (round === undefined) {
            return undefined;
        }
        let game = round.getGames().find((gameIt: AgainstGame | TogetherGame) => gameIt.getId() === id);
        if (game !== undefined) {
            return game;
        }
        round.getChildren().some((child: Round) => {
            game = this.getGameByIdForCategory(id, child);
            return (game !== undefined);
        });
        if (game !== undefined) {
            return game;
        }
        return undefined;
    }

    formToJsonHelper(jsonGame: JsonAgainstGame | JsonTogetherGame): void {
        if (!this.manualEditMode()) {
            return;
        }
        const dateTime = this.getDate(this.getBaseFormGroup().controls.date, this.getBaseFormGroup().controls.time);
        jsonGame.startDateTime = dateTime.toISOString();
        jsonGame.field = this.fieldMapper.toJson(this.getBaseFormGroup().controls.field.value);
        const referee: Referee | undefined = this.getBaseFormGroup().controls.referee.value;
        jsonGame.referee = referee instanceof Referee ? this.refereeMapper.toJson(referee) : undefined;
        const refereePlace: Place | undefined = this.getBaseFormGroup().controls.refereePlace.value;
        jsonGame.refereeStructureLocation = refereePlace instanceof Place ? refereePlace.getStructureLocation() : undefined;
    }

    getDate(dateFormControl: AbstractControl, timeFormControl: AbstractControl): Date {
        return new Date(
            dateFormControl.value.year,
            dateFormControl.value.month - 1,
            dateFormControl.value.day,
            timeFormControl.value.hour,
            timeFormControl.value.minute
        );
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

    protected getPhase(form: UntypedFormGroup): number {
        if (form.value['extratime'] === true) {
            return GamePhase.ExtraTime;
        }
        if (form.value['played'] === true) {
            return GamePhase.RegularTime;
        }
        return 0;
    }




    // getCalculateScoreUnitName(game: Game): string {
    //     const calculateScore = game.getScoreConfig().getCalculate();
    //     return this.translate.getScoreNameSingular(calculateScore);
    // }

    saveHelper(jsonGame: JsonAgainstGame | JsonTogetherGame): boolean {
        if (this.game === undefined) {
            return false;
        }
        this.processing = true;
        this.setAlert(IAlertType.Info, 'de wedstrijd wordt opgeslagen');

        this.gameRepository.editObject(jsonGame, this.game, this.game.getPoule(), this.tournament)
            .subscribe(
                {
                    next: (gameRes) => {
                        this.navigateBack();
                    },
                    error: (e) => {
                        this.setAlert(IAlertType.Danger, e); this.processing = false;
                    }
                }
            );
        return false;
    }

    remove() {
        if (this.game === undefined) {
            return;
        }
        if (this.game.getPoule().getNrOfGames() === 1) {
            this.setAlert(IAlertType.Warning, 'de laatste wedstrijd uit de poule kun je niet verwijderen');
            return;
        }
        this.processing = true;
        this.setAlert(IAlertType.Info, 'de wedstrijd wordt verwijderd');

        this.gameRepository.removeObject(this.game, this.game.getPoule(), this.tournament)
            .subscribe({
                next: (results) => {
                    this.navigateBack();
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, 'het opslaan is niet gelukt: ' + e); this.processing = false;
                },
                complete: () => this.processing = false
            });
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

class AgainstScoreFormControl {
    home: UntypedFormControl;
    away: UntypedFormControl;

    constructor(
        private scoreConfig: ScoreConfig,
        home: number,
        away: number,
        disabled?: boolean
    ) {
        this.home = new UntypedFormControl({ value: home, disabled: disabled === true });
        this.away = new UntypedFormControl({ value: away, disabled: disabled === true });
    }

    getScore(): AgainstScoreHelper {
        return new AgainstScoreHelper(this.home.value, this.away.value);
    }

    isScoreValid(): boolean {
        return this.getScore().getHome() >= 0 && this.getScore().getAway() >= 0;
    }

    getValidateClass(): string {
        if (!this.isScoreValid()) {
            return 'is-invalid';
        }
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