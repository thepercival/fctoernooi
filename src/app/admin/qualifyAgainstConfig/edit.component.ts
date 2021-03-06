import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    NameService,
    QualifyAgainstConfig,
    JsonQualifyAgainstConfig,
    Structure,
    CompetitorMap,
    CompetitionSport,
    Round,
    QualifyAgainstConfigMapper,
    CompetitionSportMapper,
    GameMode,
    PointsCalculation,
    CustomSport,
} from 'ngx-sport';
import { CSSService } from '../../shared/common/cssservice';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Tournament } from '../../lib/tournament';
import { IAlert } from '../../shared/common/alert';
import { RoundsSelectorModalComponent, ToggleRound } from '../rounds/selector.component';
import { forkJoin, Observable } from 'rxjs';
import { QualifyAgainstConfigRepository } from '../../lib/ngx-sport/qualify/againstConfig/repository';
import { ToggleRoundConverter, ToggleRoundInittializer } from '../scoreConfig/edit.component';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-tournament-qualifyagainstconfig-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss']
})
export class QualifyAgainstConfigEditComponent implements OnInit {
    @Input() tournament!: Tournament;
    @Input() structure!: Structure;
    @Input() competitionSport!: CompetitionSport;

    alert: IAlert | undefined;
    processing: boolean = true;
    public nameService!: NameService;
    form: FormGroup;
    protected toggleRound!: ToggleRound;
    pointsCalculations: PointsCalculation[] = [];
    readonly: boolean = true;
    ranges: any = {};
    validations: QualifyAgainstValidations = {
        minWinPoints: 1,
        maxWinPoints: 10,
        minDrawPoints: 0,
        maxDrawPoints: 5,
        minLosePoints: 0,
        maxLosePoints: 5,
    };

