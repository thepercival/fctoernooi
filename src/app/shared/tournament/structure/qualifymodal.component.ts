import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HorizontalSingleQualifyRule, QualifyDistribution, QualifyGroup, QualifyTarget, Round, StructureEditor, StructureNameService, VerticalSingleQualifyRule } from 'ngx-sport';
import { CSSService } from '../../common/cssservice';

@Component({
    selector: 'app-ngbd-modal-qualify',
    templateUrl: './qualifymodal.component.html',
    styleUrls: ['./qualifymodal.component.scss']
})
export class QualifyModalComponent {
    @Input() target!: QualifyTarget;
    @Input() parentRound!: Round; 
    @Input() structureEditor!: StructureEditor;
    @Input() structureNameService!: StructureNameService;

    @Output() updateDistribution = new EventEmitter<QualifyDistribution>();
    @Output() splitQualifyGroupFrom = new EventEmitter<HorizontalSingleQualifyRule|VerticalSingleQualifyRule>(); 
    @Output() mergeQualifyGroupWithNext = new EventEmitter<QualifyGroup>(); 
    
    constructor(public modal: NgbActiveModal, public cssService: CSSService) {
        
    }

    get HorizontalSnake(): QualifyDistribution { return QualifyDistribution.HorizontalSnake; }
    get Vertical(): QualifyDistribution { return QualifyDistribution.Vertical; }

    getDistribution(target: QualifyTarget): QualifyDistribution | undefined {
        const qualifyGroup = this.parentRound.getBorderQualifyGroup(target);
        return qualifyGroup.getDistribution();
    }

    secondPartEditable(): boolean {
        return this.structureEditor.isSomeQualifyGroupSplittable(this.parentRound, this.target)
            || this.structureEditor.isSomeQualifyGroupMergable(this.parentRound, this.target)
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

    getTargetDirectionClass(target: QualifyTarget): string {
        return target === QualifyTarget.Losers ? 'flex-column-reverse' : '';
    }
}
