import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import {
    ScoreConfig,
    JsonScoreConfig,
    Structure,
    CompetitionSport,
    Round,
    ScoreConfigMapper,
    CompetitionSportMapper,
    Category,
} from 'ngx-sport';
import { CSSService } from '../../shared/common/cssservice';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '../../lib/translate';
import { ScoreConfigRepository } from '../../lib/ngx-sport/scoreConfig/repository';
import { Tournament } from '../../lib/tournament';
import { IAlert, IAlertType } from '../../shared/common/alert';
import { RoundsSelectorModalComponent, SelectableCategory, SelectableRoundNode } from '../rounds/selector.component';
import { forkJoin, Observable } from 'rxjs';

@Component({
    selector: 'app-tournament-scoreconfig-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss']
})
export class ScoreConfigEditComponent implements OnInit {
    @Input() tournament!: Tournament;
    @Input() structure!: Structure;
    @Input() competitionSport!: CompetitionSport;

    public alert: IAlert | undefined;
    public processing: boolean = true;
    public form: FormGroup;
    protected selectableCategories!: SelectableCategory[];
    public originalScoreConfig!: ScoreConfig;
    readonly: boolean = true;

    validations: ScoreValidations = {
        minScore: 0,
        maxScore: 9999
    };

    constructor(
        private scoreConfigRepository: ScoreConfigRepository,
        public cssService: CSSService,
        public competitionSportMapper: CompetitionSportMapper,
        private mapper: ScoreConfigMapper,
        private translate: TranslateService,
        fb: FormBuilder,
        private modalService: NgbModal
    ) {
        this.form = fb.group({
            useNext: false,
            max: ['', Validators.compose([
                Validators.required,
                Validators.min(this.validations.minScore),
                Validators.max(this.validations.maxScore)
            ])]
        });
        this.onChanges();
    }

    ngOnInit() {
        this.initSelectableCategories();
    }

    structureHasMultipleRounds(): boolean {
        return this.structure.getCategories().length > 1 || this.structure.getSingleCategory().getRootRound().getChildren().length > 1;
    }

    initSelectableCategories() {
        const selectableCategoriesCreator = new SelectableCategoriesCreator(this.competitionSport,
            (round: Round, competitionSport: CompetitionSport) => {
                return round.getScoreConfig(competitionSport);
            });
        this.selectableCategories = selectableCategoriesCreator.create(this.structure.getCategories());
        this.originalScoreConfig = this.getFirstSelectedRoundNode().round.getValidScoreConfig(this.competitionSport);
        this.postRoundsSelection();
    }


    protected postRoundsSelection() {
        this.readonly = this.someSelectedHasBegun(this.selectableCategories.map(selectableCategory => selectableCategory.rootRoundNode));
        this.alert = undefined;
        if (this.readonly) {
            this.alert = { type: IAlertType.Warning, message: 'er zijn wedstrijden gespeeld voor (sommige) gekozen ronden, je kunt niet meer wijzigen' };
        }

        const scoreConfigInit = this.getFirstSelectedRoundNode().round.getValidScoreConfig(this.competitionSport);
        // this.jsonScoreConfig = this.getInputJson(this.getFirstSelectedToggleRound(this.toggleRound).round);
        this.initForm(scoreConfigInit);
    }

    /**
     * Bij het opslaan, kijken als ronden al begonnen zijn.
     * Kan ook eerder om dan aan de gebruiker te tonen
     * 
     * @param rounds 
     */
    protected getInputJson(round: Round): JsonScoreConfig {
        const scoreConfig = round.getValidScoreConfig(this.competitionSport);
        return this.mapper.toJson(scoreConfig);
    }

    protected initForm(scoreConfigInit: ScoreConfig) {
        this.form.controls.max.setValue(scoreConfigInit.getMaximum());
        const next = scoreConfigInit.getNext();
        if (next) {
            this.form.controls.useNext.setValue(next.getEnabled());
            this.form.addControl('maxNext', new FormControl(
                next.getMaximum(),
                Validators.compose([
                    Validators.required,
                    Validators.min(this.validations.minScore),
                    Validators.max(this.validations.maxScore)
                ])
            ));
        }
        this.processing = false;
    }

    protected formToJson(): JsonScoreConfig {
        const jsonCompetitionSport = this.competitionSportMapper.toJson(this.competitionSport);
        const json: JsonScoreConfig = {
            id: 0,
            competitionSport: jsonCompetitionSport,
            direction: this.originalScoreConfig.getDirection(),
            maximum: this.form.controls.max.value,
            enabled: true,
            isFirst: true,
        };
        if (this.form.controls.maxNext !== undefined && this.originalScoreConfig.hasNext()) {
            json.next = {
                id: 0,
                competitionSport: jsonCompetitionSport,
                direction: this.originalScoreConfig.getDirection(),
                maximum: this.form.value['maxNext'],
                enabled: this.form.value['useNext'],
                isFirst: false
            };
        }
        return json;
    }