    constructor(
        private qualifyAgainstConfigRepository: QualifyAgainstConfigRepository,
        public cssService: CSSService,
        private competitionSportMapper: CompetitionSportMapper,
        private mapper: QualifyAgainstConfigMapper,
        private router: Router,
        private modalService: NgbModal,
        fb: FormBuilder
    ) {
        this.form = fb.group({
            pointsCalculation: ['', Validators.compose([
                Validators.required
            ])],
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
            losePointsExt: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minLosePoints),
                Validators.max(this.validations.maxLosePoints)
            ])]
        });
    }

    ngOnInit() {
        this.nameService = new NameService(new CompetitorMap(this.tournament.getCompetitors()));
        this.initRanges();
        this.initToggleRound();
        this.processing = false;
    }

    initToggleRound() {
        const toggleRoundInittializer = new ToggleRoundInittializer(this.competitionSport,
            (round: Round, competitionSport: CompetitionSport) => {
                return round.getQualifyAgainstConfig(competitionSport);
            });
        this.pointsCalculations = [PointsCalculation.AgainstGamePoints, PointsCalculation.Scores, PointsCalculation.Both];
        this.toggleRound = toggleRoundInittializer.createToggleRound(this.structure.getRootRound());
        this.postToggleRoundChange();
    }

    // hasACustomQualifyAgainstConfig(round: Round): boolean {
    //     if (round.getQualifyAgainstConfig(this.competitionSport) !== undefined) {
    //         return true;
    //     }
    //     return round.getChildren().some((child: Round) => this.hasACustomQualifyAgainstConfig(child));
    // }

    protected postToggleRoundChange() {
        this.readonly = this.allSelectedToggleRoundsBegun(this.toggleRound);
        this.alert = undefined;
        if (this.selectedAgainstGameMode()) {
            if (this.readonly) {
                this.alert = { type: 'warning', message: 'er zijn wedstrijden gespeeld voor gekozen ronden, je kunt niet meer wijzigen' }
            } else if (this.someSelectedToggleRoundsBegun(this.toggleRound)) {
                this.alert = { type: 'warning', message: 'er zijn wedstrijden gespeeld voor sommige gekozen ronden, de score-regels hiervoor worden niet opgeslagen' }
            }
        }
        const json = this.getInputJson(this.getFirstSelectedToggleRound(this.toggleRound).round);
        this.jsonToForm(json);
    }

    linkToPlanningConfig() {
        this.router.navigate(['/admin/planningconfig', this.tournament.getId(),
            this.structure.getFirstRoundNumber().getNumber()
        ]);
    }

    selectedAgainstGameMode(): boolean {
        // TODOSPORTS
        return true;
        // const selectedAgainstGameMode = (toggleRound: ToggleRound): boolean => {
        //     if (toggleRound.selected && toggleRound.round.getNumber().getValidPlanningConfig().getGameMode() === GameMode.Against) {
        //         return true;
        //     }
        //     return toggleRound.children.some((child: ToggleRound) => selectedAgainstGameMode(child));
        // };
        // return selectedAgainstGameMode(this.toggleRound);
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
        this.ranges.losePoints = [];
        for (let i = this.validations.minLosePoints; i <= this.validations.maxLosePoints; i++) {
            this.ranges.losePoints.push(i);
        }
        const sport = this.competitionSport.getSport();
        if (sport.getCustomId() === CustomSport.Chess) {
            this.ranges.drawPoints.push(0.5);
            this.ranges.drawPoints.sort();
        }
    }

    /**
     * Bij het opslaan, kijken als ronden al begonnen zijn.
     * Kan ook eerder om dan aan de gebruiker te tonen
     * 
     * @param rounds 
     */
    protected getInputJson(round: Round): JsonQualifyAgainstConfig {
        const qualifyagainstConfig = round.getValidQualifyAgainstConfig(this.competitionSport);
        return this.mapper.toJson(qualifyagainstConfig);
    }

    protected jsonToForm(json: JsonQualifyAgainstConfig) {
        this.form.controls.pointsCalculation.setValue(json.pointsCalculation);
        this.form.controls.winPoints.setValue(json.winPoints);
        this.form.controls.drawPoints.setValue(json.drawPoints);
        this.form.controls.winPointsExt.setValue(json.winPointsExt);
        this.form.controls.drawPointsExt.setValue(json.drawPointsExt);
        this.form.controls.losePointsExt.setValue(json.losePointsExt);
    }

    protected formToJson(): JsonQualifyAgainstConfig {
        return {
            id: 0,
            competitionSport: this.competitionSportMapper.toJson(this.competitionSport),
            winPoints: this.form.value['winPoints'],
            drawPoints: this.form.value['drawPoints'],
            winPointsExt: this.form.value['winPointsExt'],
            drawPointsExt: this.form.value['drawPointsExt'],
            losePointsExt: this.form.value['losePointsExt'],
            pointsCalculation: this.form.value['pointsCalculation']
        };
    }

    openInfoModal(header: string, modalContent: TemplateRef<any>) {
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = header;
        activeModal.componentInstance.modalContent = modalContent;
    }

    getPointsCalculationDescription(pointsCalculation: PointsCalculation): string {
        switch (pointsCalculation) {
            case PointsCalculation.AgainstGamePoints:
                return 'alleen de punten van de wedstrijden worden opgeteld';
            case PointsCalculation.Scores:
                return 'alleen de score van de wedstrijden worden opgeteld';
        }
        return 'de punten en de score van de wedstrijden worden bij elkaar opgeteld ';
    }

    openSelectRoundsModal() {
        const modalRef = this.modalService.open(RoundsSelectorModalComponent);
        modalRef.componentInstance.structure = this.structure;
        modalRef.componentInstance.competitionSport = this.competitionSport;
        modalRef.componentInstance.toggleRound = this.toggleRound;
        modalRef.componentInstance.subject = 'de qualifyagainst-regels';
        modalRef.componentInstance.hasOwnConfig = (round: Round): boolean => {
            return round.getQualifyAgainstConfig(this.competitionSport) !== undefined;
        };
        modalRef.result.then((result: ToggleRound) => {
            this.toggleRound = result;
            this.postToggleRoundChange();
        }, (reason) => { });
    }

    allSelectedToggleRoundsBegun(toggleRound: ToggleRound): boolean {
        return toggleRound.round.getNumber().hasBegun() && toggleRound.children.every(child => {
            return this.allSelectedToggleRoundsBegun(child);
        });
    }

    someSelectedToggleRoundsBegun(toggleRound: ToggleRound): boolean {
        return toggleRound.round.getNumber().hasBegun() || toggleRound.children.some(child => {
            return this.someSelectedToggleRoundsBegun(child);
        });
    }

    getFirstSelectedToggleRound(toggleRound: ToggleRound): ToggleRound {
        if (toggleRound.selected) {
            return toggleRound;
        }
        const selected = toggleRound.children.find(child => {
            return this.getFirstSelectedToggleRound(child);
        });
        if (selected === undefined) {
            throw Error('at least one round should be selected');
        }
        return selected;
    }

    save(): boolean {
        this.alert = undefined;
        this.processing = true;

        const toggleRoundConverter = new ToggleRoundConverter();
        const roundsSelection = toggleRoundConverter.createRoundsSelection(this.toggleRound);

        // 1 koppel alle valid qualifyagainstregels van de unchangedChildRounds
        const validQualifyAgainstConfigs: ValidQualifyAgainstConfigOfUnchangedChildRound[] = [];
        roundsSelection.unchangedDescendants.forEach((unchangedChildRound: Round) => {
            const qualifyagainstConfig = unchangedChildRound.getValidQualifyAgainstConfig(this.competitionSport);
            const jsonQualifyAgainstConfig = this.mapper.toJson(qualifyagainstConfig);
            validQualifyAgainstConfigs.push({ unchangedChildRound, qualifyagainstConfig: jsonQualifyAgainstConfig });
        });

        // 2 verwijder en voeg de qualifyagainstregels toe van de rootRounds
        const reposUpdates: Observable<QualifyAgainstConfig>[] = roundsSelection.rootRounds.map((round: Round) => {
            return this.qualifyAgainstConfigRepository.saveObject(this.formToJson(), round, this.tournament);
        });
        forkJoin(reposUpdates).subscribe(results => {
            if (validQualifyAgainstConfigs.length === 0) {
                this.processing = false;
                return;
            }
            // 3 voeg de qualifyagainstregels toe van de unchangedChildRounds
            const reposChildUpdates: Observable<QualifyAgainstConfig>[] = validQualifyAgainstConfigs.map((validQualifyAgainstConfig: ValidQualifyAgainstConfigOfUnchangedChildRound) => {
                return this.qualifyAgainstConfigRepository.saveObject(validQualifyAgainstConfig.qualifyagainstConfig, validQualifyAgainstConfig.unchangedChildRound, this.tournament);
            });
            forkJoin(reposChildUpdates).subscribe(results => {
                this.processing = false;
            },
                e => {
                    this.alert = { type: 'danger', message: 'de qualifyagainstregels zijn niet opgeslagen: ' + e };
                    this.processing = false;
                });
        },
            e => {
                this.alert = { type: 'danger', message: 'de qualifyagainstregels zijn niet opgeslagen: ' + e };
                this.processing = false;
            });
        return true;
    }
}

interface QualifyAgainstValidations {
    minWinPoints: number;
    maxWinPoints: number;
    minDrawPoints: number;
    maxDrawPoints: number;
    minLosePoints: number;
    maxLosePoints: number;
}

interface ValidQualifyAgainstConfigOfUnchangedChildRound {
    unchangedChildRound: Round;
    qualifyagainstConfig: JsonQualifyAgainstConfig;
}