import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    RoundNumber,
    JsonPlanningConfig,
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
    Single,
    StructureNameService,
    StartLocationMap,
    GameMode,
    EquallyAssignCalculator,
    SportMapper
} from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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
import { GlobalEventsManager } from '../../shared/common/eventmanager';
import { FavoritesRepository } from '../../lib/favorites/repository';

@Component({
    selector: 'app-planningconfig-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class PlanningConfigComponent extends TournamentComponent implements OnInit {
    public typedForm: FormGroup;/*<{
        gameAmountConfigs: FormArray<FormControl>,
        enableTime: FormControl<boolean>,        
        strategyRandomly: FormControl<boolean>,
        extension: FormControl<boolean>,        
        minutesPerGame: FormControl<number>,
        minutesPerGameExt: FormControl<number>,
        minutesBetweenGames: FormControl<number>,
        minutesAfter: FormControl<number>,
        perPoule: FormControl<boolean>,
        selfReferee: FormControl<boolean>,
        selfRefereeSamePoule: FormControl<boolean>,
        nrOfSimSelfRefs: FormControl<number>,
        manual: FormControl<boolean>,
      }>*/;

    startRoundNumber!: RoundNumber;
    hasBegun!: boolean;
    private pouleStructure!: PouleStructure;
    public structureNameService!: StructureNameService;
    public gameAmountLabel!: string;
    gameAmountConfigControls: GameAmountConfigControl[] = [];
    // gameModes: GameMode[] = [GameMode.Against, GameMode.Together];
    validations: PlanningConfigValidations = { minMinutes: 1, maxMinutes: 10080 };
    // gameAmountRange: VoetbalRange | undefined;
    public showNrOfBatchGamesAlert = false;
    public unequallyAssigned = false;

    @ViewChild('updateDataAlert', { static: false }) updateDataAlert!: NgbAlert;
    updateDataMsg: string | undefined = '';
    private _changingStartRoundNumber = new Subject<RoundNumber>();

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        globalEventsManager: GlobalEventsManager,
        modalService: NgbModal,
        favRepository: FavoritesRepository,
        private planningConfigRepository: PlanningConfigRepository,
        private gameAmountConfigRepository: GameAmountConfigRepository,
        private myNavigation: MyNavigation,
        private defaultService: DefaultService,
        private planningRepository: PlanningRepository,
        private mapper: PlanningConfigMapper,
        private sportMapper: SportMapper,
        private gameAmountConfigMapper: GameAmountConfigMapper
    ) {
        super(route, router, tournamentRepository, sructureRepository, globalEventsManager, modalService, favRepository);
        this.typedForm = new FormGroup({
            /*gameAmountConfigs: new FormArray([
                new FormControl(1, { nonNullable: true })
            ]),*/
            enableTime: new FormControl(true, { nonNullable: true }),            
            strategyRandomly: new FormControl(false, { nonNullable: true }),
            extension: new FormControl(false, { nonNullable: true }),            
            minutesPerGame: new FormControl(this.validations.minMinutes, { nonNullable: true, validators: 
                [
                    Validators.required,
                    Validators.min(this.validations.minMinutes),
                    Validators.max(this.validations.maxMinutes)
                ] 
            }),
            minutesPerGameExt: new FormControl(this.validations.minMinutes - 1, { nonNullable: true, validators: 
                [
                    Validators.required,
                    Validators.min(this.validations.minMinutes - 1),
                    Validators.max(this.validations.maxMinutes)
                ] 
            }),
            minutesBetweenGames: new FormControl(this.validations.minMinutes - 1, { nonNullable: true, validators: 
                [
                    Validators.required,
                    Validators.min(this.validations.minMinutes - 1),
                    Validators.max(this.validations.maxMinutes)
                ] 
            }),
            minutesAfter: new FormControl(this.validations.minMinutes - 1, { nonNullable: true, validators: 
                [
                    Validators.required,
                    Validators.min(this.validations.minMinutes - 1),
                    Validators.max(this.validations.maxMinutes)
                ] 
            }),
            perPoule: new FormControl(false, { nonNullable: true }),
            selfReferee: new FormControl(false, { nonNullable: true }),
            selfRefereeSamePoule: new FormControl(false, { nonNullable: true }),/*
            nrOfSimSelfRefs: new FormControl(0, { nonNullable: true, validators: 
                [
                    Validators.required,
                    Validators.min(1),
                    Validators.max(this.validations.maxMinutes)
                ] 
            }),*/
            manual: new FormControl(false, { nonNullable: true }),
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
        this.structureNameService = new StructureNameService(new StartLocationMap(this.tournament.getCompetitors()));
        const startRoundNumber = this.structure.getRoundNumber(startRoundNumberAsValue);
        if (startRoundNumber === undefined) {
            this.setAlert(IAlertType.Danger, 'het rondenumber is niet gevonden');
            return;
        }
        this._changingStartRoundNumber.next(startRoundNumber);
    }

    initGameAmountConfigs(startRoundNumber: RoundNumber) {
        this.getValidGameAmountConfigs(startRoundNumber).forEach((gameAmountConfig: GameAmountConfig) => {
            this.typedForm.addControl('' + gameAmountConfig.getId(), new FormControl());
        });
        this.setGameAmountControls(startRoundNumber);
        this.gameAmountLabel = this.getGameAmountLabel(startRoundNumber.getCompetition().getSportVariants());
        this.updateUnequallyAssigned(startRoundNumber);
    }

    updateUnequallyAssigned(startRoundNumber: RoundNumber) {
        const distinctNrOfPlaces = this.getDistinctNrOfPlaces(startRoundNumber.createPouleStructure());

        const jsonGameAmountConfigs = this.formToJsonGameAmountConfigs();
        const againstGpps = this.jsonGameAmountConfigsToAgainstGpps(jsonGameAmountConfigs);
        this.unequallyAssigned = distinctNrOfPlaces.some((nrOfPlace: number): boolean => {
            return !(new EquallyAssignCalculator()).assignAgainstSportsEqually(nrOfPlace, againstGpps);
        });
    }

    protected getValidGameAmountConfigs(roundNumber: RoundNumber): GameAmountConfig[] {
        return this.competition.getSports().map(competitionSport => roundNumber.getValidGameAmountConfig(competitionSport));
    }

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
        this.gameAmountConfigControls = this.getValidGameAmountConfigs(startRoundNumber).
            map((gameAmountConfig: GameAmountConfig): GameAmountConfigControl => {
            const range = this.defaultService.getGameAmountRange(gameAmountConfig.getCompetitionSport().getVariant());
            return {
                json: this.gameAmountConfigMapper.toJson(gameAmountConfig),
                range: range,
                control: this.typedForm.controls['' + gameAmountConfig.getId()]
            };
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
        if (minutesPerGameExt === 0 && this.typedForm.controls.extension.value) {
            this.typedForm.controls.extension.setValue(false);
        }
        if (minutesPerGameExt > 0 && this.typedForm.controls.extension.value === false) {
            this.typedForm.controls.extension.setValue(true);
        }
    }

    changeExtension(extension: boolean) {
        if (extension && this.typedForm.controls.minutesPerGameExt.value === 0) {
            this.typedForm.controls.minutesPerGameExt.setValue(DefaultService.MinutesPerGameExt);
        }
        if (!extension && this.typedForm.controls.minutesPerGameExt.value > 0) {
            this.typedForm.controls.minutesPerGameExt.setValue(0);
        }
    }

    changedEditMode(modalContent: TemplateRef<any>) {
        if (this.typedForm.controls.manual.value) {
            this.openInfoModal('handmatig aanpassen', 'warning-modal', modalContent);
        }
    }

    // changeByPouleAndGameRoundNumber(byPouleAndGameRoundNumber: boolean) {
    //     this.showNrOfBatchGamesAlert = shownNrOfBatchGamesAlert === null && selfReferee;
    // }

    changeSelfReferee(selfReferee: boolean) {
        // this.typedForm.controls.nrOfSimSelfRefs.setValue(selfReferee ? 1 : 0);

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
        this.typedForm.controls.extension.setValue(json.extension);
        this.typedForm.controls.enableTime.setValue(json.enableTime);
        this.typedForm.controls.minutesPerGame.setValue(json.minutesPerGame);
        this.typedForm.controls.minutesPerGameExt.setValue(json.minutesPerGameExt);
        this.typedForm.controls.minutesBetweenGames.setValue(json.minutesBetweenGames);
        this.typedForm.controls.minutesAfter.setValue(json.minutesAfter);
        this.typedForm.controls.perPoule.setValue(json.perPoule);
        this.getValidGameAmountConfigs(this.startRoundNumber).forEach((gameAmountConfig: GameAmountConfig) => {
            const sportVariant = gameAmountConfig.getCompetitionSport().getVariant();
            const range = this.defaultService.getGameAmountRange(sportVariant);
            const id = '' + gameAmountConfig.getId();
            this.typedForm.controls[id].setValidators(
                Validators.compose([
                    Validators.required,
                    Validators.min(range.min),
                    Validators.max(range.max)])
            );
            this.typedForm.controls[id].setValue(gameAmountConfig.getAmount());
        });
        this.typedForm.controls.strategyRandomly.setValue(json.gamePlaceStrategy === GamePlaceStrategy.RandomlyAssigned);
        this.typedForm.controls.manual.setValue(json.editMode === PlanningEditMode.Manual);

        const selfRefee = this.getSelfReferee(json.selfReferee);
        this.typedForm.controls.selfReferee.setValue(selfRefee !== SelfReferee.Disabled);
        this.typedForm.controls.selfRefereeSamePoule.setValue(selfRefee === SelfReferee.SamePoule);
        // const nrOfSimSelfRefs = selfRefee === SelfReferee.Disabled ? 0 : json.nrOfSimSelfRefs;
        // this.typedForm.controls.nrOfSimSelfRefs.setValue(nrOfSimSelfRefs);

        Object.keys(this.typedForm.controls).forEach(key => {
            const control = this.typedForm.controls[key];
            this.hasBegun ? control.disable() : control.enable();
        });
        this.enableDisableSelfReferee();
    }

    private formToJson(): JsonPlanningConfig {
        const strategy = this.typedForm.controls.strategyRandomly.value ? GamePlaceStrategy.RandomlyAssigned : GamePlaceStrategy.EquallyAssigned;
        const noSelfReferee = this.typedForm.controls.selfReferee.disabled || !this.typedForm.value['selfReferee'];
        return {
            id: 0,
            editMode: this.typedForm.controls.manual.value ? PlanningEditMode.Manual : PlanningEditMode.Auto,
            gamePlaceStrategy: strategy,
            extension: this.typedForm.controls.extension.value,
            enableTime: this.typedForm.controls.enableTime.value,
            minutesPerGame: this.typedForm.controls.minutesPerGame.value,
            minutesPerGameExt: this.typedForm.controls.minutesPerGameExt.value,
            minutesBetweenGames: this.typedForm.controls.minutesBetweenGames.value,
            minutesAfter: this.typedForm.controls.minutesAfter.value,
            perPoule: this.typedForm.controls.perPoule.value,
            selfReferee: noSelfReferee ? SelfReferee.Disabled :
                (this.typedForm.value['selfRefereeSamePoule'] ? SelfReferee.SamePoule : SelfReferee.OtherPoules),
            nrOfSimSelfRefs: noSelfReferee ? 0 : 1
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

    private jsonGameAmountConfigsToAgainstGpps(jsonGameAmountConfigs: JsonGameAmountConfig[]): AgainstGpp[]
    {
        return jsonGameAmountConfigs.filter((jsonGameAmountConfig: JsonGameAmountConfig): boolean => {
            return jsonGameAmountConfig.competitionSport.gameMode === GameMode.Against
                && jsonGameAmountConfig.competitionSport.nrOfGamesPerPlace > 0;
        }).map((jsonGameAmountConfig: JsonGameAmountConfig): AgainstGpp => {
            const sport = this.sportMapper.toObject(jsonGameAmountConfig.competitionSport.sport);
             return new AgainstGpp(
                sport,
                jsonGameAmountConfig.competitionSport.nrOfHomePlaces,
                jsonGameAmountConfig.competitionSport.nrOfAwayPlaces,
                jsonGameAmountConfig.amount
                );
        });        
    }

    perPouleOptionAvailable(): boolean {
        if(this.competition.hasMultipleSports()) {
            return false;
        } 

        const sportVariant = this.competition.getSingleSport().getVariant();
        return sportVariant.getGameMode() === GameMode.Against;
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
        const againstGpps = this.getAgainstGppSportVariants(this.startRoundNumber);
        if( againstGpps.length === 0) {
            return false;
        }
        return  againstGpps.every((againstGpp: AgainstGpp): boolean => {
            return againstGpp.hasMultipleSidePlaces();
        });
    }

    getDistinctNrOfPlaces(pouleStructure: PouleStructure): number[] {
        const nrOfPlacesMap = new Map();
        return pouleStructure.filter((nrOfPlace: number): boolean => {
            if(nrOfPlacesMap.has(nrOfPlace)) {
                return false;
            }
            nrOfPlacesMap.set(nrOfPlace, true);
            return true;
        });
    }

    getAgainstGppSportVariants(roundNumber: RoundNumber): AgainstGpp[] {
        const sportVariants = this.getValidGameAmountConfigs(roundNumber).map(gameAmountConfig => gameAmountConfig.createVariant());
        const againstGpps = sportVariants.filter(
            (sportVariant: Single | AgainstH2h | AgainstGpp | AllInOneGame): boolean => {
                return sportVariant instanceof AgainstGpp;
            });
        return <AgainstGpp[]>againstGpps;
    }

    enableDisableSelfReferee() {
        if (this.someSelfRefereeOptionAvailable()) {
            if (this.typedForm.controls.selfReferee.disabled && !this.hasBegun) {
                this.typedForm.controls.selfReferee.enable();
            }
        } else if (this.typedForm.controls.selfReferee.disabled === false) {
            this.typedForm.controls.selfReferee.disable();
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
            this.planningRepository.create(this.structure, this.tournament)
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

    // @TODO CDK UPDATE
    getRoundNumbersName(startRoundNumber: RoundNumber): string {
        if (startRoundNumber.getNumber() === 1) {
            return 'alle ronden';
        }
        if (startRoundNumber.hasNext()) {
            return 'vanaf de ' + this.structureNameService.getRoundNumberName(startRoundNumber);
        }
        return 'alleen de ' + this.structureNameService.getRoundNumberName(startRoundNumber);
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
        if (config.getPerPoule() !== json.perPoule) {
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





