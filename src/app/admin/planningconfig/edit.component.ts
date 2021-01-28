import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    NameService,
    RoundNumber,
    PlanningConfig,
    JsonPlanningConfig,
    StructureService,
    PlaceLocationMap,
    PouleStructure,
    SelfReferee,
    GameMode,
    CompetitionSport,
    CompetitionSportMapper,
    VoetbalRange,
    GameAmountConfigMapper,
    PlanningConfigMapper,
    JsonGameAmountConfig,
} from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { PlanningConfigRepository } from '../../lib/ngx-sport/planning/config/repository';
import { Tournament } from '../../lib/tournament';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RoundNumbersSelectorModalComponent } from '../roundnumber/selector.component';
import { SportDefaultService } from '../../lib/ngx-sport/defaultService';
import { GameAmountConfig } from 'ngx-sport/src/planning/gameAmountConfig';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { GameAmountConfigControl } from '../gameAmountConfig/edit.component';
import { GameAmountConfigRepository } from '../../lib/ngx-sport/gameAmountConfig/repository';
import { forkJoin, Observable } from 'rxjs';

@Component({
    selector: 'app-planningconfig-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class PlanningConfigComponent extends TournamentComponent implements OnInit {
    startRoundNumber: RoundNumber;
    hasBegun: boolean;
    form: FormGroup;
    private pouleStructure: PouleStructure;
    public nameService: NameService;
    gameAmountRange: VoetbalRange;
    gameAmountConfigControls: GameAmountConfigControl[] = [];
    gameModes: GameMode[] = [GameMode.Against, GameMode.Together];
    validations: PlanningConfigValidations = {
        minMinutesPerGame: 1,
        maxMinutesPerGame: 60
    };
    gameAmountValidations: GameAmountConfigValidations = {
        minNrOfHeadtohead: 1,
        maxNrOfHeadtohead: 4,
        minNrOfGames: 1,
        maxNrOfGames: 50
    };

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        private planningConfigRepository: PlanningConfigRepository,
        private gameAmountConfigRepository: GameAmountConfigRepository,
        private myNavigation: MyNavigation,
        private planningRepository: PlanningRepository,
        private mapper: PlanningConfigMapper,
        private gameAmountConfigMapper: GameAmountConfigMapper,
        private modalService: NgbModal,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, sructureRepository);
        this.form = fb.group({
            gameMode: ['', Validators.compose([
                Validators.required
            ])],
            extension: false,
            enableTime: true,
            minutesPerGame: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minMinutesPerGame),
                Validators.max(this.validations.maxMinutesPerGame)
            ])],
            minutesPerGameExt: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minMinutesPerGame - 1),
                Validators.max(this.validations.maxMinutesPerGame)
            ])],
            minutesBetweenGames: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minMinutesPerGame - 1),
                Validators.max(this.validations.maxMinutesPerGame)
            ])],
            minutesAfter: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minMinutesPerGame - 1),
                Validators.max(this.validations.maxMinutesPerGame)
            ])],
            selfReferee: false,
            selfRefereeSamePoule: false
        });
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => this.initConfig(+params.startRoundNumber));
        });
    }

    initConfig(startRoundNumberAsValue: number) {
        this.nameService = new NameService(new PlaceLocationMap(this.tournament.getCompetitors()));
        const startRoundNumber = this.structure.getRoundNumber(startRoundNumberAsValue);
        this.initGameAmountConfigs(startRoundNumber);
        this.changeStartRoundNumber(startRoundNumber);
        this.processing = false;
    }

    initGameAmountConfigs(startRoundNumber: RoundNumber) {
        this.setGameAmountRange(startRoundNumber.getValidPlanningConfig().getGameMode());
        startRoundNumber.getValidGameAmountConfigs().forEach((gameAmountConfig: GameAmountConfig) => {
            this.form.addControl('' + gameAmountConfig.getId(), new FormControl(
                gameAmountConfig.getAmount(),
                Validators.compose([Validators.required, Validators.min(this.gameAmountRange.min), Validators.max(this.gameAmountRange.max)])
            ));
        });
        this.setGameAmountControls(startRoundNumber);
        this.processing = false;
    }

    setGameAmountRange(gameMode: GameMode) {
        const validations = this.gameAmountValidations
        let min = gameMode === GameMode.Against ? validations.minNrOfHeadtohead : validations.minNrOfGames;
        let max = gameMode === GameMode.Against ? validations.maxNrOfHeadtohead : validations.maxNrOfGames;
        this.gameAmountRange = { min, max };
    }

    setGameAmountControls(startRoundNumber: RoundNumber) {
        startRoundNumber.getValidGameAmountConfigs().forEach((gameAmountConfig: GameAmountConfig) => {
            this.gameAmountConfigControls.push({
                json: this.gameAmountConfigMapper.toJson(gameAmountConfig),
                control: this.form.controls['' + gameAmountConfig.getId()]
            });
        });
    }

    changeStartRoundNumber(startRoundNumber: RoundNumber) {
        this.startRoundNumber = startRoundNumber;
        this.pouleStructure = startRoundNumber.createPouleStructure();
        this.hasBegun = this.startRoundNumber.hasBegun()
        this.setGameAmountRange(startRoundNumber.getValidPlanningConfig().getGameMode());
        this.jsonToForm(this.mapper.toJson(startRoundNumber.getValidPlanningConfig()));
        this.resetAlert();
        if (this.hasBegun) {
            this.setAlert('warning', 'er zijn wedstrijden gespeeld voor deze ronde, je kunt niet meer wijzigen');
        }
    }

    changeGameMode(gameMode: GameMode) {
        this.setGameAmountRange(gameMode);
    }

    changeMinutesPerGameExt(minutesPerGameExt: number) {
        if (minutesPerGameExt === 0 && this.form.controls.extension.value) {
            this.form.controls.extension.setValue(false);
        }
        if (minutesPerGameExt > 0 && this.form.controls.extension.value === false) {
            this.form.controls.extension.setValue(true);
        }
    }

    changeExtension(extension: boolean) {
        if (extension && this.form.controls.minutesPerGameExt.value === 0) {
            this.form.controls.minutesPerGameExt.setValue(SportDefaultService.MinutesPerGameExt);
        }
        if (!extension && this.form.controls.minutesPerGameExt.value > 0) {
            this.form.controls.minutesPerGameExt.setValue(0);
        }
    }

    openInfoModal(header: string, modalContent) {
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = header;
        activeModal.componentInstance.modalContent = modalContent;
        activeModal.result.then((result) => {
        }, (reason) => {

        });
    }

    private jsonToForm(json: JsonPlanningConfig) {
        this.form.controls.gameMode.setValue(json.gameMode);
        this.form.controls.extension.setValue(json.extension);
        this.form.controls.enableTime.setValue(json.enableTime);
        this.form.controls.minutesPerGame.setValue(json.minutesPerGame);
        this.form.controls.minutesPerGameExt.setValue(json.minutesPerGameExt);
        this.form.controls.minutesBetweenGames.setValue(json.minutesBetweenGames);
        this.form.controls.minutesAfter.setValue(json.minutesAfter);
        this.startRoundNumber.getValidGameAmountConfigs().forEach((gameAmountConfig: GameAmountConfig) => {
            const id = '' + gameAmountConfig.getId();
            this.form.controls[id].setValidators(
                Validators.compose([Validators.required, Validators.min(this.gameAmountRange.min), Validators.max(this.gameAmountRange.max)])
            );
            this.form.controls[id].setValue(gameAmountConfig.getAmount());
        });

        const selfRefee = this.getSelfReferee(json.selfReferee);
        this.form.controls.selfReferee.setValue(selfRefee !== SelfReferee.Disabled);
        const selfRefeeSamePoule = !(selfRefee && json.selfReferee === SelfReferee.OtherPoules);
        this.form.controls.selfRefereeSamePoule.setValue(selfRefeeSamePoule);

        Object.keys(this.form.controls).forEach(key => {
            const control = this.form.controls[key];
            this.hasBegun ? control.disable() : control.enable();
        });
        this.enableDisableSelfReferee();
    }

    private formToJson(): JsonPlanningConfig {
        return {
            id: 0,
            gameMode: this.form.controls.gameMode.value,
            extension: this.form.controls.extension.value,
            enableTime: this.form.controls.enableTime.value,
            minutesPerGame: this.form.controls.minutesPerGame.value,
            minutesPerGameExt: this.form.controls.minutesPerGameExt.value,
            minutesBetweenGames: this.form.controls.minutesBetweenGames.value,
            minutesAfter: this.form.controls.minutesAfter.value,
            selfReferee: (this.form.controls.selfReferee.disabled || !this.form.value['selfReferee']) ? SelfReferee.Disabled :
                (this.form.value['selfRefereeSamePoule'] ? SelfReferee.SamePoule : SelfReferee.OtherPoules)
        };
    }

    private formToJsonGameAmountConfigs(): JsonGameAmountConfig[] {
        return this.gameAmountConfigControls.map((gameAmountConfigControl: GameAmountConfigControl): JsonGameAmountConfig => {
            return {
                id: gameAmountConfigControl.json.id,
                competitionSport: gameAmountConfigControl.json.competitionSport,
                amount: gameAmountConfigControl.control.value
            };
        });
    }

    protected getSelfReferee(currentSelfReferee: number): number {
        const selfRefereeAvailable = this.getSelfRefereeAvailable();
        if ((currentSelfReferee & selfRefereeAvailable) === currentSelfReferee) {
            return currentSelfReferee;
        }
        if (currentSelfReferee === SelfReferee.OtherPoules
            && (selfRefereeAvailable & SelfReferee.SamePoule) === SelfReferee.SamePoule) {
            return SelfReferee.SamePoule;
        }
        if (currentSelfReferee === SelfReferee.SamePoule
            && (selfRefereeAvailable & SelfReferee.OtherPoules) === SelfReferee.OtherPoules) {
            return SelfReferee.OtherPoules;
        }
        return SelfReferee.Disabled;
    }

    bothSelfRefereeAvailable(): boolean {
        const selfRefereeAvailable = this.getSelfRefereeAvailable();
        return selfRefereeAvailable === (SelfReferee.OtherPoules + SelfReferee.SamePoule);
    }

    protected getSelfRefereeAvailable(): number {
        const competitionSports = this.competition.getSports();

        let selfRefereeAvailable = SelfReferee.Disabled;

        const maxNrOfGamePlaces = this.getMaxNrOfGamePlaces(competitionSports);
        const otherPoulesAvailable = this.pouleStructure.selfRefereeOtherPoulesAvailable();
        if (otherPoulesAvailable) {
            selfRefereeAvailable += SelfReferee.OtherPoules;
        }
        const samePouleAvailable = this.pouleStructure.selfRefereeSamePouleAvailable(maxNrOfGamePlaces);
        if (samePouleAvailable) {
            selfRefereeAvailable += SelfReferee.SamePoule;
        }
        return selfRefereeAvailable;
    }

    public getMaxNrOfGamePlaces(competitionSports: CompetitionSport[]): number {
        let maxNrOfGamePlaces = 0;
        competitionSports.forEach((competitionSport: CompetitionSport) => {
            const nrOfGamePlaces = competitionSport.getSport().getNrOfGamePlaces();
            if (nrOfGamePlaces > maxNrOfGamePlaces) {
                maxNrOfGamePlaces = nrOfGamePlaces;
            }
        });
        return maxNrOfGamePlaces;
    }

    enableDisableSelfReferee() {
        if (this.isSelfRefereeAvailable()) {
            if (this.form.controls.selfReferee.disabled && !this.hasBegun) {
                this.form.controls.selfReferee.enable();
            }
        } else if (this.form.controls.selfReferee.disabled === false) {
            this.form.controls.selfReferee.disable();
        }
    }

    isSelfRefereeAvailable(): boolean {
        return this.getSelfRefereeAvailable() !== SelfReferee.Disabled;
    }

    get gameModeDefinitions(): GameModeOption[] {
        return [
            { value: GameMode.Against, name: 'Het aantal wedstrijden worden bepaald door de grootte van de poule en het aantal onderlinge duels.' },
            { value: GameMode.Together, name: 'Het aantal wedstrijden worden ingesteld door de gebruiker.' }
        ];
    }

    save(): boolean {
        this.setAlert('info', 'instellingen worden opgeslagen');
        this.processing = true;

        const jsonConfig: JsonPlanningConfig = this.formToJson();
        const jsonGameAmountConfigs: JsonGameAmountConfig[] = this.formToJsonGameAmountConfigs();
        const planningAction = (new PlanningActionCalculator(this.startRoundNumber)).getAction(jsonConfig, jsonGameAmountConfigs);

        this.planningConfigRepository.saveObject(jsonConfig, this.startRoundNumber, this.tournament)
            .subscribe(
                /* happy path */ configRes => {
                    this.saveGameAmountConfigs(jsonGameAmountConfigs, planningAction);
                },
                /* error path */ e => {
                    this.setAlert('danger', 'de instellingen zijn niet opgeslagen: ' + e);
                    this.processing = false;
                } // ,
                // /* onComplete */() => /*this.processing = false*/
            );

        return true;
    }

    private savePlanning(action: PlanningAction) {
        if (action === PlanningAction.Recreate) {
            this.planningRepository.create(this.structure, this.tournament, this.startRoundNumber.getNumber())
                .subscribe(
                    /* happy path */ roundNumberOut => {
                        this.setAlert('success', 'de instellingen zijn opgeslagen');
                        this.myNavigation.back();
                    },
                    /* error path */ e => {
                        this.setAlert('danger', 'de instellingen zijn niet opgeslagen: ' + e); this.processing = false;
                    },
                    /* onComplete */() => this.processing = false
                );
        } else if (action === PlanningAction.Reschedule) {
            this.planningRepository.reschedule(this.startRoundNumber, this.tournament)
                .subscribe(
                    /* happy path */ gamesRes => {
                        this.setAlert('success', 'de instellingen zijn opgeslagen');
                        this.myNavigation.back();
                    },
                    /* error path */ e => {
                        this.setAlert('danger', 'de instellingen zijn niet opgeslagen: ' + e); this.processing = false;
                    },
                        /* onComplete */() => this.processing = false
                );
        } else {
            this.processing = false;
            this.setAlert('success', 'de instellingen zijn opgeslagen');
        }
    }

    private saveGameAmountConfigs(jsonGameAmountConfigs: JsonGameAmountConfig[], planningAction: PlanningAction) {
        const reposUpdates: Observable<GameAmountConfig>[] = jsonGameAmountConfigs.map((jsonGameAmountConfig: JsonGameAmountConfig) => {
            return this.gameAmountConfigRepository.saveObject(jsonGameAmountConfig, this.startRoundNumber, this.tournament);
        });
        forkJoin(reposUpdates).subscribe(results => {
            this.savePlanning(planningAction);
        },
            e => {
                this.alert = { type: 'danger', message: 'de wedstrijd-aantallen zijn niet opgeslagen: ' + e };
                this.processing = false;
            });
    }

    openModalSelectStartRoundNumber() {
        const modalRef = this.modalService.open(RoundNumbersSelectorModalComponent);
        modalRef.componentInstance.structure = this.structure;
        modalRef.componentInstance.subject = 'de score-regels';
        modalRef.result.then((startRoundNumber: RoundNumber) => {
            this.changeStartRoundNumber(startRoundNumber);
        }, (reason) => { });
    }
}

