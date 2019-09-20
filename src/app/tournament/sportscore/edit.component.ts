import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Sport,
    SportConfig,
    SportConfigRepository,
    SportConfigService,
    SportCustom,
    SportPlanningConfigService,
    SportScoreConfigService,
    StructureRepository,
    FieldRepository,
    JsonField,
    PlanningRepository,
    PlanningService,
    SportScoreConfig,
    RoundNumber,
    JsonSportScoreConfig,
    SportScoreConfigRepository,
} from 'ngx-sport';
import { forkJoin } from 'rxjs';
import { CSSService } from '../../common/cssservice';
import { MyNavigation } from '../../common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../component';
import { TournamentService } from '../../lib/tournament/service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '../../lib/translate';
import { ModalRoundNumbersComponent } from '../roundnumber/selector.component';

@Component({
    selector: 'app-tournament-sportscore-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class SportScoreEditComponent extends TournamentComponent implements OnInit {
    form: FormGroup;
    sportConfig: SportConfig;
    sportConfigService: SportConfigService;
    translateService: TranslateService;
    scoreConfig: SportScoreConfig;
    roundNumber: RoundNumber;
    hasBegun: boolean;

    validations: SportScoreValidations = {
        minScore: 0,
        maxScore: 9999
    };

    constructor(
        private sportScoreConfigRepository: SportScoreConfigRepository,
        public cssService: CSSService,
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private myNavigation: MyNavigation,
        fb: FormBuilder,
        private modalService: NgbModal
    ) {

        super(route, router, tournamentRepository, structureRepository);
        this.translateService = new TranslateService();
        this.form = fb.group({
            max: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minScore),
                Validators.max(this.validations.maxScore)
            ])]
        });
        this.sportConfigService = new SportConfigService(new SportScoreConfigService(), new SportPlanningConfigService());
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params.sportConfigId !== undefined) {
                super.myNgOnInit(() => this.postInit(+params.sportConfigId), false);
            }
        });
    }

    private getSportConfigById(id: number): SportConfig {
        if (id === undefined || id === 0) {
            return undefined;
        }
        return this.competition.getSportConfigs().find(sportConfig => id === sportConfig.getId());
    }

    private postInit(id: number) {
        this.sportConfig = this.getSportConfigById(id);
        if (this.sportConfig === undefined) {
            this.processing = false;
            return;
        }

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
            this.setAlert('warning', 'er zijn al wedstrijden gespeeld, je kunt niet meer wijzigen');
        }
        this.processing = false;
    }

    openModal() {
        const modalRef = this.modalService.open(ModalRoundNumbersComponent);
        modalRef.componentInstance.structure = this.structure;
        modalRef.result.then((roundNumber: RoundNumber) => {
            this.setScoreConfig(roundNumber);
        }, (reason) => { this.setScoreConfig(); });
    }

    getInputName(): string {
        const max = this.form.value['max'];
        const maxNext = this.form.value['maxNext'];
        const scoreConfig = (maxNext === 0 && max > 0) ? this.scoreConfig : this.scoreConfig.getNext();
        return this.translateService.getScoreNameMultiple(scoreConfig);
    }

    getCalculateName(): string {
        const max = this.form.value['max'];
        const scoreConfig = (max > 0) ? this.scoreConfig : this.scoreConfig.getNext();
        return this.translateService.getScoreNameMultiple(scoreConfig);
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
            sportId: sport.getId(),
            direction: SportScoreConfig.UPWARDS,
            maximum: this.form.value['max']
        };
        if (this.form.controls.maxNext !== undefined) {
            json.next = {
                sportId: sport.getId(),
                direction: SportScoreConfig.UPWARDS,
                maximum: this.form.value['maxNext']
            };
        }
        return json;
    }

    add(): boolean {
        this.processing = true;
        this.setAlert('info', 'de score-instellingen worden gewijzigd');

        const sport = this.sportConfig.getSport();
        const json = this.getJson(sport);

        this.sportScoreConfigRepository.createObject(json, sport, this.roundNumber)
            .subscribe(
        /* happy path */ sportConfigRes => {
                    this.myNavigation.back();
                },
        /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
        /* onComplete */() => { this.processing = false; }
            );
        return false;
    }

    edit(scoreConfig: SportScoreConfig): boolean {
        this.processing = true;
        this.setAlert('info', 'de score-instellingen worden gewijzigd');

        const sport = this.sportConfig.getSport();
        const json = this.getJson(sport);

        this.sportScoreConfigRepository.editObject(json, scoreConfig)
            .subscribe(
        /* happy path */ configRes => {
                    this.myNavigation.back();
                },
        /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
        /* onComplete */() => { this.processing = false; }
            );
        return false;
    }
}

export interface SportScoreValidations {
    minScore: number;
    maxScore: number;
}
