import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    NameService,
    RoundNumber,
    JsonPlanningConfig,
    CompetitorMap,
    PouleStructure,
    SelfReferee,
    CompetitionSport,
    GameAmountConfigMapper,
    PlanningConfigMapper,
    JsonGameAmountConfig,
    GameAmountConfig,
    GamePlaceStrategy,
    PlanningEditMode,
    AgainstH2h,
    AgainstGpp,
    AllInOneGame,
    Single
} from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { PlanningConfigRepository } from '../../lib/ngx-sport/planning/config/repository';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RoundNumbersSelectorModalComponent } from '../roundnumber/selector.component';
import { DefaultService } from '../../lib/ngx-sport/defaultService';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { GameAmountConfigControl } from '../gameAmountConfig/edit.component';
import { GameAmountConfigRepository } from '../../lib/ngx-sport/gameAmountConfig/repository';
import { forkJoin, Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { IAlertType } from '../../shared/common/alert';
import { Options } from 'selenium-webdriver';

@Component({
    selector: 'app-planningconfig-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class PlanningConfigComponent extends TournamentComponent implements OnInit {
    startRoundNumber!: RoundNumber;
    hasBegun!: boolean;
    form: FormGroup;
    private pouleStructure!: PouleStructure;
    public nameService!: NameService;
    public gameAmountLabel!: string;
    gameAmountConfigControls: GameAmountConfigControl[] = [];
    // gameModes: GameMode[] = [GameMode.Against, GameMode.Together];
    validations: PlanningConfigValidations = { minMinutes: 1, maxMinutes: 10080 };
    // gameAmountRange: VoetbalRange | undefined;
    public showNrOfBatchGamesAlert = false;

    @ViewChild('updateDataAlert', { static: false }) updateDataAlert!: NgbAlert;
    updateDataMsg: string | undefined = '';
    private _changingStartRoundNumber = new Subject<RoundNumber>();

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        private planningConfigRepository: PlanningConfigRepository,
        private gameAmountConfigRepository: GameAmountConfigRepository,
        private myNavigation: MyNavigation,
        private defaultService: DefaultService,
        private planningRepository: PlanningRepository,
        private mapper: PlanningConfigMapper,
        private gameAmountConfigMapper: GameAmountConfigMapper,
        private modalService: NgbModal,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, sructureRepository);
        this.form = fb.group({
            /*gameMode: ['', Validators.compose([
                Validators.required
            ])],*/
            manual: false,
            strategyRandomly: false,
            extension: false,
            enableTime: true,
            minutesPerGame: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minMinutes),
                Validators.max(this.validations.maxMinutes)
            ])],
            minutesPerGameExt: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minMinutes - 1),
                Validators.max(this.validations.maxMinutes)
            ])],
            minutesBetweenGames: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minMinutes - 1),
                Validators.max(this.validations.maxMinutes)
            ])],
            minutesAfter: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minMinutes - 1),
                Validators.max(this.validations.maxMinutes)
            ])],
            selfReferee: false,
            selfRefereeSamePoule: false
        });
    }

    ngOnInit() {
        this._changingStartRoundNumber.subscribe((roundNumber: RoundNumber) => {
            this.changeStartRoundNumberHelper(roundNumber);
            this.updateDataMsg = 'de gegevens bijwerken...';
        });
        this._changingStartRoundNumber.pipe(debounceTime(500)).subscribe(() => {
            if (this.updateDataAlert) {
                this.updateDataAlert.close();
            }
            this.processing = false;
        });
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => this.initConfig(+params.startRoundNumber));
        });
    }

    initConfig(startRoundNumberAsValue: number) {
        this.nameService = new NameService(new CompetitorMap(this.tournament.getCompetitors()));
        const startRoundNumber = this.structure.getRoundNumber(startRoundNumberAsValue);
        if (startRoundNumber === undefined) {
            this.setAlert(IAlertType.Danger, 'het rondenumber is niet gevonden');
            return;
        }
        this._changingStartRoundNumber.next(startRoundNumber);
    }

    initGameAmountConfigs(startRoundNumber: RoundNumber) {
        startRoundNumber.getValidGameAmountConfigs().forEach((gameAmountConfig: GameAmountConfig) => {
            this.form.addControl('' + gameAmountConfig.getId(), new FormControl());
        });
        this.setGameAmountControls(startRoundNumber);
        this.gameAmountLabel = this.getGameAmountLabel(startRoundNumber.getCompetition().getSportVariants());
    }

    // protected getCorrectAmount(
    //     sportVariant: Single | AgainstH2h | AgainstGpp | AllInOneGame,
    //     gameAmountConfig: GameAmountConfig): number {
    //     if (sportVariant instanceof AgainstVariant && sportVariant.isMixed()) {
    //         return gameAmountConfig.getNrOfGamesPerPlaceMixed();
    //     }
    //     return gameAmountConfig.getAmount();
    // }

    // isGameAmountEditable(): boolean {
    //     const calculator = new GameCreationStrategyCalculator();
    //     const strategy = calculator.calculate(this.competition.getSportVariants());
    //     return strategy === GameCreationStrategy.Static;
    // }


    private getGameAmountLabel(sportVariants: (Single | AgainstH2h | AgainstGpp | AllInOneGame)[]): string {
        if (sportVariants.length > 1) {
            return 'aantal wedstrijden';
        }
        const sportVariant = sportVariants[0];
        if (sportVariant instanceof AgainstH2h) {
            return 'aantal onderlinge duels';
        }
        return 'aantal wedstrijden per deelnemer';
    }

    setGameAmountControls(startRoundNumber: RoundNumber) {
        this.gameAmountConfigControls = [];
        startRoundNumber.getValidGameAmountConfigs().forEach((gameAmountConfig: GameAmountConfig) => {
            const range = this.defaultService.getGameAmountRange(gameAmountConfig.getCompetitionSport().getVariant());
            this.gameAmountConfigControls.push({
                json: this.gameAmountConfigMapper.toJson(gameAmountConfig),
                range: range,
                control: this.form.controls['' + gameAmountConfig.getId()]
            });
        });
    }

    changeStartRoundNumberHelper(startRoundNumber: RoundNumber) {
        this.startRoundNumber = startRoundNumber;
        this.pouleStructure = startRoundNumber.createPouleStructure();
        this.hasBegun = this.startRoundNumber.hasBegun();
        this.initGameAmountConfigs(startRoundNumber);
        this.jsonToForm(this.mapper.toJson(startRoundNumber.getValidPlanningConfig()));
        this.resetAlert();
        if (this.hasBegun) {
            this.setAlert(IAlertType.Warning, 'er zijn wedstrijden gespeeld voor deze ronde, je kunt niet meer wijzigen');
        }
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
            this.form.controls.minutesPerGameExt.setValue(DefaultService.MinutesPerGameExt);
        }
        if (!extension && this.form.controls.minutesPerGameExt.value > 0) {
            this.form.controls.minutesPerGameExt.setValue(0);
        }
    }

    changedEditMode(modalContent: TemplateRef<any>) {
        if (this.form.controls.manual.value) {
            this.openInfoModal('handmatig aanpassen', 'warning-modal', modalContent);
        }
    }

    changeSelfReferee(selfReferee: boolean) {
        // console.log(selfReferee);
        const shownNrOfBatchGamesAlert = localStorage.getItem('shownNrOfBatchGamesAlert');
        if (shownNrOfBatchGamesAlert === null) {
            localStorage.setItem('shownNrOfBatchGamesAlert', '1');
        }
        this.showNrOfBatchGamesAlert = shownNrOfBatchGamesAlert === null && selfReferee;
    }

    openInfoModal(header: string, windowClass: string, modalContent: TemplateRef<any>) {
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass });
        activeModal.componentInstance.header = header;
        activeModal.componentInstance.modalContent = modalContent;
    }

    private jsonToForm(json: JsonPlanningConfig) {
        this.form.controls.extension.setValue(json.extension);
        this.form.controls.enableTime.setValue(json.enableTime);
        this.form.controls.minutesPerGame.setValue(json.minutesPerGame);
        this.form.controls.minutesPerGameExt.setValue(json.minutesPerGameExt);
        this.form.controls.minutesBetweenGames.setValue(json.minutesBetweenGames);
        this.form.controls.minutesAfter.setValue(json.minutesAfter);
        this.startRoundNumber.getValidGameAmountConfigs().forEach((gameAmountConfig: GameAmountConfig) => {
            const sportVariant = gameAmountConfig.getCompetitionSport().getVariant();
            const range = this.defaultService.getGameAmountRange(sportVariant);
            const id = '' + gameAmountConfig.getId();
            this.form.controls[id].setValidators(
                Validators.compose([
                    Validators.required,
                    Validators.min(range.min),
                    Validators.max(range.max)])
            );
            this.form.controls[id].setValue(gameAmountConfig.getAmount());
        });
        this.form.controls.strategyRandomly.setValue(json.gamePlaceStrategy === GamePlaceStrategy.RandomlyAssigned);
        this.form.controls.manual.setValue(json.editMode === PlanningEditMode.Manual);

        const selfRefee = this.getSelfReferee(json.selfReferee);
        this.form.controls.selfReferee.setValue(selfRefee !== SelfReferee.Disabled);
        this.form.controls.selfRefereeSamePoule.setValue(selfRefee === SelfReferee.SamePoule);

        Object.keys(this.form.controls).forEach(key => {
            const control = this.form.controls[key];
            this.hasBegun ? control.disable() : control.enable();
        });
        this.enableDisableSelfReferee();
    }

    private formToJson(): JsonPlanningConfig {
        const strategy = this.form.controls.strategyRandomly.value ? GamePlaceStrategy.RandomlyAssigned : GamePlaceStrategy.EquallyAssigned;
        return {
            id: 0,
            editMode: this.form.controls.manual.value ? PlanningEditMode.Manual : PlanningEditMode.Auto,
            gamePlaceStrategy: strategy,
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

    protected getSelfReferee(currentSelfReferee: SelfReferee): SelfReferee {
        const selfRefereeOptionsAvailable = this.getSelfRefereeOptions();
        if (selfRefereeOptionsAvailable.indexOf(currentSelfReferee) >= 0) {
            return currentSelfReferee;
        }
        if (currentSelfReferee === SelfReferee.OtherPoules && this.isSelfRefereeSamePouleAvailable()) {
            return SelfReferee.SamePoule;
        }
        if (currentSelfReferee === SelfReferee.SamePoule && this.isSelfRefereeOtherPouleAvailable()) {
            return SelfReferee.OtherPoules;
        }
        return SelfReferee.Disabled;
    }

    isSelfRefereeOtherPouleAvailable(): boolean {
        return this.getSelfRefereeOptions().indexOf(SelfReferee.OtherPoules) >= 0;
    }

    isSelfRefereeSamePouleAvailable(): boolean {
        return this.getSelfRefereeOptions().indexOf(SelfReferee.SamePoule) >= 0;
    }

    bothSelfRefereeOptionsAvailable(): boolean {
        return this.isSelfRefereeOtherPouleAvailable() && this.isSelfRefereeSamePouleAvailable();
    }

    someSelfRefereeOptionAvailable(): boolean {
        return this.isSelfRefereeOtherPouleAvailable() || this.isSelfRefereeSamePouleAvailable();
    }

    protected getSelfRefereeOptions(): SelfReferee[] {
        const compSports = this.competition.getSports();

        let options = [SelfReferee.Disabled];

        const sportVariants = compSports.map((compSport: CompetitionSport): Single | AgainstH2h | AgainstGpp | AllInOneGame => compSport.getVariant());

        const otherPoulesAvailable = this.pouleStructure.isSelfRefereeOtherPoulesAvailable();
        if (otherPoulesAvailable) {
            options.push(SelfReferee.OtherPoules);
        }
        const samePouleAvailable = this.pouleStructure.isSelfRefereeSamePouleAvailable(sportVariants);
        if (samePouleAvailable) {
            options.push(SelfReferee.SamePoule);
        }
        return options;
    }

    showRandomGamePlaceStrategy(): boolean {
        const sportVariants = this.startRoundNumber.getCompetition().getSportVariants();
        return sportVariants.every((sportVariant: Single | AgainstH2h | AgainstGpp | AllInOneGame): boolean => {
            return sportVariant instanceof AgainstGpp && sportVariant.hasMultipleSidePlaces();
        });

    }

    enableDisableSelfReferee() {
        if (this.someSelfRefereeOptionAvailable()) {
            if (this.form.controls.selfReferee.disabled && !this.hasBegun) {
                this.form.controls.selfReferee.enable();
            }
        } else if (this.form.controls.selfReferee.disabled === false) {
            this.form.controls.selfReferee.disable();
        }
    }

    hasRoundNumbersChoice(): boolean {
        return this.getUnbegunRoundNumbers().length > 1;
    }

    hasDifferentConfigs(): boolean {
        return this.getUnbegunRoundNumbers().filter((roundNumber: RoundNumber): boolean => {
            return roundNumber.getPlanningConfig() !== undefined;
        }).length > 1;
    }

    getUnbegunRoundNumbers(): RoundNumber[] {
        return this.structure.getRoundNumbers().filter((roundNumber: RoundNumber): boolean => {
            return !roundNumber.hasBegun();
        });
    }

    save(): boolean {
        this.setAlert(IAlertType.Info, 'instellingen worden opgeslagen');
        this.processing = true;

        const jsonConfig: JsonPlanningConfig = this.formToJson();
        const jsonGameAmountConfigs: JsonGameAmountConfig[] = this.formToJsonGameAmountConfigs();
        const planningActionCalculator = new PlanningActionCalculator(this.startRoundNumber);
        const planningAction = planningActionCalculator.getAction(jsonConfig, jsonGameAmountConfigs);

        this.planningConfigRepository.saveObject(jsonConfig, this.startRoundNumber, this.tournament)
            .subscribe({
                next: () => {
                    if (jsonConfig.editMode === PlanningEditMode.Auto) {
                        this.saveGameAmountConfigs(jsonGameAmountConfigs, planningAction);
                    } else {
                        this.processing = false;
                        this.myNavigation.back();
                    }
                },
                error: (e) => {
                    this.setAlert(IAlertType.Danger, 'de instellingen zijn niet opgeslagen: ' + e);
                    this.processing = false;
                }
            });

        return true;
    }

    private savePlanning(action: PlanningAction) {
        if (action === PlanningAction.Recreate) {
            this.planningRepository.create(this.structure, this.tournament, this.startRoundNumber.getNumber())
                .subscribe({
                    next: () => {
                        this.setAlert(IAlertType.Success, 'de instellingen zijn opgeslagen');
                        this.myNavigation.back();
                    },
                    error: (e) => {
                        this.setAlert(IAlertType.Danger, 'de instellingen zijn niet opgeslagen: ' + e); this.processing = false;
                    },
                    complete: () => this.processing = false
                });
        } else if (action === PlanningAction.Reschedule) {
            this.planningRepository.reschedule(this.startRoundNumber, this.tournament)
                .subscribe({
                    next: () => {
                        this.setAlert(IAlertType.Success, 'de instellingen zijn opgeslagen');
                        this.myNavigation.back();
                    },
                    error: (e) => {
                        this.setAlert(IAlertType.Danger, 'de instellingen zijn niet opgeslagen: ' + e); this.processing = false;
                    },
                    complete: () => this.processing = false
                });
        } else {
            this.processing = false;
            this.setAlert(IAlertType.Success, 'de instellingen zijn opgeslagen');
            this.myNavigation.back();
        }
    }

    private saveGameAmountConfigs(jsonGameAmountConfigs: JsonGameAmountConfig[], planningAction: PlanningAction) {
        const reposUpdates: Observable<GameAmountConfig>[] = jsonGameAmountConfigs.map((jsonGameAmountConfig: JsonGameAmountConfig) => {
            return this.gameAmountConfigRepository.saveObject(jsonGameAmountConfig, this.startRoundNumber, this.tournament);
        });
        forkJoin(reposUpdates).subscribe({
            next: () => {
                this.savePlanning(planningAction);
            },
            error: (e) => {
                this.alert = { type: IAlertType.Danger, message: 'de wedstrijd-aantallen zijn niet opgeslagen: ' + e };
                this.processing = false;
            }
        });
    }

    openModalSelectStartRoundNumber() {
        const modalRef = this.modalService.open(RoundNumbersSelectorModalComponent);
        modalRef.componentInstance.structure = this.structure;
        modalRef.componentInstance.subject = 'de score-regels';
        modalRef.result.then((startRoundNumber: RoundNumber) => {
            this.processing = true;
            this._changingStartRoundNumber.next(startRoundNumber);
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
        if (config.getSelfReferee() !== json.selfReferee) {
            return true
        }
        if (config.getGamePlaceStrategy() !== json.gamePlaceStrategy) {
            return true
        }
        return this.gameAmountConfigsChanged(jsonGameAmountConfigs);
    }

    private gameAmountConfigsChanged(jsonGameAmountConfigs: JsonGameAmountConfig[]): boolean {
        // if (!this.isGameAmountEditable()) {
        //     return false;
        // }
        const getGameAmountConfig = (competitionSport: CompetitionSport): JsonGameAmountConfig | undefined => {
            return jsonGameAmountConfigs.find((jsonGameAmountConfigIt: JsonGameAmountConfig) => {
                return jsonGameAmountConfigIt.competitionSport.id === competitionSport.getId();
            });
        };
        return this.roundNumber.getCompetitionSports().some((competitionSport: CompetitionSport) => {
            const jsonGameAmountConfig = getGameAmountConfig(competitionSport);
            const gameAmountConfig = this.roundNumber.getGameAmountConfig(competitionSport);
            if (gameAmountConfig === undefined) {
                return true;
            }
            return jsonGameAmountConfig && jsonGameAmountConfig.amount !== gameAmountConfig.getAmount();
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

    // isGameAmountEditable(): boolean {
    //     const calculator = new GameCreationStrategyCalculator();
    //     const strategy = calculator.calculate(this.roundNumber.getCompetition().getSportVariants());
    //     return strategy === GameCreationStrategy.Static;
    // }

}

export interface PlanningConfigValidations {
    minMinutes: number;
    maxMinutes: number;
}

enum PlanningAction {
    None = 1, Reschedule, Recreate
}





