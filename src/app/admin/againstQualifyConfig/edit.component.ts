import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
    NameService,
    AgainstQualifyConfig,
    JsonAgainstQualifyConfig,
    Structure,
    CompetitionSport,
    Round,
    AgainstQualifyConfigMapper,
    CompetitionSportMapper,
    PointsCalculation,
    CustomSport,
} from 'ngx-sport';
import { CSSService } from '../../shared/common/cssservice';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Tournament } from '../../lib/tournament';
import { IAlert, IAlertType } from '../../shared/common/alert';
import { RoundsSelectorModalComponent, SelectableCategory, SelectableRoundNode } from '../rounds/selector.component';
import { forkJoin, Observable } from 'rxjs';
import { AgainstQualifyConfigRepository } from '../../lib/ngx-sport/againstQualifyConfig/repository';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { Router } from '@angular/router';
import { RoundsSelection, SelectableCategoriesCreator, SelectableCategoryConverter } from '../scoreConfig/edit.component';

@Component({
    selector: 'app-tournament-qualifyagainstconfig-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss']
})
export class AgainstQualifyConfigEditComponent implements OnInit {
    @Input() tournament!: Tournament;
    @Input() structure!: Structure;
    @Input() competitionSport!: CompetitionSport;

    alert: IAlert | undefined;
    processing: boolean = true;
    public nameService!: NameService;
    form: FormGroup;
    protected selectableCategories!: SelectableCategory[];
    pointsCalculations: PointsCalculation[] = [];
    readonly: boolean = true;
    ranges: any = {};
    validations: AgainstQualifyValidations = {
        minWinPoints: 1,
        maxWinPoints: 10,
        minDrawPoints: 0,
        maxDrawPoints: 5,
        minLosePoints: 0,
        maxLosePoints: 5,
    };

    constructor(
        private againstQualifyConfigRepository: AgainstQualifyConfigRepository,
        public cssService: CSSService,
        private competitionSportMapper: CompetitionSportMapper,
        private mapper: AgainstQualifyConfigMapper,
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
        this.nameService = new NameService();
        this.initRanges();
        this.initSelectableCategories();
        this.processing = false;
    }

    initSelectableCategories() {
        const selectableCategoriesCreator = new SelectableCategoriesCreator(this.competitionSport,
            (round: Round, competitionSport: CompetitionSport) => {
                return round.getAgainstQualifyConfig(competitionSport);
            });
        this.selectableCategories = selectableCategoriesCreator.create(this.structure.getCategories());
        this.pointsCalculations = [PointsCalculation.AgainstGamePoints, PointsCalculation.Scores, PointsCalculation.Both];
        this.postRoundsSelection();
    }

    protected postRoundsSelection() {
        this.readonly = this.someSelectedHasBegun(this.selectableCategories.map(selectableCategory => selectableCategory.rootRoundNode));
        this.alert = undefined;
        if (this.readonly) {
            this.alert = { type: IAlertType.Warning, message: 'er zijn wedstrijden gespeeld voor (sommige) gekozen ronden, je kunt niet meer wijzigen' };
        }

        const json = this.getInputJson(this.getFirstSelectedRoundNode().round);
        this.jsonToForm(json);
    }

