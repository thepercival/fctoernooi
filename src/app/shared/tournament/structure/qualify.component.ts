import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HorizontalPoule, NameService, QualifyGroup, SingleQualifyRule, QualifyTarget, Round, RoundNumber, StructureEditor } from 'ngx-sport';

import { IAlert } from '../../common/alert';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import { facStructure } from '../icons';


@Component({
    selector: 'app-tournament-structurequalify',
    templateUrl: './qualify.component.html',
    styleUrls: ['./qualify.component.css']
})
export class StructureQualifyComponent {

    @Input() round!: Round;
    @Output() viewTypeChanged = new EventEmitter<number>();
    @Output() roundNumberChanged = new EventEmitter<RoundNumber>();
    alert: IAlert | undefined;
    public collapsed = true;
    public nameService: NameService;

    constructor(private structureEditor: StructureEditor) {
        this.resetAlert();
        this.nameService = new NameService(undefined);
    }

    get TargetWinners(): QualifyTarget {
        return QualifyTarget.Winners;
    }

    get TargetLosers(): QualifyTarget {
        return QualifyTarget.Losers;
    }

    get IconStructure(): [IconPrefix, IconName] { return [facStructure.prefix, facStructure.iconName]; }

    canRemoveQualifier(target: QualifyTarget): boolean {
        return this.round.getQualifyGroups(target).length > 0;
    }

    removeQualifier(target: QualifyTarget) {
        this.resetAlert();
        this.structureEditor.removeQualifier(this.round, target);
        this.roundNumberChanged.emit(this.round.getNumber());
    }

    canAddQualifier(target: QualifyTarget): boolean {
        let nrOfToPlacesChildren = this.round.getNrOfPlacesChildren();
        const nrOfToPlaces = this.round.getNrOfPlaces();
        if (this.round.getQualifyGroups(target).length === 0) {
            nrOfToPlacesChildren++;
        }
        return nrOfToPlaces > nrOfToPlacesChildren;
    }

    addQualifier(target: QualifyTarget) {
        this.resetAlert();
        if (this.round.getQualifyGroups(target).length === 0) {
            this.structureEditor.addChildRound(this.round, target, [2]);
        } else {
            this.structureEditor.addQualifiers(this.round, target, 1);
        }
        this.roundNumberChanged.emit(this.round.getNumber());
    }

    /**
    * 1 : wanneer er een kw.groep van minimaal 2 horizontale poules is (grens h poule  moet minimaal twee door laten gaan) 
    * 2 : 2 kw.groepen van winners of losers.
    */
    areSomeQualifyGroupsEditable(target: QualifyTarget): boolean {
        return this.areSomeQualifyGroupsSplittable(target) || this.areSomeQualifyGroupsMergable(target);
    }

    areSomeQualifyGroupsSplittable(target: QualifyTarget): boolean {
        return this.round.getQualifyGroups(target).some(qualifyGroup => {
            return this.isQualifyGroupSplittable(qualifyGroup);
        });
    }

    areSomeQualifyGroupsMergable(target: QualifyTarget): boolean {
        let previous: QualifyGroup | undefined;
        return this.round.getQualifyGroups(target).some((qualifyGroup: QualifyGroup) => {
            if (previous && this.structureEditor.areQualifyGroupsMergable(previous, qualifyGroup)) {
                return true;
            };
            previous = qualifyGroup;
            return false;
        });
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

    resetAlert(): void {
        this.alert = undefined;
    }

    protected setAlert(type: string, message: string) {
        this.alert = { type: type, message: message };
    }
}
