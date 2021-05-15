import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    NameService,
    RoundNumber,
    JsonPlanningConfig,
    CompetitorMap,
    PouleStructure,
    SelfReferee,
    GameMode,
    CompetitionSport,
    VoetbalRange,
    GameAmountConfigMapper,
    PlanningConfigMapper,
    JsonGameAmountConfig,
    Sport,
    GameAmountConfig,
    SingleSportVariant,
    AgainstGame,
    AgainstSportVariant,
    AllInOneGameSportVariant,
    GameCreationStrategyCalculator,
    GameCreationStrategy
} from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { PlanningConfigRepository } from '../../lib/ngx-sport/planning/config/repository';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RoundNumbersSelectorModalComponent } from '../roundnumber/selector.component';
import { DefaultService, GameAmountConfigValidations } from '../../lib/ngx-sport/defaultService';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { GameAmountConfigControl } from '../gameAmountConfig/edit.component';
import { GameAmountConfigRepository } from '../../lib/ngx-sport/gameAmountConfig/repository';
import { forkJoin, Observable } from 'rxjs';
import { GameModeInfoModalComponent } from '../../shared/tournament/gameMode/infomodal.component';

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
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => this.initConfig(+params.startRoundNumber));
        });
    }

    initConfig(startRoundNumberAsValue: number) {
        this.nameService = new NameService(new CompetitorMap(this.tournament.getCompetitors()));
        const startRoundNumber = this.structure.getRoundNumber(startRoundNumberAsValue);
        if (startRoundNumber === undefined) {
            this.setAlert('danger', 'het rondenumber is niet gevonden');
            return;
        }
        this.initGameAmountConfigs(startRoundNumber);
        this.changeStartRoundNumber(startRoundNumber);
        this.processing = false;
    }

    initGameAmountConfigs(startRoundNumber: RoundNumber) {
        startRoundNumber.getValidGameAmountConfigs().forEach((gameAmountConfig: GameAmountConfig) => {
            this.form.addControl('' + gameAmountConfig.getId(), new FormControl());
        });
        this.setGameAmountControls(startRoundNumber);
        this.gameAmountLabel = this.getGameAmountLabel(startRoundNumber.getCompetition().getSportVariants());
    }

    protected getCorrectAmount(
        sportVariant: SingleSportVariant | AgainstSportVariant | AllInOneGameSportVariant,
        gameAmountConfig: GameAmountConfig): number {
        if (sportVariant instanceof AgainstSportVariant && sportVariant.getNrOfGamePlaces() > 2) {
            return gameAmountConfig.getPartial();
        }
        return gameAmountConfig.getAmount();
    }

    isGameAmountEditable(): boolean {
        const calculator = new GameCreationStrategyCalculator();
        const strategy = calculator.calculate(this.competition.getSportVariants());
        return strategy === GameCreationStrategy.Static;
    }


    getGameAmountLabel(sportVariants: (SingleSportVariant | AgainstSportVariant | AllInOneGameSportVariant)[]): string {
        if (sportVariants.length > 1) {
            return 'aantal wedstrijden';
        }
        const sportVariant = sportVariants[0];
        if (sportVariant instanceof AgainstSportVariant) {
            return 'aantal onderlinge duels';
        }
        return 'aantal speelronden';
    }

    setGameAmountControls(startRoundNumber: RoundNumber) {
        startRoundNumber.getValidGameAmountConfigs().forEach((gameAmountConfig: GameAmountConfig) => {
            const range = this.defaultService.getGameAmountRange(gameAmountConfig.getCompetitionSport().getVariant());
            this.gameAmountConfigControls.push({
                json: this.gameAmountConfigMapper.toJson(gameAmountConfig),
                range: range,
                control: this.form.controls['' + gameAmountConfig.getId()]
            });
        });
    }

    changeStartRoundNumber(startRoundNumber: RoundNumber) {
        this.startRoundNumber = startRoundNumber;
        this.pouleStructure = startRoundNumber.createPouleStructure();
        this.hasBegun = this.startRoundNumber.hasBegun()
        this.jsonToForm(this.mapper.toJson(startRoundNumber.getValidPlanningConfig()));
        this.resetAlert();
        if (this.hasBegun) {
            this.setAlert('warning', 'er zijn wedstrijden gespeeld voor deze ronde, je kunt niet meer wijzigen');
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

    openGameModeInfoModal() {
        this.modalService.open(GameModeInfoModalComponent, { windowClass: 'info-modal' });
    }

    openInfoModal(header: string, modalContent: TemplateRef<any>) {
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
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
            this.form.controls[id].setValue(this.getCorrectAmount(sportVariant, gameAmountConfig));
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
            const nrOfGamePlaces = gameAmountConfigControl.json.competitionSport.nrOfHomePlaces +
                gameAmountConfigControl.json.competitionSport.nrOfAwayPlaces;
            let amount = gameAmountConfigControl.control.value;
            let partial = 0;
            if (nrOfGamePlaces > 2) {
                partial = gameAmountConfigControl.control.value;
                amount = 0;
            }
            return {
                id: gameAmountConfigControl.json.id,
                competitionSport: gameAmountConfigControl.json.competitionSport,
                amount, partial
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
        const compSports = this.competition.getSports();

        let selfRefereeAvailable = SelfReferee.Disabled;

        const sportVariants = compSports.map((compSport: CompetitionSport): SingleSportVariant | AgainstSportVariant | AllInOneGameSportVariant => compSport.getVariant());

        const otherPoulesAvailable = this.pouleStructure.isSelfRefereeOtherPoulesAvailable();
        if (otherPoulesAvailable) {
            selfRefereeAvailable += SelfReferee.OtherPoules;
        }
        const samePouleAvailable = this.pouleStructure.isSelfRefereeSamePouleAvailable(sportVariants);
        if (samePouleAvailable) {
            selfRefereeAvailable += SelfReferee.SamePoule;
        }
        return selfRefereeAvailable;
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



    save(): boolean {
        this.setAlert('info', 'instellingen worden opgeslagen');
        this.processing = true;

        const jsonConfig: JsonPlanningConfig = this.formToJson();
        const jsonGameAmountConfigs: JsonGameAmountConfig[] = this.formToJsonGameAmountConfigs();
        const planningActionCalculator = new PlanningActionCalculator(this.startRoundNumber);
        const planningAction = planningActionCalculator.getAction(jsonConfig, jsonGameAmountConfigs);

        this.planningConfigRepository.saveObject(jsonConfig, this.startRoundNumber, this.tournament)
            .subscribe(
                /* happy path */ configRes => {
                    console.log(planningActionCalculator.isGameAmountEditable());
                    if (planningActionCalculator.isGameAmountEditable()) {
                        this.saveGameAmountConfigs(jsonGameAmountConfigs, planningAction);
                    } else {
                        this.processing = false;
                    }
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
        console.log(jsonGameAmountConfigs);
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
        if (config.getSelfReferee() !== json.selfReferee) {
            return true
        }
        return this.gameAmountConfigsChanged(jsonGameAmountConfigs);
    }

    private gameAmountConfigsChanged(jsonGameAmountConfigs: JsonGameAmountConfig[]): boolean {
        if (!this.isGameAmountEditable()) {
            return false;
        }
        const getGameAmountConfig = (competitionSport: CompetitionSport): JsonGameAmountConfig | undefined => {
            return jsonGameAmountConfigs.find((jsonGameAmountConfigIt: JsonGameAmountConfig) => {
                return jsonGameAmountConfigIt.competitionSport.id === competitionSport.getId();
            });
        };
        return this.roundNumber.getCompetitionSports().some((competitionSport: CompetitionSport) => {
            const jsonGameAmountConfig = getGameAmountConfig(competitionSport);
            const gameAmountConfig = this.roundNumber.getGameAmountConfig(competitionSport);
            return jsonGameAmountConfig && gameAmountConfig
                && (jsonGameAmountConfig.amount !== gameAmountConfig.getAmount()
                    || jsonGameAmountConfig.partial !== gameAmountConfig.getPartial());
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

    isGameAmountEditable(): boolean {
        const calculator = new GameCreationStrategyCalculator();
        const strategy = calculator.calculate(this.roundNumber.getCompetition().getSportVariants());
        return strategy === GameCreationStrategy.Static;
    }

}

export interface PlanningConfigValidations {
    minMinutes: number;
    maxMinutes: number;
}

enum PlanningAction {
    None = 1, Reschedule, Recreate
}





