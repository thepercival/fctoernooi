import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    TogetherGame,
    GameMapper,
    JsonTogetherGame,
    TogetherGamePlace,
    FieldMapper,
    RefereeMapper,
    PlaceMapper,
    AgainstGamePlace,
    GameState,
} from 'ngx-sport';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { GameRepository } from '../../lib/ngx-sport/game/repository';
import { TranslateService } from '../../lib/translate';
import { JsonTogetherGamePlace } from 'ngx-sport/src/game/place/together/json';
import { GameEditComponent } from './edit.component';
import { IAlertType } from '../../shared/common/alert';

@Component({
    selector: 'app-tournament-togethergame-edit',
    templateUrl: './edittogether.component.html',
    styleUrls: ['./edittogether.component.scss']
})
export class GameTogetherEditComponent extends GameEditComponent implements OnInit {
    public game!: TogetherGame;
    // public scoreConfigService: ScoreConfigService;
    // public hasAuthorization: boolean = false;
    // // private originalPouleState: number;    
    // public planningConfig!: PlanningConfig;
    // public firstScoreConfig!: ScoreConfig;
    // public nameService!: NameService;
    // public warningsForEqualQualifiers: string[] = [];
    // private equalQualifiersChecker!: EqualQualifiersChecker;
    // public pristineScore!: boolean;
    public allScoresValid = true;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        authService: AuthService,
        gameRepository: GameRepository,
        mapper: GameMapper,
        fieldMapper: FieldMapper,
        refereeMapper: RefereeMapper,
        placeMapper: PlaceMapper,
        translate: TranslateService,
        myNavigation: MyNavigation,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, structureRepository, authService, gameRepository,
            mapper, fieldMapper, refereeMapper, placeMapper, translate, myNavigation, fb);
        // this.originalPouleState = State.Created;        
        this.form.addControl('gamePlaces', new FormGroup({}));
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => {
                super.ngOnInitBase(+params.gameId);
                this.initForm();
            });
        });
    }

    protected initForm() {
        const roundNumber = this.game.getRound().getNumber();
        if (this.nextRoundNumberBegun(roundNumber)) {
            this.setAlert(IAlertType.Warning, 'het aanpassen van de score kan gevolgen hebben voor de al begonnen volgende ronde');
        }
        this.planningConfig = roundNumber.getValidPlanningConfig();
        this.firstScoreConfig = this.game.getScoreConfig();
        this.game.getTogetherPlaces().forEach((gamePlace: TogetherGamePlace) => {
            this.getFormGroupGamePlaces().addControl('' + gamePlace.getId(), new FormGroup({}));
        });
        this.form.controls.played.setValue(this.game.getState() === GameState.Finished);
        //     this.form.controls.extension.setValue(this.game.getFinalPhase() === Game.Phase_ExtraTime);
        this.pristineScore = this.game.getTogetherPlaces().every((gamePlace: TogetherGamePlace) => {
            return gamePlace.getScores().length === 0;
        });
    }

    protected resetScoreControlValues(): void {

    }

    getFormGroupGamePlace(gamePlaceId: string | number): FormGroup {
        return <FormGroup>this.getFormGroupGamePlaces().controls[gamePlaceId];
    }

    getFormGroupGamePlaces(): FormGroup {
        return <FormGroup>this.form.controls.gamePlaces;
    }

    getGame(): TogetherGame {
        return <TogetherGame>this.game;
    }

    // // getFieldDescription(): string {
    // //     return this.translate.getFieldNameSingular(this.firstScoreConfig.getSport());
    // // }

    postScoreControlUpdate() {
        this.allScoresValid = this.areAllScoresValid();
        if (!this.allScoresValid) {
            return;
        }
        if (this.pristineScore) {
            this.form.controls.played.setValue(true);
        }
        this.pristineScore = false;
        this.updateWarningsForEqualQualifiers(this.formToJson());
    }



    setPlayed(played: boolean) {
        if (played === false) {
            // this.form.controls.extension.setValue(false);
            this.game.getPlaces().forEach((gamePlace: AgainstGamePlace | TogetherGamePlace) => {
                const scores = <FormArray>this.getFormGroupGamePlace(gamePlace.getId()).controls.scores;
                for (let scoreControl of scores.controls) {
                    scoreControl.setValue(0);
                }
            });

            // this.updateCalculateScoreControl();
        } // else if (this.game.getScores().length === 0) {
        // this.updateCalculateScoreControl();
        // }
        this.updateWarningsForEqualQualifiers(this.formToJson());
    }

    // // getCalculateScoreDescription() {
    // //     const scoreConfig = this.firstScoreConfig.getCalculate();
    // //     let description = '';
    // //     if (scoreConfig.getDirection() === ScoreConfig.UPWARDS && scoreConfig.getMaximum() > 0) {
    // //         description = 'eerste bij ' + scoreConfig.getMaximum() + ' ';
    // //     }
    // //     return description + this.translate.getScoreNamePlural(scoreConfig);
    // // }

    // getFieldDescription(): string {
    //     return this.translate.getFieldNameSingular(this.firstScoreConfig.getSport());
    // }



    // // isScoreEqual(score: GameScoreHomeAway): boolean {
    // //     return score.getHome() === score.getAway() && (this.firstScoreConfig !== this.firstScoreConfig.getCalculate());
    // // }



    // protected nextRoundNumberBegun(roundNumber: RoundNumber): boolean {
    //     const nextRoundNumber = roundNumber.getNext();
    //     if (nextRoundNumber === undefined) {
    //         return false;
    //     }
    //     return nextRoundNumber.hasBegun() || this.nextRoundNumberBegun(nextRoundNumber);
    // }

    // protected getGameById(id: number, round: Round): TogetherGame | undefined {
    //     if (round === undefined) {
    //         return undefined;
    //     }
    //     let game = round.getGames().find((gameIt: AgainstGame | TogetherGame) => gameIt.getId() === id);
    //     if (game !== undefined) {
    //         return <TogetherGame>game;
    //     }
    //     round.getChildren().some(child => {
    //         game = this.getGameById(id, child);
    //         return (game !== undefined);
    //     });
    //     if (game !== undefined) {
    //         return <TogetherGame>game;
    //     }
    //     return undefined;
    // }

    formToJson(): JsonTogetherGame {
        const jsonGame = this.mapper.toJsonTogether(this.game);
        this.formToJsonHelper(jsonGame);
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
                    phase: this.getPhase(this.form),
                    number: jsonGamePlace.scores.length + 1
                });
            }
        });
        jsonGame.state = this.form.controls.played.value === true ? GameState.Finished : GameState.Created;
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

    save(): boolean {
        return this.saveHelper(this.formToJson());
    }

    // // getCalculateScoreUnitName(game: Game): string {
    // //     const calculateScore = game.getScoreConfig().getCalculate();
    // //     return this.translate.getScoreNameSingular(calculateScore);
    // // }

    // save(): boolean {
    //     this.processing = true;
    //     this.setAlert(IAlertType.Info, 'de wedstrijd wordt opgeslagen');

    //     const jsonGame = this.formToJson();
    //     this.gameRepository.editObject(jsonGame, this.game, this.game.getPoule(), this.tournament)
    //         .subscribe(
    //             /* happy path */ gameRes => {
    //                 this.navigateBack();
    //             },
    //          /* error path */ e => { this.setAlert(IAlertType.Danger, e); this.processing = false; }
    //         );
    //     return false;
    // }

    // // protected hasScoreChanges(originalGameScores: GameScoreHomeAway[], homeAwayControls: HomeAwayFormControl[]): boolean {
    // //     if (originalGameScores.length !== homeAwayControls.length || originalGameScores.length === 0) {
    // //         return true;
    // //     }
    // //     const originalGameScoresTmp = originalGameScores.slice();
    // //     homeAwayControls.forEach(homeAwayControl => {
    // //         const newHomeAwayScore = homeAwayControl.getScore();
    // //         const originalGameScoreTmp = originalGameScoresTmp.find(originalGameScore => {
    // //             return originalGameScore.getHome() === newHomeAwayScore.getHome()
    // //                 && originalGameScore.getAway() === newHomeAwayScore.getAway();
    // //         });
    // //         if (originalGameScoreTmp === undefined) {
    // //             return;
    // //         }
    // //         const index = originalGameScoresTmp.indexOf(originalGameScoreTmp);
    // //         if (index > -1) {
    // //             originalGameScoresTmp.splice(index, 1);
    // //         }
    // //     });
    // //     return originalGameScoresTmp.length > 0;
    // // }

    // navigateBack() {
    //     this.myNavigation.back();
    // }
}