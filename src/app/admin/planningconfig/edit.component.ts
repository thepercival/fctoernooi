import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    NameService,
    RoundNumber,
    PlanningConfig,
    PlanningConfigService,
    PlanningConfigMapper,
    JsonPlanningConfig,
    SportConfigService,
    StructureService,
    SportConfig,
} from 'ngx-sport';

import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { PlanningConfigRepository } from '../../lib/ngx-sport/planning/config/repository';
import { Tournament } from '../../lib/tournament';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalRoundNumbersComponent } from '../roundnumber/selector.component';

@Component({
    selector: 'app-planningconfig-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class PlanningConfigComponent extends TournamentComponent implements OnInit {
    headtoheadRange: number[];
    startRoundNumber: RoundNumber;
    hasBegun: boolean;
    form: FormGroup;
    private structureService: StructureService;
    validations: PlanningConfigValidations = {
        minNrOfHeadtohead: 1,
        maxNrOfHeadtohead: 4,
        minMinutesPerGame: 1,
        maxMinutesPerGame: 60,
    };

    constructor(
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        sructureRepository: StructureRepository,
        private planningConfigService: PlanningConfigService,
        private configRepository: PlanningConfigRepository,
        public nameService: NameService,
        private myNavigation: MyNavigation,
        private planningRepository: PlanningRepository,
        private sportConfigService: SportConfigService,
        private modalService: NgbModal,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, sructureRepository);
        this.form = fb.group({
            nrOfHeadtohead: ['', Validators.compose([
                Validators.required,
                Validators.minLength(this.validations.minNrOfHeadtohead),
                Validators.maxLength(this.validations.maxNrOfHeadtohead)
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
        this.structureService = new StructureService(Tournament.StructureOptions);
    }

    private initRanges() {
        this.headtoheadRange = [];
        for (let i = this.validations.minNrOfHeadtohead; i <= this.validations.maxNrOfHeadtohead; i++) {
            this.headtoheadRange.push(i);
        }
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => this.initConfig(+params.startRoundNumber));
        });
    }

    initConfig(startRoundNumberAsValue: number) {
        const startRoundNumber = this.structure.getRoundNumber(startRoundNumberAsValue);
        this.changeStartRoundNumber(startRoundNumber);
        this.initRanges();
        this.processing = false;
    }

    changeStartRoundNumber(startRoundNumber: RoundNumber) {
        this.startRoundNumber = startRoundNumber;
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
            const planningConfigService = new PlanningConfigService();
            this.form.controls.minutesPerGameExt.setValue(
                planningConfigService.getDefaultMinutesPerGameExt()
            );
        }
        if (!extension && this.form.controls.minutesPerGameExt.value > 0) {
            this.form.controls.minutesPerGameExt.setValue(0);
        }
    }

    private resetForm(config: PlanningConfig) {
        this.form.controls.nrOfHeadtohead.setValue(config.getNrOfHeadtohead());
        this.form.controls.extension.setValue(config.getExtension());
        this.form.controls.enableTime.setValue(config.getEnableTime());
        this.form.controls.minutesPerGame.setValue(config.getMinutesPerGame());
        this.form.controls.minutesPerGameExt.setValue(config.getMinutesPerGameExt());
        this.form.controls.minutesBetweenGames.setValue(config.getMinutesBetweenGames());
        this.form.controls.minutesAfter.setValue(config.getMinutesAfter());
        this.form.controls.teamup.setValue(this.isTeamupAvailable() && config.getTeamup());

        const selfRefee = this.getSelfReferee(config.getSelfReferee());
        this.form.controls.selfReferee.setValue(selfRefee !== PlanningConfig.SELFREFEREE_DISABLED);
        const selfRefeeSamePoule = !(selfRefee && config.getSelfReferee() === PlanningConfig.SELFREFEREE_OTHERPOULES);
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
        if (currentSelfReferee === PlanningConfig.SELFREFEREE_OTHERPOULES
            && (selfRefereeAvailable & PlanningConfig.SELFREFEREE_SAMEPOULE) === PlanningConfig.SELFREFEREE_SAMEPOULE) {
            return PlanningConfig.SELFREFEREE_SAMEPOULE;
        }
        if (currentSelfReferee === PlanningConfig.SELFREFEREE_SAMEPOULE
            && (selfRefereeAvailable & PlanningConfig.SELFREFEREE_OTHERPOULES) === PlanningConfig.SELFREFEREE_OTHERPOULES) {
            return PlanningConfig.SELFREFEREE_OTHERPOULES;
        }
        return PlanningConfig.SELFREFEREE_DISABLED;
    }

    bothSelfRefereeAvailable(): boolean {
        const selfRefereeAvailable = this.getSelfRefereeAvailable();
        console.log('bothSelfRefereeAvailable', selfRefereeAvailable === (PlanningConfig.SELFREFEREE_OTHERPOULES + PlanningConfig.SELFREFEREE_SAMEPOULE));
        console.log('selfRefereeAvailable', selfRefereeAvailable);
        return selfRefereeAvailable === (PlanningConfig.SELFREFEREE_OTHERPOULES + PlanningConfig.SELFREFEREE_SAMEPOULE);
    }

    protected getSelfRefereeAvailable(): number {
        const sportConfigs = this.competition.getSportConfigs();
        const nrOfPoules = this.startRoundNumber.getPoules().length;
        const nrOfPlaces = this.startRoundNumber.getNrOfPlaces();

        let selfRefereeAvailable = PlanningConfig.SELFREFEREE_DISABLED;

        const maxNrOfGamePlaces = this.sportConfigService.getMaxNrOfGamePlaces(sportConfigs, this.form.value['teamup'], false);
        const otherPoulesAvailable = this.planningConfigService.selfRefereeOtherPoulesAvailable(nrOfPoules);
        if (otherPoulesAvailable) {
            selfRefereeAvailable += PlanningConfig.SELFREFEREE_OTHERPOULES;
        }
        console.log('maxNrOfGamePlaces', maxNrOfGamePlaces);
        const samePouleAvailable = this.planningConfigService.selfRefereeSamePouleAvailable(nrOfPoules, nrOfPlaces, maxNrOfGamePlaces);
        if (samePouleAvailable) {
            selfRefereeAvailable += PlanningConfig.SELFREFEREE_SAMEPOULE;
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
        const allTeamSports = this.competition.getSports().every(sport => {
            return !sport.getTeam();
        });
        if (allTeamSports === false) {
            return false;
        }

        const nrOfPlaces = this.startRoundNumber.getNrOfPlaces();
        const nrOfPoules = this.startRoundNumber.getPoules().length;
        const flooredNrOfPoulePlaces = this.structureService.getNrOfPlacesPerPoule(nrOfPlaces, nrOfPoules, true);
        const ceiledNrOfPoulePlaces = this.structureService.getNrOfPlacesPerPoule(nrOfPlaces, nrOfPoules, false);
        if (flooredNrOfPoulePlaces < PlanningConfig.TEAMUP_MIN
            || ceiledNrOfPoulePlaces > PlanningConfig.TEAMUP_MAX) {
            return false;
        }
        if (nrOfPoules === 1 && flooredNrOfPoulePlaces === PlanningConfig.TEAMUP_MIN && this.form.value['selfReferee']) {
            return false;
        }
        return true;
    }

    isSelfRefereeAvailable(): boolean {
        return this.getSelfRefereeAvailable() !== PlanningConfig.SELFREFEREE_DISABLED;
    }

    private needsRecreating(config: PlanningConfig): boolean {
        return (this.form.value['nrOfHeadtohead'] !== config.getNrOfHeadtohead()) ||
            (this.isTeamupAvailable() && this.form.value['teamup'] !== config.getTeamup()) ||
            (this.isSelfRefereeAvailable() && this.form.value['selfReferee'] !== config.getSelfReferee());
    }

    getNrOfPlacesPerGame(): number {
        const sportConfigs = this.competition.getSportConfigs();
        return this.sportConfigService.getMaxNrOfGamePlaces(
            sportConfigs, this.form.value['teamup'], this.form.value['selfReferee']);
    }

    private needsRescheduling(config: PlanningConfig): boolean {
        return this.form.value['extension'] !== config.getExtension()
            || this.form.value['enableTime'] !== config.getEnableTime()
            || this.form.value['minutesPerGame'] !== config.getMinutesPerGame()
            || this.form.value['minutesPerGameExt'] !== config.getMinutesPerGameExt()
            || this.form.value['minutesBetweenGames'] !== config.getMinutesBetweenGames()
            || this.form.value['minutesAfter'] !== config.getMinutesAfter()
            || this.form.value['selfReferee'] !== config.getSelfReferee
            ;
    }

    save(): boolean {
        const jsonConfig: JsonPlanningConfig = {
            extension: this.form.value['extension'],
            enableTime: this.form.value['enableTime'],
            minutesPerGame: this.form.value['minutesPerGame'],
            minutesPerGameExt: this.form.value['minutesPerGameExt'],
            minutesBetweenGames: this.form.value['minutesBetweenGames'],
            minutesAfter: this.form.value['minutesAfter'],
            teamup: this.form.controls.teamup.disabled ? false : this.form.value['teamup'],
            selfReferee: (this.form.controls.selfReferee.disabled || !this.form.value['selfReferee']) ? PlanningConfig.SELFREFEREE_DISABLED :
                (this.form.value['selfRefereeSamePoule'] ? PlanningConfig.SELFREFEREE_SAMEPOULE : PlanningConfig.SELFREFEREE_OTHERPOULES),
            nrOfHeadtohead: this.form.value['nrOfHeadtohead']
        };
        console.log(jsonConfig.selfReferee);
        if (this.startRoundNumber.getPlanningConfig() !== undefined) {
            this.edit(jsonConfig, this.startRoundNumber.getPlanningConfig());
        } else {
            this.add(jsonConfig);
        }
        return false;
    }

    add(jsonConfig: JsonPlanningConfig) {
        this.setAlert('info', 'instellingen worden opgeslagen');
        this.processing = true;

        this.configRepository.createObject(jsonConfig, this.startRoundNumber, this.tournament)
            .subscribe(
                /* happy path */ configRes => {
                    this.savePlanning(true, false);
                },
                /* error path */ e => {
                    this.setAlert('danger', 'de instellingen zijn niet opgeslagen: ' + e);
                    this.processing = false;
                } // ,
                // /* onComplete */() => /*this.processing = false*/
            );

    }

    edit(jsonConfig: JsonPlanningConfig, config: PlanningConfig) {
        this.setAlert('info', 'instellingen worden opgeslagen');
        this.processing = true;
        const needsRecreating = this.needsRecreating(config);
        const needsRescheduling = this.needsRescheduling(config);

        this.configRepository.editObject(jsonConfig, config, this.tournament)
            .subscribe(
                /* happy path */ configRes => {
                    this.savePlanning(needsRecreating, needsRescheduling);
                },
                /* error path */ e => {
                    this.setAlert('danger', 'de instellingen zijn niet opgeslagen: ' + e);
                    this.processing = false;
                } // ,
                // /* onComplete */() => /*this.processing = false*/
            );

    }

    private savePlanning(needsRecreating: boolean, needsRescheduling: boolean) {
        if (needsRecreating) {
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
        } else if (needsRescheduling) {
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

    openModalSelectStartRoundNumber() {
        const modalRef = this.modalService.open(ModalRoundNumbersComponent);
        modalRef.componentInstance.structure = this.structure;
        modalRef.componentInstance.subject = 'de score-regels';
        modalRef.result.then((startRoundNumber: RoundNumber) => {
            this.changeStartRoundNumber(startRoundNumber);
        }, (reason) => { });
    }
}

export interface PlanningConfigValidations {
    minNrOfHeadtohead: number;
    maxNrOfHeadtohead: number;
    minMinutesPerGame: number;
    maxMinutesPerGame: number;
}
