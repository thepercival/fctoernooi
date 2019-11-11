import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    Sport,
    SportConfig,
    SportConfigRepository,
    SportConfigService,
    SportCustom,
    SportScoreConfigService,
    StructureRepository,
    FieldRepository,
    JsonField,
    PlanningRepository,
} from 'ngx-sport';
import { forkJoin } from 'rxjs';
import { CSSService } from '../../common/cssservice';
import { MyNavigation } from '../../common/navigation';
import { TournamentRepository } from '../../lib/tournament/repository';
import { TournamentComponent } from '../component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-tournament-sportconfig-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class SportConfigEditComponent extends TournamentComponent implements OnInit {
    form: FormGroup;
    sportConfig: SportConfig;
    sportConfigService: SportConfigService;
    ranges: any = {};
    hasBegun: boolean;
    validations: SportValidations = {
        minWinPoints: 1,
        maxWinPoints: 10,
        minDrawPoints: 0,
        maxDrawPoints: 5,
        minMinutesPerGame: 0,
        maxMinutesPerGame: 60,
    };

    constructor(
        private sportConfigRepository: SportConfigRepository,
        public cssService: CSSService,
        route: ActivatedRoute,
        router: Router,
        tournamentRepository: TournamentRepository,
        structureRepository: StructureRepository,
        private fieldRepository: FieldRepository,
        private planningRepository: PlanningRepository,
        private myNavigation: MyNavigation,
        fb: FormBuilder,
        private modalService: NgbModal
    ) {

        // winPoints       zie oude form
        // drawPoints      zie oude form
        // winPointsExt        zie oude form
        // drawPointsExt       zie oude form
        // pointsCalculation   nieuw optie uit drie:  wedstrijdpunten, subscore, wedstrijdpunten + subscore???
        // nrOfGameCompetitors is 2, zonder form

        // EditPermissions, EmailAddresses
        // andere groep moet dan zijn getEditPermission, wanneer ingelogd, bij gewone view
        super(route, router, tournamentRepository, structureRepository);
        this.form = fb.group({
            winPoints: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minWinPoints),
                Validators.max(this.validations.maxWinPoints)
            ])],
            drawPoints: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minDrawPoints),
                Validators.max(this.validations.maxDrawPoints)
            ])],
            winPointsExt: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minWinPoints),
                Validators.max(this.validations.maxWinPoints)
            ])],
            drawPointsExt: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minDrawPoints),
                Validators.max(this.validations.maxDrawPoints)
            ])],
            nrOfFields: ['']
        });
        this.sportConfigService = new SportConfigService(new SportScoreConfigService());
    }

    initRanges() {
        this.ranges.winPoints = [];
        for (let i = this.validations.minWinPoints; i <= this.validations.maxWinPoints; i++) {
            this.ranges.winPoints.push(i);
        }
        this.ranges.drawPoints = [];
        for (let i = this.validations.minDrawPoints; i <= this.validations.maxDrawPoints; i++) {
            this.ranges.drawPoints.push(i);
        }
        const sport = this.sportConfig.getSport();
        if (sport.getCustomId() === SportCustom.Chess) {
            this.ranges.drawPoints.push(0.5);
            this.ranges.drawPoints.sort();
        }
        this.ranges.nrOfFields = [];
        for (let i = 0; i <= 5; i++) {
            this.ranges.nrOfFields.push(i);
        }
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
        this.hasBegun = this.structure.getRootRound().hasBegun();
        if (this.hasBegun) {
            this.setAlert('warning', 'er zijn al wedstrijden gespeeld, je kunt niet meer wijzigen');
        }
        this.sportConfig = this.getSportConfigById(id);
        if (this.sportConfig === undefined) {
            this.processing = false;
            return;
        }
        this.initForm();
        this.processing = false;
    }

    initForm() {
        this.initRanges();
        this.form.controls.winPoints.setValue(this.sportConfig.getWinPoints());
        this.form.controls.drawPoints.setValue(this.sportConfig.getDrawPoints());
        this.form.controls.winPointsExt.setValue(this.sportConfig.getWinPointsExt());
        this.form.controls.drawPointsExt.setValue(this.sportConfig.getDrawPointsExt());
        this.form.controls.nrOfFields.setValue(1);
        if (this.hasBegun) {
            Object.keys(this.form.controls).forEach(key => {
                this.form.controls[key].disable();
            });
        }
    }

    onGetSport(sport: Sport) {
        this.sportConfig = this.sportConfigService.createDefault(sport, this.competition, this.structure);
        this.initForm();
    }

    save(): boolean {
        if (this.sportConfig.getId() === undefined) {
            return this.add();
        }
        return this.edit();
    }

    add(): boolean {
        this.processing = true;
        this.setAlert('info', 'de sport wordt gewijzigd');

        this.sportConfig.setWinPoints(this.form.value['winPoints']);
        this.sportConfig.setDrawPoints(this.form.value['drawPoints']);
        this.sportConfig.setWinPointsExt(this.form.value['winPointsExt']);
        this.sportConfig.setDrawPointsExt(this.form.value['drawPointsExt']);

        this.sportConfigRepository.createObject(this.sportConfig, this.competition)
            .subscribe(
                /* happy path */ sportConfigRes => {
                    const fieldReposAdds = [];
                    for (let i = 0; i < this.form.value['nrOfFields']; i++) {
                        const fieldNr = this.competition.getFields().length + i + 1;
                        const jsonField: JsonField = { number: fieldNr, name: '' + fieldNr, sportId: this.sportConfig.getSport().getId() };
                        fieldReposAdds.push(this.fieldRepository.createObject(jsonField, this.competition));
                    }

                    forkJoin(fieldReposAdds).subscribe(results => {
                        const firstRoundNumber = this.structure.getFirstRoundNumber();
                        this.planningRepository.createObject(firstRoundNumber, this.tournament.getBreak()).subscribe(
                    /* happy path */ gamesRes => {
                                this.linkToSportConfig(); /* niet navigate back van kan van sport komen */
                                this.processing = false;
                            },
                    /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
                    /* onComplete */() => this.processing = false
                        );
                    },
                        err => {
                            this.processing = false;
                            this.setAlert('danger', 'de wedstrijd is niet opgeslagen: ' + err);
                        }
                    );
                },
        /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
        /* onComplete */() => { this.processing = false; }
            );
        return false;
    }

    edit(): boolean {
        this.processing = true;
        this.setAlert('info', 'de sport wordt gewijzigd');

        this.sportConfig.setWinPoints(this.form.value['winPoints']);
        this.sportConfig.setDrawPoints(this.form.value['drawPoints']);
        this.sportConfig.setWinPointsExt(this.form.value['winPointsExt']);
        this.sportConfig.setDrawPointsExt(this.form.value['drawPointsExt']);

        this.sportConfigRepository.editObject(this.sportConfig, this.competition)
            .subscribe(
            /* happy path */ sportConfigRes => {
                    this.linkToSportConfig(); /* niet navigate back van kan van sport komen */
                },
            /* error path */ e => { this.setAlert('danger', e); this.processing = false; },
            /* onComplete */() => { this.processing = false; }
            );
        return false;
    }

    navigateBack() {
        this.myNavigation.back();
    }

    linkToSportConfig() {
        if (!this.competition.hasMultipleSportConfigs()) {
            this.router.navigate(['/toernooi/sportconfigedit'
                , this.tournament.getId(), this.competition.getFirstSportConfig().getId()]);
        } else {
            this.router.navigate(['/toernooi/sportconfigs', this.tournament.getId()]);
        }
    }

    openMultiSportsModal(content) {
        this.modalService.open(content, { ariaLabelledBy: 'modal-multisports' }).result.then((result) => {
            if (result === 'continue') {
                this.router.navigate(['/toernooi/sportconfigs', this.tournament.getId()]);
            }
        }, (reason) => { });
    }
}

export interface SportValidations {
    minWinPoints: number; // 1
    maxWinPoints: number; // 10
    minDrawPoints: number; // 0
    maxDrawPoints: number; // 5
    minMinutesPerGame: number; // 0
    maxMinutesPerGame: number; // 60
}
