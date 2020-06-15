import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Sport,
    SportConfig,
    SportConfigService,
    SportCustom,
    SportScoreConfigService,
    JsonField,
    SportScoreConfig,
    RoundNumber,
    JsonSportScoreConfig,
    SportMapper,
    Structure,
} from 'ngx-sport';
import { forkJoin } from 'rxjs';
import { CSSService } from '../../shared/common/cssservice';
import { MyNavigation } from '../../shared/common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { StructureRepository } from '../../lib/ngx-sport/structure/repository';
import { TournamentComponent } from '../../shared/tournament/component';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '../../lib/translate';
import { SportScoreConfigRepository } from '../../lib/ngx-sport/sport/scoreconfig/repository';
import { ModalRoundNumbersComponent } from '../roundnumber/selector.component';
import { Tournament } from '../../lib/tournament';
import { IAlert } from '../../shared/common/alert';

@Component({
    selector: 'app-tournament-sportscore-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class SportScoreEditComponent implements OnInit {

    alert: IAlert;
    processing: boolean;
    @Input() tournament: Tournament;
    @Input() structure: Structure;
    @Input() sportConfig: SportConfig;
    @Input() hasBegun: boolean;

    form: FormGroup;
    translateService: TranslateService;
    scoreConfig: SportScoreConfig;
    roundNumber: RoundNumber;

    validations: SportScoreValidations = {
        minScore: 0,
        maxScore: 9999
    };

    constructor(
        private sportScoreConfigRepository: SportScoreConfigRepository,
        public cssService: CSSService,
        private myNavigation: MyNavigation,
        public sportConfigService: SportConfigService,
        private sportMapper: SportMapper,
        fb: FormBuilder,
        private modalService: NgbModal
    ) {
        this.translateService = new TranslateService();
        this.form = fb.group({
            useNext: false,
            max: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minScore),
                Validators.max(this.validations.maxScore)
            ])]
        });
    }

    ngOnInit() {
        if (this.structure.getFirstRoundNumber().hasNext()) {
            this.openModal();
        } else {
            this.setScoreConfig();
        }
    }

    setScoreConfig(roundNumber?: RoundNumber) {
        if (roundNumber === undefined) {
            roundNumber = this.structure.getFirstRoundNumber();
        }
        this.roundNumber = roundNumber;
        this.scoreConfig = roundNumber.getValidSportScoreConfig(this.sportConfig.getSport());

        this.form.controls.max.setValue(this.scoreConfig.getMaximum());
        if (this.scoreConfig.hasNext()) {
            this.form.controls.useNext.setValue(this.scoreConfig.getNext().getEnabled());
            this.form.addControl('maxNext', new FormControl(
                this.scoreConfig.getNext().getMaximum(),
                Validators.compose([
                    Validators.required,
                    Validators.min(this.validations.minScore),
                    Validators.max(this.validations.maxScore)
                ])
            ));
        }
        if (this.roundNumber.hasBegun()) {
            Object.keys(this.form.controls).forEach(key => {
                this.form.controls[key].disable();
            });
            this.alert = { type: 'warning', message: 'er zijn al wedstrijden gespeeld, je kunt niet meer wijzigen' };
        } else {
            this.alert = { type: 'info', message: 'instellingen gelden ook voor x-ste ronde en verder' };
            this.onChanges();
        }

        this.processing = false;
    }

    onChanges(): void {
        this.form.get('useNext').valueChanges.subscribe(val => {
            this.form.get('max').clearValidators();
            const minScore = this.validations.minScore + (val ? 1 : 0);
            this.form.get('max').setValidators(
                Validators.compose([
                    Validators.required,
                    Validators.min(minScore),
                    Validators.max(this.validations.maxScore)
                ]));
            if (this.form.get('max').value === 0) {
                this.form.get('max').setErrors({ 'invalid': true });
            }
        });
    }

    openModal() {
        const modalRef = this.modalService.open(ModalRoundNumbersComponent);
        modalRef.componentInstance.structure = this.structure;
        modalRef.result.then((roundNumber: RoundNumber) => {
            this.setScoreConfig(roundNumber);
        }, (reason) => { this.setScoreConfig(); });
    }

    save(): boolean {
        const scoreConfig = this.roundNumber.getSportScoreConfig(this.sportConfig.getSport());
        if (scoreConfig === undefined) {
            return this.add();
        }
        return this.edit(scoreConfig);
    }

    protected getJson(sport: Sport): JsonSportScoreConfig {
        const json: JsonSportScoreConfig = {
            sport: this.sportMapper.toJson(sport),
            direction: SportScoreConfig.UPWARDS,
            maximum: this.form.value['max'],
            enabled: true
        };
        if (this.form.controls.maxNext !== undefined) {
            json.next = {
                sport: this.sportMapper.toJson(sport),
                direction: SportScoreConfig.UPWARDS,
                maximum: this.form.value['maxNext'],
                enabled: this.form.value['useNext']
            };
        }
        return json;
    }

    add(): boolean {
        this.processing = true;

        const sport = this.sportConfig.getSport();
        const json = this.getJson(sport);

        this.sportScoreConfigRepository.createObject(json, sport, this.roundNumber, this.tournament)
            .subscribe(
        /* happy path */ sportConfigRes => {
                    this.myNavigation.back();
                },
        /* error path */ e => { this.alert = { type: 'danger', message: e }; this.processing = false; },
        /* onComplete */() => { this.processing = false; }
            );
        return false;
    }

    edit(scoreConfig: SportScoreConfig): boolean {
        this.processing = true;

        const sport = this.sportConfig.getSport();
        const json = this.getJson(sport);

        this.sportScoreConfigRepository.editObject(json, scoreConfig, this.tournament)
            .subscribe(
        /* happy path */ configRes => {
                    this.myNavigation.back();
                },
        /* error path */ e => { this.alert = { type: 'danger', message: e }; this.processing = false; },
        /* onComplete */() => { this.processing = false; }
            );
        return false;
    }
}

export interface SportScoreValidations {
    minScore: number;
    maxScore: number;
}
