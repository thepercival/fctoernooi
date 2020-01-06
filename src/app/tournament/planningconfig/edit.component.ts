import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    NameService,
    RoundNumber,
    PlanningConfig,
    PlanningConfigService,
    PlanningConfigMapper,
    JsonPlanningConfig,
} from 'ngx-sport';

import { MyNavigation } from '../../common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PlanningRepository } from '../../lib/ngx-sport/planning/repository';
import { PlanningConfigRepository } from '../../lib/ngx-sport/planning/config/repository';

@Component({
    selector: 'app-planningconfig-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class PlanningConfigComponent extends TournamentComponent implements OnInit {

    ranges: any = {};
    roundNumber: RoundNumber;
    form: FormGroup;
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
        private configRepository: PlanningConfigRepository,
        public nameService: NameService,
        private myNavigation: MyNavigation,
        private planningRepository: PlanningRepository,
        fb: FormBuilder
    ) {
        super(route, router, tournamentRepository, sructureRepository);
        this.form = fb.group({
            nrOfHeadtohead: ['', Validators.compose([
                Validators.required,
                Validators.minLength(this.validations.minNrOfHeadtohead),
                Validators.maxLength(this.validations.maxNrOfHeadtohead)
            ])],
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
                Validators.min(this.validations.minMinutesPerGame),
                Validators.max(this.validations.maxMinutesPerGame)
            ])],
            minutesAfter: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minMinutesPerGame),
                Validators.max(this.validations.maxMinutesPerGame)
            ])],
            selfReferee: false,
            teamup: false
        });
    }

    private initRanges() {
        this.ranges.nrOfHeadtohead = [];
        for (let i = this.validations.minNrOfHeadtohead; i <= this.validations.maxNrOfHeadtohead; i++) {
            this.ranges.nrOfHeadtohead.push(i);
        }
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            super.myNgOnInit(() => this.initConfig(+params.roundNumber));
        });
    }

    initConfig(roundNumberAsValue: number) {
        const roundNumber = this.structure.getRoundNumber(roundNumberAsValue);
        this.changeRoundNumber(roundNumber);
        this.initRanges();
        this.processing = false;
    }

    changeRoundNumber(roundNumber: RoundNumber) {
        this.roundNumber = roundNumber;
        this.resetForm(roundNumber.getValidPlanningConfig());
        this.setAlert('info', 'instellingen gelden ook voor volgende ronden');
        if (this.roundNumber.hasBegun()) {
            this.setAlert('warning', 'er zijn wedstrijden gespeeld voor deze ronde, je kunt niet meer wijzigen');
        }
    }

    private resetForm(config: PlanningConfig) {
        this.form.controls.nrOfHeadtohead.setValue(config.getNrOfHeadtohead());
        this.form.controls.enableTime.setValue(config.getEnableTime());
        this.form.controls.minutesPerGame.setValue(config.getMinutesPerGame());
        this.form.controls.minutesPerGameExt.setValue(config.getMinutesPerGameExt());
        this.form.controls.minutesBetweenGames.setValue(config.getMinutesBetweenGames());
        this.form.controls.minutesAfter.setValue(config.getMinutesAfter());
        this.form.controls.selfReferee.setValue(config.getSelfReferee());
        this.form.controls.teamup.setValue(this.isTeamupAvailable() && config.getTeamup());
        if (!this.isTeamupAvailable()) {
            this.form.controls.teamup.disable();
        }
        this.form.controls.selfReferee.setValue(this.isSelfRefereeAvailable() && config.getSelfReferee());
        if (!this.isSelfRefereeAvailable()) {
            this.form.controls.selfReferee.disable();
        }

        if (this.roundNumber.hasBegun()) {
            Object.keys(this.form.controls).forEach(key => {
                this.form.controls[key].disable();
            });
        }
    }

    isTeamupAvailable(): boolean {
        return this.competition.getSports().every(sport => {
            return !sport.getTeam();
        });
    }

    isSelfRefereeAvailable(): boolean {
        return this.roundNumber.getNrOfPlaces() > 2;
    }

    private needsRecreating(config: PlanningConfig): boolean {
        return (this.form.value['nrOfHeadtohead'] !== config.getNrOfHeadtohead()) ||
            (this.isTeamupAvailable() && this.form.value['teamup'] !== config.getTeamup()) ||
            (this.isSelfRefereeAvailable() && this.form.value['selfreferee'] !== config.getSelfReferee());
    }

    private needsRescheduling(config: PlanningConfig): boolean {
        return this.form.value['enableTime'] !== config.getEnableTime()
            || this.form.value['minutesPerGame'] !== config.getMinutesPerGame()
            || this.form.value['minutesPerGameExt'] !== config.getMinutesPerGameExt()
            || this.form.value['minutesBetweenGames'] !== config.getMinutesBetweenGames()
            || this.form.value['minutesAfter'] !== config.getMinutesAfter()
            || this.form.value['selfReferee'] !== config.getSelfReferee
            ;
    }

    save(): boolean {
        const jsonConfig: JsonPlanningConfig = {
            enableTime: this.form.value['enableTime'],
            minutesPerGame: this.form.value['minutesPerGame'],
            minutesPerGameExt: this.form.value['minutesPerGameExt'],
            minutesBetweenGames: this.form.value['minutesBetweenGames'],
            minutesAfter: this.form.value['minutesAfter'],
            teamup: this.form.controls.teamup.disabled ? false : this.form.value['teamup'],
            selfReferee: this.form.controls.selfReferee.disabled ? false : this.form.value['selfReferee'],
            nrOfHeadtohead: this.form.value['nrOfHeadtohead']
        };
        if (this.roundNumber.getPlanningConfig() !== undefined) {
            this.edit(jsonConfig, this.roundNumber.getPlanningConfig());
        } else {
            this.add(jsonConfig);
        }
        return false;
    }

    add(jsonConfig: JsonPlanningConfig) {
        this.setAlert('info', 'instellingen worden opgeslagen');
        this.processing = true;

        this.configRepository.createObject(jsonConfig, this.roundNumber, this.tournament)
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
        console.log('needsRecreating: ', needsRecreating);
        console.log('needsRescheduling: ', needsRescheduling);

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
            this.planningRepository.createObject(this.roundNumber, this.tournament)
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
            this.planningRepository.editObject(this.roundNumber, this.tournament)
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
}

export interface PlanningConfigValidations {
    minNrOfHeadtohead: number;
    maxNrOfHeadtohead: number;
    minMinutesPerGame: number;
    maxMinutesPerGame: number;
}
