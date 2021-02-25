import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Game,
    NameService,
    Round,
    State,
    RoundNumber,
    PlaceLocationMap,
    ScoreConfigService,
    ScoreConfig,
    AgainstGame,
    PlanningConfig,
    TogetherGame,
    GameMapper,
    JsonTogetherGame,
    ScoreConfigMapper,
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
import { TogetherGamePlace } from 'ngx-sport/src/game/place/together';
import { EqualQualifiersChecker } from '../../lib/ngx-sport/ranking/equalQualifiersChecker';
import { JsonTogetherGamePlace } from 'ngx-sport/src/game/place/together/json';
import { DateFormatter } from '../../lib/dateFormatter';

@Component({
    selector: 'app-tournament-togethergame-edit',
    templateUrl: './edittogether.component.html',
    styleUrls: ['./edittogether.component.scss']
})
export class GameTogetherEditComponent extends TournamentComponent implements OnInit {
    public game!: TogetherGame;
    public scoreConfigService: ScoreConfigService;
    public form: FormGroup;
    public hasAuthorization: boolean = false;
    // private originalPouleState: number;    
    public planningConfig!: PlanningConfig;
    public firstScoreConfig!: ScoreConfig;
    public nameService!: NameService;
    public warningsForEqualQualifiers: string[] = [];
    private equalQualifiersChecker!: EqualQualifiersChecker;
    public pristineScore!: boolean;
    public allScoresValid = true;

    constructor(
        route: ActivatedRoute,
        router: Router,
        private authService: AuthService,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private gameRepository: GameRepository,
        private mapper: GameMapper,
        public dateFormatter: DateFormatter,
        private myNavigation: MyNavigation,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository);
        // this.originalPouleState = State.Created;
        this.scoreConfigService = new ScoreConfigService();
        this.form = fb.group({
            played: [false],
            gamePlaces: new FormGroup({})
        });
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => {
                this.nameService = new NameService(new PlaceLocationMap(this.tournament.getCompetitors()));
                const game = this.getGameById(+params.gameId, this.structure.getRootRound());
                if (game === undefined) {
                    this.setAlert('danger', 'de wedstrijd kan niet gevonden worden');
                    this.processing = false;
                    return;
                }
                this.game = game;
                this.equalQualifiersChecker = new EqualQualifiersChecker(this.game, this.nameService, this.mapper);
                this.initForm();
                // this.originalPouleState = this.game.getPoule().getState();
                const authUser = this.authService.getUser();
                const tournamentUser = authUser ? this.tournament.getUser(authUser) : undefined;
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

    getFormGroupGamePlaces(): FormGroup {
        return <FormGroup>this.form.controls.gamePlaces;
    }

    getFormGroupGamePlace(gamePlaceId: string | number): FormGroup {
        return <FormGroup>this.getFormGroupGamePlaces().controls[gamePlaceId];
    }

    protected initForm() {
        const roundNumber = this.game.getRound().getNumber();
        if (this.nextRoundNumberBegun(roundNumber)) {
            this.setAlert('warning', 'het aanpassen van de score kan gevolgen hebben voor de al begonnen volgende ronde');
        }
        this.planningConfig = roundNumber.getValidPlanningConfig();
        this.firstScoreConfig = this.game.getScoreConfig();
        this.game.getTogetherPlaces().forEach((gamePlace: TogetherGamePlace) => {
            this.getFormGroupGamePlaces().addControl('' + gamePlace.getId(), new FormGroup({}));
        });
        this.form.controls.played.setValue(this.game.getState() === State.Finished);
        //     this.form.controls.extension.setValue(this.game.getFinalPhase() === Game.Phase_ExtraTime);
        this.pristineScore = this.game.getTogetherPlaces().every((gamePlace: TogetherGamePlace) => {
            return gamePlace.getScores().length === 0;
        });
    }

    protected getAuthorization(tournamentUser?: TournamentUser): Observable<boolean> {
        if (!tournamentUser) {
            return of(false);
        }
        if (tournamentUser.hasRoles(Role.GAMERESULTADMIN)) {
            return of(true);
        }
        const referee = this.game.getReferee();
        if (referee === undefined || !tournamentUser.hasRoles(Role.REFEREE)) {
            return of(false);
        }
        return this.tournamentRepository.getUserRefereeId(this.tournament).pipe(
            map((userRefereeId: number | string) => referee.getId() === userRefereeId)
        );
    }

    // getFieldDescription(): string {
    //     const translate = new TranslateService();
    //     return translate.getFieldNameSingular(this.firstScoreConfig.getSport());
    // }

    postScoreControlUpdate() {
        this.allScoresValid = this.areAllScoresValid();
        if (!this.allScoresValid) {
            return;
        }
        if (this.pristineScore) {
            this.form.controls.played.setValue(true);
        }
        this.pristineScore = false;
        this.warningsForEqualQualifiers = this.equalQualifiersChecker.getWarnings(this.formToJson());
    }



    setPlayed(played: boolean) {
        if (played === false) {
            this.form.controls.extension.setValue(false);
            // this.initScoreControls(true);
            // this.updateCalculateScoreControl();
        } // else if (this.game.getScores().length === 0) {
        // this.updateCalculateScoreControl();
        // }
        this.warningsForEqualQualifiers = this.equalQualifiersChecker.getWarnings(this.formToJson());
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

    protected getGameById(id: number, round: Round): TogetherGame | undefined {
        if (round === undefined) {
            return undefined;
        }
        let game = round.getGames().find((gameIt: AgainstGame | TogetherGame) => gameIt.getId() === id);
        if (game !== undefined) {
            return <TogetherGame>game;
        }
        round.getChildren().some(child => {
            game = this.getGameById(id, child);
            return (game !== undefined);
        });
        if (game !== undefined) {
            return <TogetherGame>game;
        }
        return undefined;
    }

    protected getPhase(): number {
        if (this.form.value['extension']) {
            return Game.Phase_ExtraTime;
        }
        if (this.form.value['played']) {
            return Game.Phase_RegularTime;
        }
        return 0;
    }

    formToJson(): JsonTogetherGame {
        const jsonGame = this.mapper.toJsonTogether(this.game);

        jsonGame.places.forEach((jsonGamePlace: JsonTogetherGamePlace) => {
            jsonGamePlace.scores = [];
            const scores = <FormArray>this.getFormGroupGamePlace(jsonGamePlace.id).controls.scores;
            for (let scoreControl of scores.controls) {
                if (scoreControl.value < 0) {
                    continue;
                }
                jsonGamePlace.scores.push({
                    id: 0,
                    score: scoreControl.value,
                    phase: this.getPhase(),
                    number: jsonGamePlace.scores.length + 1
                });
            }
        });
        jsonGame.state = this.form.controls.played.value === true ? State.Finished : State.Created;
        return jsonGame;
    }

    areAllScoresValid(): boolean {
        return this.game.getTogetherPlaces().every((gamePlace: TogetherGamePlace) => {
            const formGroupGamePlace = this.getFormGroupGamePlace(gamePlace.getId());
            const scores = <FormArray>formGroupGamePlace.controls.scores;
            return scores.controls.every((scoreControl: AbstractControl) => {
                return scoreControl.value >= 0;
            });
        });
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