    onChanges(): void {
        this.form.controls.useNext.valueChanges.subscribe(val => {
            this.form.controls.max.clearValidators();
            const minScore = this.validations.minScore + (val ? 1 : 0);
            this.form.controls.max.setValidators(
                Validators.compose([
                    Validators.required,
                    Validators.min(minScore),
                    Validators.max(this.validations.maxScore)
                ]));
            if (this.form.controls.max.value === 0) {
                this.form.controls.max.setErrors({ 'invalid': true });
            }
        });
    }

    openSelectRoundsModal() {
        const modalRef = this.modalService.open(RoundsSelectorModalComponent);
        modalRef.componentInstance.competitionSport = this.competitionSport;
        modalRef.componentInstance.selectableCategories = this.selectableCategories;
        modalRef.componentInstance.subject = 'de score-regels';
        modalRef.componentInstance.hasOwnConfig = (round: Round): boolean => {
            return round.getScoreConfig(this.competitionSport) !== undefined;
        };
        modalRef.result.then((selectableCategories: SelectableCategory[]) => {
            this.selectableCategories = selectableCategories;
            this.postRoundsSelection();
        }, (reason) => { });
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

    getPluralName(): string {
        const next = this.originalScoreConfig.getNext();
        return this.translate.getScoreNamePlural(this.originalScoreConfig);
    }

    getNextPluralName(): string {
        const next = this.originalScoreConfig.getNext();
        return next ? this.translate.getScoreNamePlural(next) : '';
    }

    getDirectionName(): string {
        const next = this.originalScoreConfig.getNext();
        return this.translate.getScoreDirection(this.originalScoreConfig.getDirection());
    }

    getNextDirectionName(): string {
        const next = this.originalScoreConfig.getNext();
        return next ? this.translate.getScoreDirection(next.getDirection()) : '';
    }

    getNextSingularName(): string {
        const next = this.originalScoreConfig.getNext();
        return next ? this.translate.getScoreNameSingular(next) : '';
    }

    save(): boolean {
        this.alert = undefined;
        this.processing = true;
        const jsonScoreConfig: JsonScoreConfig = this.formToJson();

        const selectableCategoryConverter = new SelectableCategoryConverter();
        const categoriesSelection = selectableCategoryConverter.createCategoriesSelection(this.selectableCategories);


        const reposUpdates: Observable<ScoreConfig>[] = [];
        const validScoreConfigs: ValidScoreConfigOfUnchangedChildRound[] = [];
        categoriesSelection.forEach((roundsSelection: RoundsSelection) => {

            // 1 koppel alle valid scoreregels van de unchangedChildRounds
            roundsSelection.unchangedDescendants.forEach((unchangedChildRound: Round) => {
                const scoreConfig = unchangedChildRound.getValidScoreConfig(this.competitionSport);
                validScoreConfigs.push({ unchangedChildRound, scoreConfig: this.mapper.toJson(scoreConfig) });
            });

            // 2 verwijder en voeg de scoreregels toe van de rootRounds
            roundsSelection.rootRounds.forEach((round: Round) => {
                reposUpdates.push(this.scoreConfigRepository.saveObject(jsonScoreConfig, round, this.tournament));
            });
        });

        forkJoin(reposUpdates)
            .subscribe({
                next: () => {
                    if (validScoreConfigs.length === 0) {
                        this.processing = false;
                        return;
                    }
                    // 3 voeg de scoreregels toe van de unchangedChildRounds
                    const reposChildUpdates: Observable<ScoreConfig>[] = validScoreConfigs.map((validScoreConfig: ValidScoreConfigOfUnchangedChildRound) => {
                        return this.scoreConfigRepository.saveObject(validScoreConfig.scoreConfig, validScoreConfig.unchangedChildRound, this.tournament);
                    });
                    forkJoin(reposChildUpdates)
                        .subscribe({
                            next: () => this.processing = false,
                            error: (e) => {
                                this.alert = { type: IAlertType.Danger, message: 'de scoreregels zijn niet opgeslagen: ' + e };
                                this.processing = false;
                            }
                        });
                },
                error: (e) => {
                    this.alert = { type: IAlertType.Danger, message: 'de scoreregels zijn niet opgeslagen: ' + e };
                    this.processing = false;
                }
            });
        return true;
    }
}

/**
 * selecteer hier alle ronden van de eerste rondenummer dat nog niet is begonnen toe.
 * wanneer 1 van deze ronden een eigen config heeft, dan meteen de gebruiker laten kiezen
 * wanneer het toernooi is afgelopen, selecteer dan de rootround
 */
export class SelectableCategoriesCreator {
    constructor(
        private competitionSport: CompetitionSport,
        private hasOwnConfig: Function
    ) {
    }

