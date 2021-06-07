import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Game,
    NameService,
    Round,
    State,
    RoundNumber,
    CompetitorMap,
    ScoreConfigService,
    ScoreConfig,
    AgainstGame,
    PlanningConfig,
    TogetherGame,
    GameMapper,
    JsonAgainstGame,
    AgainstScoreHelper,
    FieldMapper,
    RefereeMapper,
    PlaceMapper,
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
import { DateFormatter } from '../../lib/dateFormatter';
import { GameEditComponent } from './edit.component';

@Component({
    selector: 'app-tournament-againstgame-edit',
    templateUrl: './editagainst.component.html',
    styleUrls: ['./editagainst.component.scss']
})
export class GameAgainstEditComponent extends GameEditComponent implements OnInit {

    // public scoreConfigService: ScoreConfigService;

    // public hasAuthorization: boolean = false;
    // // private originalPouleState: number;    
    // public planningConfig!: PlanningConfig;
    // public firstScoreConfig!: ScoreConfig;
    // public nameService!: NameService;
    // public warningsForEqualQualifiers: string[] = [];
    // private equalQualifiersChecker!: EqualQualifiersChecker;
    public calculateScoreControl: AgainstScoreFormControl | undefined;
    public scoreControls: AgainstScoreFormControl[] = [];
    // public pristineScore = true;

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
        this.form.addControl('extension', new FormControl({ value: '' }));
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => {
                super.ngOnInitBase(+params.gameId);
                this.initForm();
            });
        });
    }

    getGame(): AgainstGame {
        return <AgainstGame>this.game;
    }

    protected initForm() {
        if (this.firstScoreConfig !== this.firstScoreConfig.getCalculate()) {
            this.calculateScoreControl = new AgainstScoreFormControl(this.firstScoreConfig.getCalculate(), 0, 0, true);
        }
        this.form.controls.played.setValue(this.game.getState() === State.Finished);
        //     this.form.controls.extension.setValue(this.game.getFinalPhase() === Game.Phase_ExtraTime);
        this.initScoreControls();
    }

    //     getCalculateScoreDescription() {
    //         const scoreConfig = this.firstScoreConfig.getCalculate();
    //         let description = '';
    //         if (scoreConfig.getDirection() === ScoreConfig.UPWARDS && scoreConfig.getMaximum() > 0) {
    //             description = 'eerste bij ' + scoreConfig.getMaximum() + ' ';
    //         }
    //         return description + this.translate.getScoreNamePlural(scoreConfig);
    //     }

    //     getInputScoreDescription() {
    //         let description = '';
    //         if (this.firstScoreConfig.getDirection() === ScoreConfig.UPWARDS && this.firstScoreConfig.getMaximum() > 0) {
    //             description = 'eerste bij ' + this.firstScoreConfig.getMaximum() + ' ';
    //         }
    //         return description + this.translate.getScoreNamePlural(this.firstScoreConfig);
    //     }

    //     aScoreIsInvalid() {
    //         return this.scoreControls.some(scoreControl => !scoreControl.isScoreValid());
    //     }

    protected initScoreControls() {
        this.scoreControls = [];
        this.getGame().getScores().forEach(score => {
            this.addScoreControl(score.getHome(), score.getAway());
        });
        if (this.scoreControls.length === 0) {
            this.scoreControls.push(new AgainstScoreFormControl(this.firstScoreConfig, 0, 0));
        }
    }

    aScoreIsInvalid() {
        return this.scoreControls.some(scoreControl => !scoreControl.isScoreValid());
    }



    protected resetScoreControls() {
        this.scoreControls = [];
        if (this.scoreControls.length === 0) {
            this.scoreControls.push(new AgainstScoreFormControl(this.firstScoreConfig, 0, 0));
        }
    }

    protected updateCalculateScoreControl() {
        if (this.calculateScoreControl === undefined) {
            return;
        }
        this.calculateScoreControl.home.setValue(0);
        this.calculateScoreControl.away.setValue(0);
        this.scoreControls.forEach(scoreControl => {
            if (!this.calculateScoreControl || scoreControl.isScoreValid() === false) {
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

    addScoreControl(home: number, away: number) {
        this.scoreControls.push(new AgainstScoreFormControl(this.firstScoreConfig, home, away));
        this.postScoreControlUpdate();
    }

    removeScoreControl() {
        this.scoreControls.pop();
        this.updateCalculateScoreControl();
    }

    setExtension(extension: boolean) {
        if (this.getGame().getScores().length === 0) {
            this.updateCalculateScoreControl();
        }
        super.updateWarningsForEqualQualifiers(this.formToJson());
    }

    setPlayed(played: boolean) {
        if (played === false) {
            this.form.controls.extension.setValue(false);
            this.resetScoreControls();
            this.updateCalculateScoreControl();
        } else if (this.getGame().getScores().length === 0) {
            this.updateCalculateScoreControl();
        }
        super.updateWarningsForEqualQualifiers(this.formToJson());
    }

    allScoresAreInvalid(): boolean {
        return this.scoreControls.every((scoreControl: AgainstScoreFormControl) => !scoreControl.isScoreValid());
    }

    formToJson(): JsonAgainstGame {
        const jsonGame = this.mapper.toJsonAgainst(this.getGame());;
        this.formToJsonHelper(jsonGame);
        jsonGame.scores = [];
        this.scoreControls.forEach(scoreControl => {
            if (scoreControl.isScoreValid() === false) {
                return;
            }
            jsonGame.scores.push({
                id: 0,
                home: scoreControl.home.value,
                away: scoreControl.away.value,
                phase: this.getPhase(this.form),
                number: jsonGame.scores.length + 1
            });
        });
        jsonGame.state = this.form.controls.played.value === true ? State.Finished : State.Created;
        return jsonGame;
    }

    save(): boolean {
        return this.saveHelper(this.formToJson());
    }

    //     protected initScoreControls() {
    //         this.scoreControls = [];
    //         this.game.getScores().forEach(score => {
    //             this.addScoreControl(score.getHome(), score.getAway());
    //         });
    //         if (this.scoreControls.length === 0) {
    //             this.scoreControls.push(new AgainstScoreFormControl(this.firstScoreConfig, 0, 0));
    //         }
    //     }

    //     protected resetScoreControls() {
    //         this.scoreControls = [];
    //         if (this.scoreControls.length === 0) {
    //             this.scoreControls.push(new AgainstScoreFormControl(this.firstScoreConfig, 0, 0));
    //         }
    //     }

    //     protected updateCalculateScoreControl() {
    //         if (this.calculateScoreControl === undefined) {
    //             return;
    //         }
    //         this.calculateScoreControl.home.setValue(0);
    //         this.calculateScoreControl.away.setValue(0);
    //         this.scoreControls.forEach(scoreControl => {
    //             if (!this.calculateScoreControl || scoreControl.isScoreValid() === false) {
    //                 return;
    //             }
    //             if (scoreControl.home.value > scoreControl.away.value) {
    //                 this.calculateScoreControl.home.setValue(this.calculateScoreControl.home.value + 1);
    //             } else if (scoreControl.home.value < scoreControl.away.value) {
    //                 this.calculateScoreControl.away.setValue(this.calculateScoreControl.away.value + 1);
    //             }
    //         });
    //         this.postScoreControlUpdate();
    //     }

    //     postScoreControlUpdate() {
    //         if (this.pristineScore && this.game.getScores().length === 0) {
    //             this.form.controls.played.setValue(true);
    //         }
    //         this.pristineScore = false;
    //         this.warningsForEqualQualifiers = this.equalQualifiersChecker.getWarnings(this.formToJson());
    //     }

    //     allScoresAreInvalid(): boolean {
    //         return this.scoreControls.every((scoreControl: AgainstScoreFormControl) => !scoreControl.isScoreValid());

    //     }

    //     setExtension(extension: boolean) {
    //         if (this.game.getScores().length === 0) {
    //             this.updateCalculateScoreControl();
    //         }
    //         this.warningsForEqualQualifiers = this.equalQualifiersChecker.getWarnings(this.formToJson());
    //     }

    //     addScoreControl(home: number, away: number) {
    //         this.scoreControls.push(new AgainstScoreFormControl(this.firstScoreConfig, home, away));
    //         this.postScoreControlUpdate();
    //     }

    //     removeScoreControl() {
    //         this.scoreControls.pop();
    //         this.updateCalculateScoreControl();
    //     }

    //     setPlayed(played: boolean) {
    //         if (played === false) {
    //             this.form.controls.extension.setValue(false);
    //             this.resetScoreControls();
    //             this.updateCalculateScoreControl();
    //         } else if (this.game.getScores().length === 0) {
    //             this.updateCalculateScoreControl();
    //         }
    //         this.warningsForEqualQualifiers = this.equalQualifiersChecker.getWarnings(this.formToJson());
    //     }

    //     getCalculateScoreUnitName(): string {
    //         const calculateScore = this.firstScoreConfig.getCalculate();
    //         return this.translate.getScoreNameSingular(calculateScore);
    //     }

    //     // getCalculateScoreDescription() {
    //     //     const scoreConfig = this.firstScoreConfig.getCalculate();
    //     //     let description = '';
    //     //     if (scoreConfig.getDirection() === ScoreConfig.UPWARDS && scoreConfig.getMaximum() > 0) {
    //     //         description = 'eerste bij ' + scoreConfig.getMaximum() + ' ';
    //     //     }
    //     //     return description + this.translate.getScoreNamePlural(scoreConfig);
    //     // }



    //     // getInputScoreDescription() {
    //     //     let description = '';
    //     //     if (this.firstScoreConfig.getDirection() === ScoreConfig.UPWARDS && this.firstScoreConfig.getMaximum() > 0) {
    //     //         description = 'eerste bij ' + this.firstScoreConfig.getMaximum() + ' ';
    //     //     }
    //     //     return description + this.translate.getScoreNamePlural(this.firstScoreConfig);
    //     // }

    //     // isScoreEqual(score: GameScoreHomeAway): boolean {
    //     //     return score.getHome() === score.getAway() && (this.firstScoreConfig !== this.firstScoreConfig.getCalculate());
    //     // }

    //     protected nextRoundNumberBegun(roundNumber: RoundNumber): boolean {
    //         const nextRoundNumber = roundNumber.getNext();
    //         if (nextRoundNumber === undefined) {
    //             return false;
    //         }
    //         return nextRoundNumber.hasBegun() || this.nextRoundNumberBegun(nextRoundNumber);
    //     }

    //     protected getGameById(id: number, round: Round): AgainstGame | undefined {
    //         if (round === undefined) {
    //             return undefined;
    //         }
    //         let game = round.getGames().find((gameIt: AgainstGame | TogetherGame) => gameIt.getId() === id);
    //         if (game !== undefined) {
    //             return <AgainstGame>game;
    //         }
    //         round.getChildren().some(child => {
    //             game = this.getGameById(id, child);
    //             return (game !== undefined);
    //         });
    //         if (game !== undefined) {
    //             return <AgainstGame>game;
    //         }
    //         return undefined;
    //     }

    //     // protected initScores(game?: Game) {
    //     //     this.scoreControls = [];
    //     //     if (game !== undefined) {
    //     //         game.getScores().forEach(score => {
    //     //             this.addScoreControl(score.getHome(), score.getAway());
    //     //         });
    //     //     }
    //     //     if (this.scoreControls.length === 0) {
    //     //         this.scoreControls.push(new HomeAwayFormControl(0, 0));
    //     //     }
    //     // }

    postScoreControlUpdate() {
        if (this.pristineScore && this.getGame().getScores().length === 0) {
            this.form.controls.played.setValue(true);
        }
        this.pristineScore = false;
        this.updateWarningsForEqualQualifiers(this.formToJson());
    }

    //     // protected updateCalculateScoreControl() {
    //     //     if (this.firstScoreConfig === this.firstScoreConfig.getCalculate()) {
    //     //         return;
    //     //     }
    //     //     this.calculateScoreControl.home.setValue(0);
    //     //     this.calculateScoreControl.away.setValue(0);
    //     //     this.scoreControls.forEach(scoreControl => {
    //     //         if (this.isScoreValid(scoreControl.getScore()) === false) {
    //     //             return;
    //     //         }
    //     //         if (scoreControl.home.value > scoreControl.away.value) {
    //     //             this.calculateScoreControl.home.setValue(this.calculateScoreControl.home.value + 1);
    //     //         } else if (scoreControl.home.value < scoreControl.away.value) {
    //     //             this.calculateScoreControl.away.setValue(this.calculateScoreControl.away.value + 1);
    //     //         }
    //     //     });
    //     // }

    //     // calculateAndInputScoreDiffers(): boolean {
    //     //     return this.firstScoreConfig !== this.firstScoreConfig.getCalculate();
    //     // }

    //     protected getPhase(): number {
    //         if (this.form.value['extension']) {
    //             return Game.Phase_ExtraTime;
    //         }
    //         if (this.form.value['played']) {
    //             return Game.Phase_RegularTime;
    //         }
    //         return 0;
    //     }

    //     formToJson(): JsonAgainstGame {
    //         const jsonGame = this.mapper.toJsonAgainst(this.game);;
    //         jsonGame.scores = [];
    //         this.scoreControls.forEach(scoreControl => {
    //             if (scoreControl.isScoreValid() === false) {
    //                 return;
    //             }
    //             jsonGame.scores.push({
    //                 id: 0,
    //                 home: scoreControl.home.value,
    //                 away: scoreControl.away.value,
    //                 phase: this.getPhase(),
    //                 number: jsonGame.scores.length + 1
    //             });
    //         });
    //         jsonGame.state = this.form.controls.played.value === true ? State.Finished : State.Created;
    //         return jsonGame;
    //     }


    //     // getCalculateScoreUnitName(game: Game): string {
    //     //     const calculateScore = game.getScoreConfig().getCalculate();
    //     //     return this.translate.getScoreNameSingular(calculateScore);
    //     // }

    //     save(): boolean {
    //         this.processing = true;
    //         this.setAlert('info', 'de wedstrijd wordt opgeslagen');

    //         const jsonGame = this.formToJson();
    //         this.gameRepository.editObject(jsonGame, this.game, this.game.getPoule(), this.tournament)
    //             .subscribe(
    //                 /* happy path */ gameRes => {
    //                     this.navigateBack();
    //                 },
    //              /* error path */ e => { this.setAlert('danger', e); this.processing = false; }
    //             );
    //         return false;
    //     }

    //     // protected hasScoreChanges(originalGameScores: GameScoreHomeAway[], homeAwayControls: HomeAwayFormControl[]): boolean {
    //     //     if (originalGameScores.length !== homeAwayControls.length || originalGameScores.length === 0) {
    //     //         return true;
    //     //     }
    //     //     const originalGameScoresTmp = originalGameScores.slice();
    //     //     homeAwayControls.forEach(homeAwayControl => {
    //     //         const newHomeAwayScore = homeAwayControl.getScore();
    //     //         const originalGameScoreTmp = originalGameScoresTmp.find(originalGameScore => {
    //     //             return originalGameScore.getHome() === newHomeAwayScore.getHome()
    //     //                 && originalGameScore.getAway() === newHomeAwayScore.getAway();
    //     //         });
    //     //         if (originalGameScoreTmp === undefined) {
    //     //             return;
    //     //         }
    //     //         const index = originalGameScoresTmp.indexOf(originalGameScoreTmp);
    //     //         if (index > -1) {
    //     //             originalGameScoresTmp.splice(index, 1);
    //     //         }
    //     //     });
    //     //     return originalGameScoresTmp.length > 0;
    //     // }

    //     navigateBack() {
    //         this.myNavigation.back();
    //     }
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