class PlanningActionCalculator {
    constructor(
        private roundNumber: RoundNumber
    ) { }

    getAction(jsonConfig: JsonPlanningConfig, jsonGameAmountConfigs: JsonGameAmountConfig[]): PlanningAction {
        if (this.needsRecreating(jsonConfig, jsonGameAmountConfigs)) {
            return PlanningAction.Recreate;
        } else if (this.needsRescheduling(jsonConfig)) {
            return PlanningAction.Reschedule;
        }
        return PlanningAction.None;
    }

    private needsRecreating(json: JsonPlanningConfig, jsonGameAmountConfigs: JsonGameAmountConfig[]): boolean {
        const config = this.roundNumber.getValidPlanningConfig();
        if (config.getGameMode() !== json.gameMode || config.getSelfReferee() !== json.selfReferee) {
            return true
        }
        return this.gameAmountConfigsChanged(jsonGameAmountConfigs);
    }

    private gameAmountConfigsChanged(jsonGameAmountConfigs: JsonGameAmountConfig[]): boolean {
        const getGameAmountConfig = (competitionSport: CompetitionSport): JsonGameAmountConfig => {
            return jsonGameAmountConfigs.find((jsonGameAmountConfigIt: JsonGameAmountConfig) => {
                return jsonGameAmountConfigIt.competitionSport.id === competitionSport.getId();
            });
        };
        return this.roundNumber.getCompetitionSports().some((competitionSport: CompetitionSport) => {
            const jsonGameAmountConfig = getGameAmountConfig(competitionSport);
            return jsonGameAmountConfig.amount !== this.roundNumber.getGameAmountConfig(competitionSport).getAmount();
        });
    }

    private needsRescheduling(json: JsonPlanningConfig): boolean {
        const config = this.roundNumber.getValidPlanningConfig();
        return config.getExtension() !== json.extension
            || config.getEnableTime() !== json.enableTime
            || config.getMinutesPerGame() !== json.minutesPerGame
            || config.getMinutesPerGameExt() !== json.minutesPerGameExt
            || config.getMinutesBetweenGames() !== json.minutesBetweenGames
            || config.getMinutesAfter() !== json.minutesAfter
            ;
    }

}

export interface PlanningConfigValidations {
    minMinutesPerGame: number;
    maxMinutesPerGame: number;
}

export interface GameAmountConfigValidations {
    minNrOfHeadtohead: number;
    maxNrOfHeadtohead: number;
    minNrOfGames: number;
    maxNrOfGames: number;
}

interface GameModeOption {
    value: GameMode;
    name: string;
}

enum PlanningAction {
    None = 1, Reschedule, Recreate
}