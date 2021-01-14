import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Sport,
    NameService,
    ScoreConfig,
    RoundNumber,
    JsonScoreConfig,
    SportMapper,
    Structure,
    PlaceLocationMap,
    CompetitionSport,
} from 'ngx-sport';
import { CSSService } from '../../shared/common/cssservice';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '../../lib/translate';
import { ScoreConfigRepository } from '../../lib/ngx-sport/sport/scoreconfig/repository';
import { ModalRoundNumbersComponent } from '../roundnumber/selector.component';
import { Tournament } from '../../lib/tournament';
import { IAlert } from '../../shared/common/alert';

@Component({
    selector: 'app-tournament-scoreconfig-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class ScoreConfigEditComponent implements OnInit {

    alert: IAlert;
    processing: boolean;
    @Input() tournament: Tournament;
    @Input() structure: Structure;
    @Input() competitionSport: CompetitionSport;
    @Input() startRoundNumber: RoundNumber;
    public hasBegun: boolean;
    public nameService: NameService;

    form: FormGroup;
    translateService: TranslateService;
    scoreConfig: ScoreConfig;

    validations: ScoreValidations = {
        minScore: 0,
        maxScore: 9999
    };

    constructor(
        private ScoreConfigRepository: ScoreConfigRepository,
        public cssService: CSSService,
        // public sportConfigService: SportConfigService,
        private sportMapper: SportMapper,
        fb: FormBuilder,
        private modalService: NgbModal
    ) {
        // this.translateService = new TranslateService();
        // this.form = fb.group({
        //     useNext: false,
        //     max: ['', Validators.compose([
        //         Validators.required,
        //         Validators.min(this.validations.minScore),
        //         Validators.max(this.validations.maxScore)
        //     ])]
        // });
        // this.onChanges();
    }

    ngOnInit() {
        // this.nameService = new NameService(new PlaceLocationMap(this.tournament.getCompetitors()));
        // this.changeStartRoundNumber(this.startRoundNumber);
    }

    // changeStartRoundNumber(startRoundNumber?: RoundNumber) {
    //     this.alert = undefined;
    //     if (startRoundNumber === undefined) {
    //         startRoundNumber = this.structure.getFirstRoundNumber();
    //     }
    //     this.startRoundNumber = startRoundNumber;
    //     this.hasBegun = this.startRoundNumber.hasBegun();
    //     this.scoreConfig = startRoundNumber.getValidScoreConfig(this.sportConfig.getSport());

    //     this.form.controls.max.setValue(this.scoreConfig.getMaximum());
    //     if (this.scoreConfig.hasNext()) {
    //         this.form.controls.useNext.setValue(this.scoreConfig.getNext().getEnabled());
    //         this.form.addControl('maxNext', new FormControl(
    //             this.scoreConfig.getNext().getMaximum(),
    //             Validators.compose([
    //                 Validators.required,
    //                 Validators.min(this.validations.minScore),
    //                 Validators.max(this.validations.maxScore)
    //             ])
    //         ));
    //     }

    //     if (this.hasBegun) {
    //         this.alert = { type: 'warning', message: 'er zijn al wedstrijden gespeeld, je kunt niet meer wijzigen' };
    //     }
    //     Object.keys(this.form.controls).forEach(key => {
    //         const control = this.form.controls[key];
    //         this.hasBegun ? control.disable() : control.enable();
    //     });

    //     this.processing = false;
    // }

    // onChanges(): void {
    //     this.form.get('useNext').valueChanges.subscribe(val => {
    //         this.form.get('max').clearValidators();
    //         const minScore = this.validations.minScore + (val ? 1 : 0);
    //         this.form.get('max').setValidators(
    //             Validators.compose([
    //                 Validators.required,
    //                 Validators.min(minScore),
    //                 Validators.max(this.validations.maxScore)
    //             ]));
    //         if (this.form.get('max').value === 0) {
    //             this.form.get('max').setErrors({ 'invalid': true });
    //         }
    //     });
    // }

    // openModalSelectStartRoundNumber() {
    //     const modalRef = this.modalService.open(ModalRoundNumbersComponent);
    //     modalRef.componentInstance.structure = this.structure;
    //     modalRef.componentInstance.subject = 'de score-regels';
    //     modalRef.result.then((startRoundNumber: RoundNumber) => {
    //         this.changeStartRoundNumber(startRoundNumber);
    //     }, (reason) => { });
    // }

    // save(): boolean {
    //     this.alert = undefined;
    //     const scoreConfig = this.startRoundNumber.getScoreConfig(this.sportConfig.getSport());
    //     if (scoreConfig === undefined) {
    //         return this.add();
    //     }
    //     return this.edit(scoreConfig);
    // }

    // protected getJson(sport: Sport): JsonScoreConfig {
    //     const json: JsonScoreConfig = {
    //         id: 0,
    //         sport: this.sportMapper.toJson(sport),
    //         direction: ScoreConfig.UPWARDS,
    //         maximum: this.form.value['max'],
    //         enabled: true
    //     };
    //     if (this.form.controls.maxNext !== undefined) {
    //         json.next = {
    //             id: 0,
    //             sport: this.sportMapper.toJson(sport),
    //             direction: ScoreConfig.UPWARDS,
    //             maximum: this.form.value['maxNext'],
    //             enabled: this.form.value['useNext']
    //         };
    //     }
    //     return json;
    // }

    // add(): boolean {
    //     this.processing = true;

    //     const sport = this.sportConfig.getSport();
    //     const json = this.getJson(sport);

    //     this.ScoreConfigRepository.createObject(json, sport, this.startRoundNumber, this.tournament)
    //         .subscribe(
    //     /* happy path */ sportConfigRes => {
    //             },
    //     /* error path */ e => { this.alert = { type: 'danger', message: e }; this.processing = false; },
    //     /* onComplete */() => { this.processing = false; }
    //         );
    //     return false;
    // }

    // edit(scoreConfig: ScoreConfig): boolean {
    //     this.processing = true;

    //     const sport = this.sportConfig.getSport();
    //     const json = this.getJson(sport);

    //     this.ScoreConfigRepository.editObject(json, scoreConfig, this.tournament)
    //         .subscribe(
    //     /* happy path */ configRes => {
    //             },
    //     /* error path */ e => { this.alert = { type: 'danger', message: e }; this.processing = false; },
    //     /* onComplete */() => { this.processing = false; }
    //         );
    //     return false;
    // }
}

export interface ScoreValidations {
    minScore: number;
    maxScore: number;
}