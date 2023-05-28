import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
import { CustomSportId } from '../../lib/ngx-sport/sport/custom';

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
    public typedForm: FormGroup;/*<{
        pointsCalculation: FormControl<PointsCalculation>;
        winPoints: FormControl<number>;
        drawPoints: FormControl<number>;
        winPointsExt: FormControl<number>;
        drawPointsExt: FormControl<number>;
        losePointsExt: FormControl<number>;
      }>;*/
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
        private modalService: NgbModal
    ) {
        this.typedForm = new FormGroup({
            pointsCalculation: new FormControl(PointsCalculation.AgainstGamePoints, { nonNullable: true }),
            winPoints: new FormControl(0, { nonNullable: true }),
            drawPoints: new FormControl(0, { nonNullable: true }),
            winPointsExt: new FormControl(0, { nonNullable: true }),
            drawPointsExt: new FormControl(0, { nonNullable: true }),
            losePointsExt: new FormControl(0, { nonNullable: true }),
        });
    }

    ngOnInit() {
        this.nameService = new NameService();
        this.initRanges();
        this.initSelectableCategories();
        this.processing = false;
    }

    updateDisabled(): void {
        const usePoints = this.typedForm.controls.pointsCalculation.value !== PointsCalculation.Scores;
        if( usePoints ) {
            this.typedForm.controls.winPoints.enable();
            this.typedForm.controls.drawPoints.enable();
            this.typedForm.controls.winPointsExt.enable();
            this.typedForm.controls.drawPointsExt.enable();
            this.typedForm.controls.losePointsExt.enable();
        } else {
            this.typedForm.controls.winPoints.disable({onlySelf: true});
            this.typedForm.controls.drawPoints.disable({onlySelf: true});
            this.typedForm.controls.winPointsExt.disable({onlySelf: true});
            this.typedForm.controls.drawPointsExt.disable({onlySelf: true});
            this.typedForm.controls.losePointsExt.disable({onlySelf: true});
        }
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
        if (sport.getCustomId() === CustomSportId.Chess) {
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
        this.typedForm.controls.pointsCalculation.setValue(json.pointsCalculation);
        this.typedForm.controls.winPoints.setValue(json.winPoints);
        this.typedForm.controls.drawPoints.setValue(json.drawPoints);
        this.typedForm.controls.winPointsExt.setValue(json.winPointsExt);
        this.typedForm.controls.drawPointsExt.setValue(json.drawPointsExt);
        this.typedForm.controls.losePointsExt.setValue(json.losePointsExt);
        this.updateDisabled();
    }

    protected formToJson(): JsonAgainstQualifyConfig {
        return {
            id: 0,
            competitionSport: this.competitionSportMapper.toJson(this.competitionSport),
            pointsCalculation: this.typedForm.controls.pointsCalculation.value,
            winPoints: this.typedForm.controls.winPoints.value,
            drawPoints: this.typedForm.controls.drawPoints.value,
            winPointsExt: this.typedForm.controls.winPointsExt.value,
            drawPointsExt: this.typedForm.controls.drawPointsExt.value,
            losePointsExt: this.typedForm.controls.losePointsExt.value
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
        return this.structure.getCategories().length > 1 || this.structure.getSingleCategory().getStructureCells().length > 1;
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