    create(categories: Category[]): SelectableCategory[] {
        return categories.map((category: Category): SelectableCategory => {
            const rootRoundNode = this.createSelectableRoundNode(category.getRootRound(), false);
            if (!this.isSomeSelected(rootRoundNode)) {
                rootRoundNode.selected = true;
            }
            return {
                category,
                rootRoundNode
            };
        })
    }

    protected createSelectableRoundNode(round: Round, differentPreviousSibblingConfig: boolean, parent?: SelectableRoundNode): SelectableRoundNode {
        const selectableRoundNode: SelectableRoundNode = {
            parent,
            round,
            selected: false,
            children: []
        };
        selectableRoundNode.selected = this.select(selectableRoundNode, differentPreviousSibblingConfig);

        let previousSibblingConfig: ScoreConfig | undefined;
        let differentPreviousSibblingConfigChild = false;
        selectableRoundNode.children = round.getChildren().map((childRound: Round): SelectableRoundNode => {
            const roundConfig = round.getValidScoreConfig(this.competitionSport);
            if (!previousSibblingConfig) {
                previousSibblingConfig = roundConfig;
            }
            if (previousSibblingConfig !== roundConfig) {
                differentPreviousSibblingConfigChild = true;
            }
            return this.createSelectableRoundNode(childRound, differentPreviousSibblingConfigChild, selectableRoundNode);
        });
        return selectableRoundNode;
    }

    protected hasDifferentConfigs(rounds: Round[]): boolean {
        let config: ScoreConfig | undefined;
        return rounds.some((round: Round) => {
            const roundConfig = round.getValidScoreConfig(this.competitionSport);
            if (!config) {
                config = roundConfig;
                return false;
            }
            return config !== roundConfig;
        });
    }

    protected select(selectableRoundNode: SelectableRoundNode, differentPreviousSibblingConfig: boolean): boolean {
        if (selectableRoundNode.round.getNumber().hasBegun()) {
            return false;
        }
        if (!this.ancestorSelected(selectableRoundNode) && !differentPreviousSibblingConfig) {
            return true;
        }
        if (this.hasOwnConfig(selectableRoundNode.round, this.competitionSport)) {
            return false;
        }
        return selectableRoundNode.parent !== undefined && selectableRoundNode.parent.selected;
    }

    protected ancestorSelected(selectableRoundNode: SelectableRoundNode): boolean {
        if (!selectableRoundNode.parent) {
            return false;
        }
        if (selectableRoundNode.parent.selected) {
            return true;
        }
        return this.ancestorSelected(selectableRoundNode.parent);
    }

    isSomeSelected(selectableRoundNode: SelectableRoundNode): boolean {
        return selectableRoundNode.selected || selectableRoundNode.children.some((child: SelectableRoundNode) => this.isSomeSelected(child));
    }
}

export class SelectableCategoryConverter {
    constructor(
    ) {
    }

    createCategoriesSelection(selectableCategories: SelectableCategory[]): RoundsSelection[] {
        return selectableCategories.map(category => this.createCategoryRoundsSelection(category));
    }

    createCategoryRoundsSelection(selectableCategory: SelectableCategory): RoundsSelection {
        const selection: RoundsSelection = {
            rootRounds: [],
            unchangedDescendants: []
        }
        this.updateRoundsSelection(selectableCategory.rootRoundNode, selection);
        return selection;
    }

    protected updateRoundsSelection(selectableRoundNode: SelectableRoundNode, selection: RoundsSelection) {

        if (selectableRoundNode.selected && !this.hasSelectedAncestor(selectableRoundNode)) {
            selection.rootRounds.push(selectableRoundNode.round);
        }
        if (!selectableRoundNode.selected && this.hasSelectedAncestor(selectableRoundNode)
            && selectableRoundNode.parent && selectableRoundNode.parent.selected) {
            selection.unchangedDescendants.push(selectableRoundNode.round);
        }
        selectableRoundNode.children.forEach(child => this.updateRoundsSelection(child, selection));
    }

    protected hasSelectedAncestor(selectableRoundNode: SelectableRoundNode): boolean {
        if (!selectableRoundNode.parent) {
            return false;
        }
        if (selectableRoundNode.parent.selected) {
            return true;
        }
        return this.hasSelectedAncestor(selectableRoundNode.parent);
    }
}

export interface RoundsSelection {
    rootRounds: Round[],
    unchangedDescendants: Round[]
}
interface ScoreValidations {
    minScore: number;
    maxScore: number;
}

interface ValidScoreConfigOfUnchangedChildRound {
    unchangedChildRound: Round;
    scoreConfig: JsonScoreConfig;
}