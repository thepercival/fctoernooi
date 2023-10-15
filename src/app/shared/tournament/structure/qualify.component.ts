import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { HorizontalSingleQualifyRule, NameService, QualifyDistribution, QualifyGroup, QualifyTarget, Round, StructureEditor, StructureNameService, VerticalSingleQualifyRule } from 'ngx-sport';

import { IAlert, IAlertType } from '../../common/alert';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import { facStructure } from '../icon/icons';
import { CSSService } from '../../common/cssservice';
import { StructureAction, StructureActionName } from '../../../admin/structure/edit.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'app-tournament-structurequalify',
    templateUrl: './qualify.component.html',
    styleUrls: ['./qualify.component.scss']
})
export class StructureQualifyComponent {
    @Input() structureEditor!: StructureEditor;
    @Input() parentRound!: Round;
    @Output() addAction = new EventEmitter<StructureAction>();
    @Input() structureNameService!: StructureNameService;
    @Input() lastAction: StructureAction | undefined;
    alert: IAlert | undefined;
    public targetCollapsed: TargetMap = {};

    constructor(
        private modalService: NgbModal,
        public cssService: CSSService) {
        this.resetAlert();
        this.targetCollapsed[QualifyTarget.Winners] = true;
        this.targetCollapsed[QualifyTarget.Losers] = true;
    }

    getTargets(): QualifyTarget[] {
        return [QualifyTarget.Winners, QualifyTarget.Losers];
    }

    get HorizontalSnake(): QualifyDistribution { return QualifyDistribution.HorizontalSnake; }
    get Vertical(): QualifyDistribution { return QualifyDistribution.Vertical; }
    get IconStructure(): [IconPrefix, IconName] { return [facStructure.prefix, facStructure.iconName]; }

    getDistribution(target: QualifyTarget): QualifyDistribution|undefined {
        const qualifyGroup = this.parentRound.getBorderQualifyGroup(target);
        return qualifyGroup.getDistribution();
    }

    updateDistribution(target: QualifyTarget, distribution: QualifyDistribution): void {
        this.resetAlert();
        try {
            const qualifyGroup = this.parentRound.getBorderQualifyGroup(target);
            this.structureEditor.updateDistribution(qualifyGroup, distribution);
            this.addAction.emit({
                pathNode: this.parentRound.getPathNode(),
                name: StructureActionName.UpdateQualifyDistribution,
                recreateStructureNameService: true
            });
        } catch (e: any) {
            this.setAlert(IAlertType.Danger, e.message);
        }
        
    }

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
            this.addAction.emit({
                pathNode: this.parentRound.getPathNode(),
                name: StructureActionName.RemoveQualifier,
                recreateStructureNameService: true
            });
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
                borderQualifyGroup.getChildRound().getCompetition(),
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
            let initialMaxNrOfPoulePlaces;
            let pathNode;
            let borderQualifyGroup = this.parentRound.getBorderQualifyGroup(target);
            if (borderQualifyGroup === undefined) {
                const minNrOfPlacesPerPoule = this.structureEditor.getMinPlacesPerPouleSmall();
                initialMaxNrOfPoulePlaces = minNrOfPlacesPerPoule;
                // if (target === QualifyTarget.Losers) {
                //     console.log('AddQualifier Pre');
                //     console.log(this.parentRound);
                // }
                this.structureEditor.addChildRound(this.parentRound, target, [minNrOfPlacesPerPoule]);
                // if (target === QualifyTarget.Losers) {
                //     console.log('AddQualifier Post');
                //     console.log(this.parentRound);
                // }
                borderQualifyGroup = this.parentRound.getBorderQualifyGroup(target);
                pathNode = borderQualifyGroup.getChildRound().getPathNode()    
            } else {
                pathNode = borderQualifyGroup.getChildRound().getPathNode();
                if (this.lastAction && this.lastAction.pathNode?.pathToString() === pathNode.pathToString()
                    && this.lastAction.name === StructureActionName.AddQualifier) {
                    initialMaxNrOfPoulePlaces = this.lastAction.initialMaxNrOfPoulePlaces;
                } else {
                    initialMaxNrOfPoulePlaces = borderQualifyGroup.getChildRound().getFirstPoule().getPlaces().length;
                }
                this.structureEditor.addQualifiers(this.parentRound, target, 1, borderQualifyGroup.getDistribution(), initialMaxNrOfPoulePlaces);
            }
            

            this.addAction.emit({
                pathNode,
                name: StructureActionName.AddQualifier,
                initialMaxNrOfPoulePlaces,
                recreateStructureNameService: true
            });
        } catch (e: any) {
            this.setAlert(IAlertType.Danger, e.message);
        }
    }

    splitQualifyGroupFrom(singleRule: HorizontalSingleQualifyRule | VerticalSingleQualifyRule) {
        this.resetAlert();
        try {
            console.log(singleRule.getGroup());
            this.structureEditor.splitQualifyGroupFrom(singleRule.getGroup(), singleRule);            
            this.addAction.emit({
                pathNode: this.parentRound.getPathNode(),
                name: StructureActionName.SplitQualifyGroupsFrom,
                recreateStructureNameService: true
            });
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
            this.addAction.emit({
                pathNode: this.parentRound.getPathNode(),
                name: StructureActionName.MergeQualifyGroupWithNext,
                recreateStructureNameService: true
            });
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

    //
    // Het zou dan worden  
    // "Valencia Ladies"
    // 9 x L
    // 2 x XL
    // "Valencia"
    // 1 x 2XL
    // Jim trainingsshirt
    // 1 x 4XL
    isQualifyGroupMergableWithNext(qualifyGroup: QualifyGroup): boolean {
        const next = qualifyGroup.getNext();
        if (next === undefined) {
            return false;
        }
        return this.structureEditor.areQualifyGroupsMergable(qualifyGroup, next);
    }

    isQualifyGroupSplittable(qualifyGroup: QualifyGroup): boolean {
        //console.log('isQualifyGroupSplittable',qualifyGroup);
        let singleRule: HorizontalSingleQualifyRule | VerticalSingleQualifyRule | undefined = qualifyGroup.getFirstSingleRule();
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

    isQualifyTargetBtnActive(target: QualifyTarget): boolean {
        if( this.areSomeQualifyGroupsEditable(target) ) {
            return true;
        }
        const nrOfPoules = this.parentRound.getQualifyGroups(target).
            reduce((sum: number, current: QualifyGroup): number => {
                const nrOfPoules = current.getChildRound().getPoules().length;
                return sum + nrOfPoules
            }, 0);
            
        return nrOfPoules  > 1;
    }
    getBlinkQualifierBtnClass(target: QualifyTarget): string {
        const blinkInfoViewed = this.getQualifyInfoViewedFromLocalStorage();
        return (!blinkInfoViewed && this.isQualifyTargetBtnActive(target) ) ? 'blink' : '';
    }
    
    getQualifyInfoViewedFromLocalStorage(): boolean {
        return localStorage.getItem('qualify-info-viewed') !== null;
    }

    showQualifGroupOptionsModal(modalContent: TemplateRef<any>): void {
       if( !this.getQualifyInfoViewedFromLocalStorage() ) {
        localStorage.setItem('qualify-info-viewed', '1')
       }

        const activeModal = this.modalService.open(modalContent);
        activeModal.result.then((result) => {
          // this.linkToPlanningConfig();
        }, (reason) => { });
      

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