    linkToPlanningConfig() {
        this.router.navigate(['/admin/planningconfig', this.tournament.getId(),
            this.structure.getFirstRoundNumber().getNumber()
        ]);
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
    protected getInputJson(round: Round): JsonAgainstQualifyConfig {
        const qualifyagainstConfig = round.getValidAgainstQualifyConfig(this.competitionSport);
        return this.mapper.toJson(qualifyagainstConfig);
    }

    protected jsonToForm(json: JsonAgainstQualifyConfig) {
        this.form.controls.pointsCalculation.setValue(json.pointsCalculation);
        this.form.controls.winPoints.setValue(json.winPoints);
        this.form.controls.drawPoints.setValue(json.drawPoints);
        this.form.controls.winPointsExt.setValue(json.winPointsExt);
        this.form.controls.drawPointsExt.setValue(json.drawPointsExt);
        this.form.controls.losePointsExt.setValue(json.losePointsExt);
    }

    protected formToJson(): JsonAgainstQualifyConfig {
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
        modalRef.componentInstance.competitionSport = this.competitionSport;
        modalRef.componentInstance.selectableCategories = this.selectableCategories;
        modalRef.componentInstance.subject = 'de qualifyagainst-regels';
        modalRef.componentInstance.hasOwnConfig = (round: Round): boolean => {
            return round.getAgainstQualifyConfig(this.competitionSport) !== undefined;
        };
        modalRef.result.then((selectableCategories: SelectableCategory[]) => {
            this.selectableCategories = selectableCategories;
            this.postRoundsSelection();
        }, (reason) => { });
    }

    structureHasMultipleRounds(): boolean {
        return this.structure.getCategories().length > 1 || this.structure.getSingleCategory().getRootRound().getChildren().length > 1;
    }

    someSelectedHasBegun(selectableRoundNodes: SelectableRoundNode[]): boolean {
        return selectableRoundNodes.some((selectableRoundNode: SelectableRoundNode): boolean => {
            return selectableRoundNode.round.hasBegun() || this.someSelectedHasBegun(selectableRoundNode.children);
        });
    }

    getFirstSelectedRoundNode(): SelectableRoundNode {
        const selected = this.selectableCategories.map(selectableCategory => selectableCategory.rootRoundNode)
            .find(selectableRootRoundNode => this.getFirstSelectedRoundNodeHelper(selectableRootRoundNode) !== undefined);
        if (selected === undefined) {
            throw Error('at least one round should be selected');
        }
        return selected;
    }

    getFirstSelectedRoundNodeHelper(selectableRoundNode: SelectableRoundNode): SelectableRoundNode | undefined {
        if (selectableRoundNode.selected) {
            return selectableRoundNode;
        }
        return selectableRoundNode.children.find(child => this.getFirstSelectedRoundNodeHelper(child));
    }

    save(): boolean {
        this.alert = undefined;
        this.processing = true;

        const selectableCategoryConverter = new SelectableCategoryConverter();
        const categoriesSelection = selectableCategoryConverter.createCategoriesSelection(this.selectableCategories);


        const validAgainstQualifyConfigs: ValidAgainstQualifyConfigOfUnchangedChildRound[] = [];
        const reposUpdates: Observable<AgainstQualifyConfig>[] = [];
        categoriesSelection.forEach((roundsSelection: RoundsSelection) => {

            // 1 koppel alle valid qualifyagainstregels van de unchangedChildRounds
            roundsSelection.unchangedDescendants.forEach((unchangedChildRound: Round) => {
                const qualifyagainstConfig = unchangedChildRound.getValidAgainstQualifyConfig(this.competitionSport);
                const jsonAgainstQualifyConfig = this.mapper.toJson(qualifyagainstConfig);
                validAgainstQualifyConfigs.push({ unchangedChildRound, qualifyagainstConfig: jsonAgainstQualifyConfig });
            });

            // 2 verwijder en voeg de qualifyagainstregels toe van de rootRounds
            roundsSelection.rootRounds.forEach((round: Round) => {
                reposUpdates.push(this.againstQualifyConfigRepository.saveObject(this.formToJson(), round, this.tournament));
            });
        });

        forkJoin(reposUpdates).subscribe({
            next: (results) => {
                if (validAgainstQualifyConfigs.length === 0) {
                    this.processing = false;
                    return;
                }
                // 3 voeg de qualifyagainstregels toe van de unchangedChildRounds
                const reposChildUpdates: Observable<AgainstQualifyConfig>[] = validAgainstQualifyConfigs.map((validAgainstQualifyConfig: ValidAgainstQualifyConfigOfUnchangedChildRound) => {
                    return this.againstQualifyConfigRepository.saveObject(validAgainstQualifyConfig.qualifyagainstConfig, validAgainstQualifyConfig.unchangedChildRound, this.tournament);
                });
                forkJoin(reposChildUpdates).subscribe({
                    next: () => this.processing = false,
                    error: (e) => {
                        this.alert = { type: IAlertType.Danger, message: 'de qualifyagainstregels zijn niet opgeslagen: ' + e };
                        this.processing = false;
                    }
                });
            },
            error: (e) => {
                this.alert = { type: IAlertType.Danger, message: 'de qualifyagainstregels zijn niet opgeslagen: ' + e };
                this.processing = false;
            }
        });
        return true;
    }

    get PointsCalculationAgainstGamePoints(): PointsCalculation { return PointsCalculation.AgainstGamePoints };
    get PointsCalculationScores(): PointsCalculation { return PointsCalculation.Scores };
    get PointsCalculationBoth(): PointsCalculation { return PointsCalculation.Both };

    getPointsCalculationDef(pointsCalculation: PointsCalculation): string {
        return this.nameService.getPointsCalculationName(pointsCalculation);
    }
}

interface AgainstQualifyValidations {
    minWinPoints: number;
    maxWinPoints: number;
    minDrawPoints: number;
    maxDrawPoints: number;
    minLosePoints: number;
    maxLosePoints: number;
}

interface ValidAgainstQualifyConfigOfUnchangedChildRound {
    unchangedChildRound: Round;
    qualifyagainstConfig: JsonAgainstQualifyConfig;
}