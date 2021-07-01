import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    State,
    ScoreConfig,
    AgainstGame,
    GameMapper,
    JsonAgainstGame,
    AgainstScoreHelper,
    FieldMapper,
    RefereeMapper,
    PlaceMapper,
    GamePhase,
} from 'ngx-sport';

import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TranslateService } from '../../lib/translate';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { GameRepository } from '../../lib/ngx-sport/game/repository';
import { GameEditComponent } from './edit.component';

@Component({
    selector: 'app-tournament-againstgame-edit',
    templateUrl: './editagainst.component.html',
    styleUrls: ['./editagainst.component.scss']
})
export class GameAgainstEditComponent extends GameEditComponent implements OnInit {

    public calculateScoreControl: AgainstScoreFormControl | undefined;
    public scoreControls: AgainstScoreFormControl[] = [];

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
        this.form.addControl('extratime', new FormControl(false));
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
        this.form.controls.extratime.setValue(this.getGame().getFinalPhase() === GamePhase.ExtraTime);
        this.initScoreControls();
    }

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

    setExtratime(extratime: boolean) {
        if (this.getGame().getScores().length === 0) {
            this.updateCalculateScoreControl();
        } else if (extratime === true && this.form.controls.played.value !== true) {
            this.form.controls.played.setValue(true);
        }
        super.updateWarningsForEqualQualifiers(this.formToJson());
    }

    setPlayed(played: boolean) {
        if (played === false) {
            this.form.controls.extratime.setValue(false);
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

    postScoreControlUpdate() {
        if (this.pristineScore && this.getGame().getScores().length === 0) {
            this.form.controls.played.setValue(true);
        }
        this.pristineScore = false;
        this.updateWarningsForEqualQualifiers(this.formToJson());
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