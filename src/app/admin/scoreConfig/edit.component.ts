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
    Round,
    ScoreConfigMapper,
} from 'ngx-sport';
import { CSSService } from '../../shared/common/cssservice';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '../../lib/translate';
import { ScoreConfigRepository } from '../../lib/ngx-sport/scoreConfig/repository';
import { Tournament } from '../../lib/tournament';
import { IAlert } from '../../shared/common/alert';
import { RoundsSelectorModalComponent, ToggleRound } from '../rounds/selector.component';
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
    public nameService!: NameService;
    public form: FormGroup;
    public translateService: TranslateService;
    protected toggleRound!: ToggleRound;
    jsonScoreConfig!: JsonScoreConfig;
    readonly: boolean = true;

    validations: ScoreValidations = {
        minScore: 0,
        maxScore: 9999
    };


    constructor(
        private scoreConfigRepository: ScoreConfigRepository,
        public cssService: CSSService,
        // public sportConfigService: SportConfigService,
        private mapper: ScoreConfigMapper,
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
        this.onChanges();
    }

    ngOnInit() {
        this.nameService = new NameService(new PlaceLocationMap(this.tournament.getCompetitors()));
        this.initToggleRound();
    }

    initToggleRound() {
        const toggleRoundInittializer = new ToggleRoundInittializer(this.competitionSport,
            (round: Round, competitionSport: CompetitionSport) => {
                return round.getScoreConfig(competitionSport);
            });
        this.toggleRound = toggleRoundInittializer.createToggleRound(this.structure.getRootRound());
        this.postToggleRoundChange();
    }

    // hasACustomScoreConfig(round: Round): boolean {
    //     if (round.getScoreConfig(this.competitionSport) !== undefined) {
    //         return true;
    //     }
    //     return round.getChildren().some((child: Round) => this.hasACustomScoreConfig(child));
    // }

    protected postToggleRoundChange() {
        this.readonly = this.allSelectedToggleRoundsBegun(this.toggleRound);
        if (this.readonly) {
            this.alert = { type: 'warning', message: 'er zijn wedstrijden gespeeld voor gekozen ronden, je kunt niet meer wijzigen' };
        } else if (this.someSelectedToggleRoundsBegun(this.toggleRound)) {
            this.alert = { type: 'warning', message: 'er zijn wedstrijden gespeeld voor sommige gekozen ronden, de score-regels hiervoor worden niet opgeslagen' };
        }
        this.jsonScoreConfig = this.getInputJson(this.getFirstSelectedToggleRound(this.toggleRound).round);
        this.jsonToForm();
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

    protected jsonToForm() {
        this.form.controls.max.setValue(this.jsonScoreConfig.maximum);
        if (this.jsonScoreConfig.next) {
            this.form.controls.useNext.setValue(this.jsonScoreConfig.next.enabled);
            this.form.addControl('maxNext', new FormControl(
                this.jsonScoreConfig.next.maximum,
                Validators.compose([
                    Validators.required,
                    Validators.min(this.validations.minScore),
                    Validators.max(this.validations.maxScore)
                ])
            ));
        }
        this.processing = false;
    }

    protected formToJson() {
        this.jsonScoreConfig.maximum = this.form.value['max'];
        if (this.form.controls.maxNext !== undefined && this.jsonScoreConfig.next) {
            this.jsonScoreConfig.next.maximum = this.form.value['maxNext'];
            this.jsonScoreConfig.next.enabled = this.form.value['useNext'];
        }
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
        modalRef.componentInstance.structure = this.structure;
        modalRef.componentInstance.competitionSport = this.competitionSport;
        modalRef.componentInstance.toggleRound = this.toggleRound;
        modalRef.componentInstance.subject = 'de score-regels';
        modalRef.componentInstance.hasOwnConfig = (round: Round): boolean => {
            return round.getScoreConfig(this.competitionSport) !== undefined;
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
        this.formToJson();

        const toggleRoundConverter = new ToggleRoundConverter();
        const roundsSelection = toggleRoundConverter.createRoundsSelection(this.toggleRound);

        // 1 koppel alle valid scoreregels van de unchangedChildRounds
        const validScoreConfigs: ValidScoreConfigOfUnchangedChildRound[] = [];
        roundsSelection.unchangedDescendants.forEach((unchangedChildRound: Round) => {
            const scoreConfig = unchangedChildRound.getValidScoreConfig(this.competitionSport);
            const jsonScoreConfig = this.mapper.toJson(scoreConfig);
            validScoreConfigs.push({ unchangedChildRound, scoreConfig: jsonScoreConfig });
        });

        // 2 verwijder en voeg de scoreregels toe van de rootRounds
        const reposUpdates: Observable<ScoreConfig>[] = roundsSelection.rootRounds.map((round: Round) => {
            return this.scoreConfigRepository.saveObject(this.jsonScoreConfig, round, this.tournament);
        });
        forkJoin(reposUpdates).subscribe(results => {
            if (validScoreConfigs.length === 0) {
                this.processing = false;
                return;
            }
            // 3 voeg de scoreregels toe van de unchangedChildRounds
            const reposChildUpdates: Observable<ScoreConfig>[] = validScoreConfigs.map((validScoreConfig: ValidScoreConfigOfUnchangedChildRound) => {
                return this.scoreConfigRepository.saveObject(validScoreConfig.scoreConfig, validScoreConfig.unchangedChildRound, this.tournament);
            });
            forkJoin(reposChildUpdates).subscribe(results => {
                this.processing = false;
            },
                e => {
                    this.alert = { type: 'danger', message: 'de scoreregels zijn niet opgeslagen: ' + e };
                    this.processing = false;
                });
        },
            e => {
                this.alert = { type: 'danger', message: 'de scoreregels zijn niet opgeslagen: ' + e };
                this.processing = false;
            });
        return true;
    }
}

/**
 * selecteer hier alle ronden van de eerste rondenummer dat nog niet is begonnen toe.
 * wanneer 1 van deze ronden een eigen config heeft, dan meteen de gebruiker laten kiezen
 * wanneer het toernooi is afgelopen, selecteer dan de rootround
 */
export class ToggleRoundInittializer {
    constructor(
        private competitionSport: CompetitionSport,
        private hasOwnConfig: Function
    ) {
    }

    createToggleRound(rootRound: Round): ToggleRound {
        const toggleRound = this.createHelper(rootRound, false);
        if (!this.isSomeSelected(toggleRound)) {
            toggleRound.selected = true;
        }
        return toggleRound;
    }

    protected createHelper(round: Round, differentPreviousSibblingConfig: boolean, parent?: ToggleRound): ToggleRound {
        const toggleRound: ToggleRound = {
            parent,
            round,
            selected: false,
            children: []
        };
        toggleRound.selected = this.select(toggleRound, differentPreviousSibblingConfig);

        let previousSibblingConfig: ScoreConfig | undefined;
        let differentPreviousSibblingConfigChild = false;
        toggleRound.children = round.getChildren().map((childRound: Round): ToggleRound => {
            const roundConfig = round.getValidScoreConfig(this.competitionSport);
            if (!previousSibblingConfig) {
                previousSibblingConfig = roundConfig;
            }
            if (previousSibblingConfig !== roundConfig) {
                differentPreviousSibblingConfigChild = true;
            }
            return this.createHelper(childRound, differentPreviousSibblingConfigChild, toggleRound);
        });
        return toggleRound;
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

    protected select(toggleRound: ToggleRound, differentPreviousSibblingConfig: boolean): boolean {
        if (toggleRound.round.getNumber().hasBegun()) {
            return false;
        }
        if (!this.ancestorSelected(toggleRound) && !differentPreviousSibblingConfig) {
            return true;
        }
        if (this.hasOwnConfig(toggleRound.round, this.competitionSport)) {
            return false;
        }
        return toggleRound.parent !== undefined && toggleRound.parent.selected;
    }

    protected ancestorSelected(toggleRound: ToggleRound): boolean {
        if (!toggleRound.parent) {
            return false;
        }
        if (toggleRound.parent.selected) {
            return true;
        }
        return this.ancestorSelected(toggleRound.parent);
    }

    isSomeSelected(toggleRound: ToggleRound): boolean {
        return toggleRound.selected || toggleRound.children.some((child: ToggleRound) => this.isSomeSelected(child));
    }
}

export class ToggleRoundConverter {
    constructor(
    ) {
    }

    createRoundsSelection(toggleRound: ToggleRound): RoundsSelection {
        const selection: RoundsSelection = {
            rootRounds: [],
            unchangedDescendants: []
        }
        this.updateRoundsSelection(toggleRound, selection);
        return selection;
    }

    protected updateRoundsSelection(toggleRound: ToggleRound, selection: RoundsSelection) {

        if (toggleRound.selected && !this.hasSelectedAncestor(toggleRound)) {
            selection.rootRounds.push(toggleRound.round);
        }
        if (!toggleRound.selected && this.hasSelectedAncestor(toggleRound)
            && toggleRound.parent && toggleRound.parent.selected) {
            selection.unchangedDescendants.push(toggleRound.round);
        }
        toggleRound.children.forEach(child => this.updateRoundsSelection(child, selection));
    }

    protected hasSelectedAncestor(toggleRound: ToggleRound): boolean {
        if (!toggleRound.parent) {
            return false;
        }
        if (toggleRound.parent.selected) {
            return true;
        }
        return this.hasSelectedAncestor(toggleRound.parent);
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