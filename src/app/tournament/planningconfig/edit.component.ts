import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    NameService,
    PlanningRepository,
    PlanningService,
    RoundNumber,
    StructureRepository,
    PlanningConfigService,
    PlanningConfigMapper,
    PlanningConfigRepository,
    JsonPlanningConfig,
} from 'ngx-sport';

import { MyNavigation } from '../../common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../component';
import { PlanningConfig } from 'ngx-sport/src/planning/config';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TournamentService } from '../../lib/tournament/service';

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

    private needsRecreating(): boolean {
        const config = this.roundNumber.getValidPlanningConfig();
        return this.form.value['nrOfHeadtohead'] !== config.getNrOfHeadtohead() || this.form.value['teamup'] !== config.getTeamup();
    }

    private needsRescheduling(): boolean {
        const config = this.roundNumber.getValidPlanningConfig();
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
            nrOfHeadtohead: this.form.value['nrOfHeadtohead'],
            enableTime: this.form.value['enableTime'],
            minutesPerGame: this.form.value['minutesPerGame'],
            minutesPerGameExt: this.form.value['minutesPerGameExt'],
            minutesBetweenGames: this.form.value['minutesBetweenGames'],
            minutesAfter: this.form.value['minutesAfter'],
            selfReferee: this.form.value['selfReferee'],
            teamup: this.form.controls.teamup.disabled ? false : this.form.value['teamup']
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

        this.configRepository.createObject(jsonConfig, this.roundNumber)
            .subscribe(
                /* happy path */ configRes => {
                    this.savePlanning();
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

        this.configRepository.editObject(jsonConfig, config)
            .subscribe(
                /* happy path */ configRes => {
                    this.savePlanning();
                },
                /* error path */ e => {
                    this.setAlert('danger', 'de instellingen zijn niet opgeslagen: ' + e);
                    this.processing = false;
                } // ,
                // /* onComplete */() => /*this.processing = false*/
            );

    }

    private savePlanning() {
        const tournamentService = new TournamentService(this.tournament);
        const planningService = new PlanningService(this.competition);
        if (this.needsRecreating()) {
            tournamentService.create(planningService, this.roundNumber);
            this.planningRepository.createObject(this.roundNumber)
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
        } else if (this.needsRescheduling()) {
            tournamentService.reschedule(planningService, this.roundNumber);
            this.planningRepository.editObject(this.roundNumber)
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
