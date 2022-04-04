import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HorizontalPoule, NameService, QualifyGroup, SingleQualifyRule, QualifyTarget, Round, RoundNumber, StructureEditor, CompetitorMap } from 'ngx-sport';

import { IAlert, IAlertType } from '../../common/alert';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import { facStructure } from '../icon/icons';
import { CSSService } from '../../common/cssservice';


@Component({
    selector: 'app-tournament-structurequalify',
    templateUrl: './qualify.component.html',
    styleUrls: ['./qualify.component.css']
})
export class StructureQualifyComponent {
    @Input() structureEditor!: StructureEditor;
    @Input() parentRound!: Round;
    @Output() roundNumberChanged = new EventEmitter<RoundNumber>();
    @Input() nameService!: NameService;
    alert: IAlert | undefined;
    public targetCollapsed: TargetMap = {};

    constructor(
        public cssService: CSSService) {
        this.resetAlert();
        this.targetCollapsed[QualifyTarget.Winners] = true;
        this.targetCollapsed[QualifyTarget.Losers] = true;
    }

    getTargets(): QualifyTarget[] {
        return [QualifyTarget.Winners, QualifyTarget.Losers];
    }

    get IconStructure(): [IconPrefix, IconName] { return [facStructure.prefix, facStructure.iconName]; }

    canRemoveQualifier(target: QualifyTarget): boolean {
        return this.parentRound.getBorderQualifyGroup(target) !== undefined;
    }

    removeQualifier(target: QualifyTarget) {
        this.resetAlert();
        try {
            this.structureEditor.removeQualifier(this.parentRound, target);
            if (!this.areSomeQualifyGroupsEditable(target)) {
                this.targetCollapsed[target] = true;
            }
            this.nameService.resetStructure();
            this.roundNumberChanged.emit(this.parentRound.getNumber());
        } catch (e: any) {
            this.setAlert(IAlertType.Danger, e.message);
        }
    }

    canAddQualifier(target: QualifyTarget): boolean {
        let nrOfToPlacesChildren = this.parentRound.getNrOfPlacesChildren();
        const nrOfPlaces = this.parentRound.getNrOfPlaces();
        const availableNrOfPlacesToAdd = nrOfPlaces - nrOfToPlacesChildren;
        const borderQualifyGroup = this.parentRound.getBorderQualifyGroup(target);
        if (borderQualifyGroup === undefined) {
            return this.canAddChildRound(availableNrOfPlacesToAdd);
        }
        if (availableNrOfPlacesToAdd <= 0) {
            return false;
        }
        try {
            this.structureEditor.validate(
                borderQualifyGroup.getChildRound().getNrOfPlaces() + 1,
                borderQualifyGroup.getChildRound().getPoules().length
            );
            return true;
        } catch (e) {
            return false;
        }
    }

    canAddChildRound(availableNrOfPlacesToAdd: number): boolean {
        return availableNrOfPlacesToAdd >= this.structureEditor.getMinPlacesPerPouleSmall();
    }

    addQualifier(target: QualifyTarget) {
        this.resetAlert();
        try {
            if (this.parentRound.getQualifyGroups(target).length === 0) {
                const minNrOfPlacesPerPoule = this.structureEditor.getMinPlacesPerPouleSmall();
                this.structureEditor.addChildRound(this.parentRound, target, [minNrOfPlacesPerPoule]);
            } else {
                this.structureEditor.addQualifiers(this.parentRound, target, 1);
            }
            this.nameService.resetStructure();
            this.roundNumberChanged.emit(this.parentRound.getNumber());
        } catch (e: any) {
            this.setAlert(IAlertType.Danger, e.message);
        }
    }

    splitQualifyGroupFrom(singleRule: SingleQualifyRule) {
        this.resetAlert();
        try {
            this.structureEditor.splitQualifyGroupFrom(singleRule.getGroup(), singleRule);
            this.nameService.resetStructure();
            this.roundNumberChanged.emit(this.parentRound.getNumber());
        } catch (e: any) {
            this.setAlert(IAlertType.Danger, e.message);
        }
    }

    mergeQualifyGroupWithNext(group: QualifyGroup): void {
        const next = group.getNext();
        if (next === undefined) {
            return;
        }
        this.resetAlert();
        try {
            this.structureEditor.mergeQualifyGroups(group, next);
            this.nameService.resetStructure();
            this.roundNumberChanged.emit(this.parentRound.getNumber());
        } catch (e: any) {
            this.setAlert(IAlertType.Danger, e.message);
        }
    }

    /**
    * 1 : wanneer er een kw.groep van minimaal 2 horizontale poules is (grens h poule  moet minimaal twee door laten gaan) 
    * 2 : 2 kw.groepen van winners of losers.
    */
    areSomeQualifyGroupsEditable(target: QualifyTarget): boolean {
        return this.areSomeQualifyGroupsSplittable(target) || this.areSomeQualifyGroupsMergable(target);
    }

    areSomeQualifyGroupsSplittable(target: QualifyTarget): boolean {
        return this.parentRound.getQualifyGroups(target).some((qualifyGroup: QualifyGroup) => {
            return this.isQualifyGroupSplittable(qualifyGroup);
        });
    }

    areSomeQualifyGroupsMergable(target: QualifyTarget): boolean {
        let previous: QualifyGroup | undefined;
        return this.parentRound.getQualifyGroups(target).some((qualifyGroup: QualifyGroup) => {
            if (previous && this.structureEditor.areQualifyGroupsMergable(previous, qualifyGroup)) {
                return true;
            };
            previous = qualifyGroup;
            return false;
        });
    }

    isQualifyGroupMergableWithNext(qualifyGroup: QualifyGroup): boolean {
        const next = qualifyGroup.getNext();
        if (next === undefined) {
            return false;
        }
        return this.structureEditor.areQualifyGroupsMergable(qualifyGroup, next);
    }

    isQualifyGroupSplittable(qualifyGroup: QualifyGroup): boolean {
        let singleRule: SingleQualifyRule | undefined = qualifyGroup.getFirstSingleRule();
        while (singleRule !== undefined) {
            if (this.structureEditor.isQualifyGroupSplittableAt(singleRule)) {
                return true;
            }
            singleRule = singleRule.getNext();
        }
        return false;
    }

    getTargetDirectionClass(target: QualifyTarget): string {
        return target === QualifyTarget.Losers ? 'flex-column-reverse' : '';
    }

    getQualifyGroupBtnClass(target: QualifyTarget): string {
        const editable = this.areSomeQualifyGroupsEditable(target);
        return 'btn-' + (this.targetCollapsed[target] ? 'outline-' : '') + (editable ? 'primary' : 'secondary');
    }

    getRemoveQualifierBtnClass(target: QualifyTarget): string {
        return this.canRemoveQualifier(target) ? 'primary' : 'secondary';
    }

    getAddQualifierBtnClass(target: QualifyTarget): string {
        return this.canAddQualifier(target) ? 'primary' : 'secondary';
    }

    resetAlert(): void {
        this.alert = undefined;
    }

    protected setAlert(type: IAlertType, message: string) {
        this.alert = { type: type, message: message };
    }
}

interface TargetMap {
    [key: string]: boolean;
}