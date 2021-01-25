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
} from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { PlanningConfigRepository } from '../../lib/ngx-sport/planning/config/repository';
import { Tournament } from '../../lib/tournament';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RoundNumbersSelectorModalComponent } from '../roundnumber/selector.component';
import { SportDefaultService } from '../../lib/ngx-sport/defaultService';
import { GameAmountConfig } from 'ngx-sport/src/planning/gameAmountConfig';

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
    private structureService: StructureService;
    public nameService: NameService;
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
        private myNavigation: MyNavigation,
        private planningRepository: PlanningRepository,
        private modalService: NgbModal,
        private fb: FormBuilder
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
            selfRefereeSamePoule: false,
            teamup: false
        });
        this.structureService = new StructureService(Tournament.PlaceRanges);
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => this.initConfig(+params.startRoundNumber));
        });
    }

    initConfig(startRoundNumberAsValue: number) {
        const startRoundNumber = this.structure.getRoundNumber(startRoundNumberAsValue);
        this.initGameAmountConfigs(startRoundNumber);
        this.changeStartRoundNumber(startRoundNumber);
        this.nameService = new NameService(new PlaceLocationMap(this.tournament.getCompetitors()));
        this.processing = false;
    }

    initGameAmountConfigs(startRoundNumber: RoundNumber) {
        let min = this.gameAmountValidations.minNrOfGames;
        let max = this.gameAmountValidations.maxNrOfGames;
        if (startRoundNumber.getValidPlanningConfig().getGameMode() === GameMode.Against) {
            min = this.gameAmountValidations.minNrOfHeadtohead;
            max = this.gameAmountValidations.maxNrOfHeadtohead;
        }
        startRoundNumber.getValidGameAmountConfigs().forEach((gameAmountConfig: GameAmountConfig) => {
            this.form.addControl('' + gameAmountConfig.getCompetitionSport().getId(), new FormControl(
                gameAmountConfig.getAmount(),
                Validators.compose([Validators.required, Validators.min(min), Validators.max(max)])
            ));
        });
        this.processing = false;
    }

    changeStartRoundNumber(startRoundNumber: RoundNumber) {
        this.startRoundNumber = startRoundNumber;
        this.pouleStructure = startRoundNumber.createPouleStructure();
        this.hasBegun = this.startRoundNumber.hasBegun()
        this.resetForm(startRoundNumber.getValidPlanningConfig());
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
            this.form.controls.minutesPerGameExt.setValue(SportDefaultService.MinutesPerGameExt);
        }
        if (!extension && this.form.controls.minutesPerGameExt.value > 0) {
            this.form.controls.minutesPerGameExt.setValue(0);
        }
    }

    getGameModeOptions(): GameModeOption[] {
        return [GameMode.Against, GameMode.Together].map((gameMode: GameMode): GameModeOption => {
            return { value: gameMode, name: this.nameService.getGameModeName(gameMode) };
        });
    }

    openInfoModal(modalContent) {
        const activeModal = this.modalService.open(modalContent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = 'uitleg met en tegen elkaar';
        activeModal.componentInstance.modalContent = modalContent;
        activeModal.result.then((result) => {
        }, (reason) => {

        });
    }

    private resetForm(config: PlanningConfig) {
        this.form.controls.gameMode.setValue(config.getGameMode());
        this.form.controls.extension.setValue(config.getExtension());
        this.form.controls.enableTime.setValue(config.getEnableTime());
        this.form.controls.minutesPerGame.setValue(config.getMinutesPerGame());
        this.form.controls.minutesPerGameExt.setValue(config.getMinutesPerGameExt());
        this.form.controls.minutesBetweenGames.setValue(config.getMinutesBetweenGames());
        this.form.controls.minutesAfter.setValue(config.getMinutesAfter());
        this.form.controls.teamup.setValue(this.isTeamupAvailable() && config.getTeamup());
        this.startRoundNumber.getValidGameAmountConfigs().forEach((gameAmountConfig: GameAmountConfig) => {
            const id = '' + gameAmountConfig.getCompetitionSport().getId();
            this.form.controls[id].setValue(gameAmountConfig.getAmount());
        });

        const selfRefee = this.getSelfReferee(config.getSelfReferee());
        this.form.controls.selfReferee.setValue(selfRefee !== SelfReferee.Disabled);
        const selfRefeeSamePoule = !(selfRefee && config.getSelfReferee() === SelfReferee.OtherPoules);
        this.form.controls.selfRefereeSamePoule.setValue(selfRefeeSamePoule);

        Object.keys(this.form.controls).forEach(key => {
            const control = this.form.controls[key];
            this.hasBegun ? control.disable() : control.enable();
        });

        this.changeSelfReferee();
        this.enableDisableSelfReferee();
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
        const sportConfigs = this.competition.getSportConfigs();

        let selfRefereeAvailable = SelfReferee.Disabled;

        const maxNrOfGamePlaces = this.sportConfigService.getMaxNrOfGamePlaces(sportConfigs, this.form.value['teamup'], false);
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

    changeSelfReferee() {
        if (this.isTeamupAvailable()) {
            if (this.form.controls.teamup.disabled && !this.hasBegun) {
                this.form.controls.teamup.enable();
            }
        } else if (this.form.controls.teamup.disabled === false) {
            this.form.controls.teamup.disable();
        }
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

    isTeamupAvailable(): boolean {
        const allTeamSports = this.competition.getSports().every((competitionSport: CompetitionSport): boolean => {
            return !competitionSport.getSport().getTeam();
        });
        if (allTeamSports === false) {
            return false;
        }

        const nrOfPlaces = this.startRoundNumber.getNrOfPlaces();
        const nrOfPoules = this.startRoundNumber.getPoules().length;
        const flooredNrOfPoulePlaces = this.structureService.getNrOfPlacesPerPoule(nrOfPlaces, nrOfPoules, true);
        const ceiledNrOfPoulePlaces = this.structureService.getNrOfPlacesPerPoule(nrOfPlaces, nrOfPoules, false);
        if (flooredNrOfPoulePlaces < PlanningConfig.Teamup_Min
            || ceiledNrOfPoulePlaces > PlanningConfig.Teamup_Max) {
            return false;
        }
        if (nrOfPoules === 1 && flooredNrOfPoulePlaces === PlanningConfig.Teamup_Min && this.form.value['selfReferee']) {
            return false;
        }
        return true;
    }

    isSelfRefereeAvailable(): boolean {
        return this.getSelfRefereeAvailable() !== SelfReferee.Disabled;
    }

    // TODOSPORT
    // private needsRecreating(config: PlanningConfig): boolean {
    //     return (this.form.value['nrOfHeadtohead'] !== config.getNrOfHeadtohead()) ||
    //         (this.isTeamupAvailable() && this.form.value['teamup'] !== config.getTeamup()) ||
    //         (this.isSelfRefereeAvailable() && this.form.value['selfReferee'] !== config.getSelfReferee());
    // }

    // getNrOfPlacesPerGame(): number {
    //     const sportConfigs = this.competition.getSportConfigs();
    //     return this.sportConfigService.getMaxNrOfGamePlaces(
    //         sportConfigs, this.form.value['teamup'], this.form.value['selfReferee']);
    // }

    // private needsRescheduling(config: PlanningConfig): boolean {
    //     return this.form.value['extension'] !== config.getExtension()
    //         || this.form.value['enableTime'] !== config.getEnableTime()
    //         || this.form.value['minutesPerGame'] !== config.getMinutesPerGame()
    //         || this.form.value['minutesPerGameExt'] !== config.getMinutesPerGameExt()
    //         || this.form.value['minutesBetweenGames'] !== config.getMinutesBetweenGames()
    //         || this.form.value['minutesAfter'] !== config.getMinutesAfter()
    //         || this.form.value['selfReferee'] !== config.getSelfReferee
    //         ;
    // }

    // save(): boolean {
    //     const jsonConfig: JsonPlanningConfig = {
    //         id: 0,
    //         extension: this.form.value['extension'],
    //         enableTime: this.form.value['enableTime'],
    //         minutesPerGame: this.form.value['minutesPerGame'],
    //         minutesPerGameExt: this.form.value['minutesPerGameExt'],
    //         minutesBetweenGames: this.form.value['minutesBetweenGames'],
    //         minutesAfter: this.form.value['minutesAfter'],
    //         selfReferee: (this.form.controls.selfReferee.disabled || !this.form.value['selfReferee']) ? SelfReferee.Disabled :
    //             (this.form.value['selfRefereeSamePoule'] ? SelfReferee.SamePoule : SelfReferee.OtherPoules)
    //     };
    //     if (this.startRoundNumber.getPlanningConfig() !== undefined) {
    //         this.edit(jsonConfig, this.startRoundNumber.getPlanningConfig());
    //     } else {
    //         this.add(jsonConfig);
    //     }
    //     return false;
    // }

    // add(jsonConfig: JsonPlanningConfig) {
    //     this.setAlert('info', 'instellingen worden opgeslagen');
    //     this.processing = true;

    //     this.planningConfigRepository.createObject(jsonConfig, this.startRoundNumber, this.tournament)
    //         .subscribe(
    //             /* happy path */ configRes => {
    //                 this.savePlanning(true, false);
    //             },
    //             /* error path */ e => {
    //                 this.setAlert('danger', 'de instellingen zijn niet opgeslagen: ' + e);
    //                 this.processing = false;
    //             } // ,
    //             // /* onComplete */() => /*this.processing = false*/
    //         );

    // }

    // edit(jsonConfig: JsonPlanningConfig, config: PlanningConfig) {
    //     this.setAlert('info', 'instellingen worden opgeslagen');
    //     this.processing = true;
    //     const needsRecreating = this.needsRecreating(config);
    //     const needsRescheduling = this.needsRescheduling(config);

    //     this.planningConfigRepository.editObject(jsonConfig, config, this.tournament)
    //         .subscribe(
    //             /* happy path */ configRes => {
    //                 this.savePlanning(needsRecreating, needsRescheduling);
    //             },
    //             /* error path */ e => {
    //                 this.setAlert('danger', 'de instellingen zijn niet opgeslagen: ' + e);
    //                 this.processing = false;
    //             } // ,
    //             // /* onComplete */() => /*this.processing = false*/
    //         );

    // }

    // private savePlanning(needsRecreating: boolean, needsRescheduling: boolean) {
    //     if (needsRecreating) {
    //         this.planningRepository.create(this.structure, this.tournament, this.startRoundNumber.getNumber())
    //             .subscribe(
    //                 /* happy path */ roundNumberOut => {
    //                     this.setAlert('success', 'de instellingen zijn opgeslagen');
    //                     this.myNavigation.back();
    //                 },
    //                 /* error path */ e => {
    //                     this.setAlert('danger', 'de instellingen zijn niet opgeslagen: ' + e); this.processing = false;
    //                 },
    //                 /* onComplete */() => this.processing = false
    //             );
    //     } else if (needsRescheduling) {
    //         this.planningRepository.reschedule(this.startRoundNumber, this.tournament)
    //             .subscribe(
    //                 /* happy path */ gamesRes => {
    //                     this.setAlert('success', 'de instellingen zijn opgeslagen');
    //                     this.myNavigation.back();
    //                 },
    //                 /* error path */ e => {
    //                     this.setAlert('danger', 'de instellingen zijn niet opgeslagen: ' + e); this.processing = false;
    //                 },
    //                     /* onComplete */() => this.processing = false
    //             );
    //     } else {
    //         this.processing = false;
    //         this.setAlert('success', 'de instellingen zijn opgeslagen');
    //     }
    // }

    // openModalSelectStartRoundNumber() {
    //     const modalRef = this.modalService.open(ModalRoundNumbersComponent);
    //     modalRef.componentInstance.structure = this.structure;
    //     modalRef.componentInstance.subject = 'de score-regels';
    //     modalRef.result.then((startRoundNumber: RoundNumber) => {
    //         this.changeStartRoundNumber(startRoundNumber);
    //     }, (reason) => { });
    // }
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