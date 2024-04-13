import { AfterContentInit, AfterViewInit, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    GameState,
    ScoreConfig,
    AgainstGame,
    GameMapper,
    JsonAgainstGame,
    AgainstScoreHelper,
    FieldMapper,
    RefereeMapper,
    PlaceMapper,
    GamePhase,
    AgainstScore,
    ScoreDirection
} from 'ngx-sport';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { GameRepository } from '../../lib/ngx-sport/game/repository';
import { GameEditComponent } from './edit.component';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { CustomSportId } from '../../lib/ngx-sport/sport/custom';
import { TranslateScoreService } from '../../lib/translate/score';

@Component({
    selector: 'app-tournament-againstgame-edit',
    templateUrl: './editagainst.component.html',
    styleUrls: ['./editagainst.component.scss']
})
export class GameAgainstEditComponent extends GameEditComponent implements OnInit, AfterViewInit {

    public calculateScoreControl: AgainstScoreFormControl | undefined;
    public scoreControls: AgainstScoreFormControl[] = [];
    public minExtraPoints = -10;
    public maxExtraPoints = 10;

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        authService: AuthService,
        gameRepository: GameRepository,
        mapper: GameMapper,
        fieldMapper: FieldMapper,
        refereeMapper: RefereeMapper,
        placeMapper: PlaceMapper,
        translate: TranslateScoreService,
        myNavigation: MyNavigation
    ) {
        super(route, router, tournamentRepository, structureRepository, globalEventsManager, modalService, favRepository,
            authService, gameRepository, mapper, fieldMapper, refereeMapper, placeMapper, translate, myNavigation);
        // this.originalPouleState = State.Created;
        this.typedForm.addControl('extratime', new FormControl(false, { nonNullable: true }));
        this.typedForm.addControl('homeExtraPoints', new FormControl(false, { nonNullable: true }));
        this.typedForm.addControl('awayExtraPoints', new FormControl(false, { nonNullable: true }));
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
        this.typedForm.controls.homeExtraPoints.setValue(this.getGame().getHomeExtraPoints() ?? 0);
        this.typedForm.controls.awayExtraPoints.setValue(this.getGame().getAwayExtraPoints() ?? 0);
        this.typedForm.controls.played.setValue(this.game?.getState() === GameState.Finished);
        this.typedForm.controls.extratime.setValue(this.getGame().getFinalPhase() === GamePhase.ExtraTime);
        this.initScoreControls(); // do last!        
    }

    protected initScoreControls() {
        this.scoreControls = [];
        this.getGame().getScores().forEach((score: AgainstScore) => {
            this.addScoreControl(score.getHome(), score.getAway(), false);
        });
        if (this.scoreControls.length === 0) {
            this.scoreControls.push(new AgainstScoreFormControl(this.firstScoreConfig, 0, 0));
        }
        this.updateCalculateScoreControl(false);
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.updateWarningsForEqualQualifiers(this.formToJson());
        }, 1000);        
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

    protected updateCalculateScoreControl(updateWarnings: boolean) {
        if( this.calculateScoreControl !== undefined) {            
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
                } else {
                    this.calculateScoreControl.home.setValue(this.calculateScoreControl.home.value + 0.5);
                    this.calculateScoreControl.away.setValue(this.calculateScoreControl.away.value + 0.5);
                }
            });
        }
        this.postScoreControlUpdate(updateWarnings);
    }

    addScoreControl(home: number, away: number, updateWarnings: boolean) {
        this.scoreControls.push(new AgainstScoreFormControl(this.firstScoreConfig, home, away));
        this.postScoreControlUpdate(updateWarnings);
    }

    removeScoreControl() {
        this.scoreControls.pop();
        this.updateCalculateScoreControl(true);
    }

    setExtratime(extratime: boolean) {
        if (this.getGame().getScores().length === 0) {
            this.updateCalculateScoreControl(false);
        } else if (extratime === true && this.typedForm.controls.played.value !== true) {
            this.typedForm.controls.played.setValue(true);
        }
        super.updateWarningsForEqualQualifiers(this.formToJson());
    }

    setPlayed(played: boolean) {
        if (played === false) {
            this.typedForm.controls.extratime.setValue(false);
            this.resetScoreControls();
            this.updateCalculateScoreControl(false);
        } else if (this.getGame().getScores().length === 0) {
            this.updateCalculateScoreControl(false);
        }
        super.updateWarningsForEqualQualifiers(this.formToJson());
    }

    allScoresAreInvalid(): boolean {
        return this.scoreControls.every((scoreControl: AgainstScoreFormControl) => !scoreControl.isScoreValid());
    }

    formToJson(): JsonAgainstGame {
        const jsonGame = this.mapper.toJsonAgainst(this.getGame());
        this.formToJsonHelper(jsonGame);
        jsonGame.scores = [];
        this.scoreControls.forEach(scoreControl => {
            if (scoreControl.isScoreValid() === false) {
                return;
            }
            jsonGame.scores.push({
                id: 0,
                home: scoreControl.home.value ?? 0,
                away: scoreControl.away.value ?? 0,
                phase: this.getPhase(this.typedForm),
                number: jsonGame.scores.length + 1
            });
        });
        jsonGame.state = this.typedForm.controls.played.value === true ? GameState.Finished : GameState.Created;
        jsonGame.homeExtraPoints = this.typedForm.controls.homeExtraPoints.value;
        jsonGame.awayExtraPoints = this.typedForm.controls.awayExtraPoints.value;
        return jsonGame;
    }

    save(): boolean {
        return this.saveHelper(this.formToJson());
    }

    postScoreControlUpdate(updateWarning: boolean) {
        if (this.pristineScore && this.typedForm.controls.played.value === false) {
            this.typedForm.controls.played.setValue(true);
        }
        this.pristineScore = false;
        if (updateWarning) {
            this.updateWarningsForEqualQualifiers(this.formToJson());
        }
    }

    get sportIsRugby(): boolean {
        return this.game?.getCompetitionSport().getSport().getCustomId() === CustomSportId.Rugby;
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
        if (!this.isScoreValid()) {
            return 'is-invalid';
        }
        if (this.scoreConfig.getDirection() !== ScoreDirection.Upwards || this.scoreConfig.getMaximum() === 0) {
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