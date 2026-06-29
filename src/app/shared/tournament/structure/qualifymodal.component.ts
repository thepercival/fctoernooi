import { ChangeDetectionStrategy, Component, InjectionToken, inject, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HorizontalSingleQualifyRule, QualifyDistribution, QualifyGroup, QualifyTarget, Round, StructureEditor, StructureNameService, VerticalSingleQualifyRule } from 'ngx-sport';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EscapeHtmlPipe } from '../../common/escapehtmlpipe';
import { CSSService } from '../../common/cssservice';
import { faCheckCircle, faCompressAlt, faExpandAlt } from '@fortawesome/free-solid-svg-icons';

export interface QualifyModalData {
    target: QualifyTarget;
    parentRound: Round;
    structureEditor: StructureEditor;
    structureNameService: StructureNameService;
}

export const QUALIFY_MODAL_DATA = new InjectionToken<QualifyModalData>('QUALIFY_MODAL_DATA');

@Component({
    selector: 'app-qualify-modal',
    templateUrl: './qualifymodal.component.html',
    imports: [FontAwesomeModule,EscapeHtmlPipe, NgTemplateOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QualifyModalComponent {

    readonly data = inject(QUALIFY_MODAL_DATA);
    public faCheckCircle = faCheckCircle;
    public faCompressAlt = faCompressAlt;
    public faExpandAlt = faExpandAlt;

    readonly onDistributionUpdate = output<QualifyDistribution>();
    readonly onQualifyGroupFromSplit = output<HorizontalSingleQualifyRule|VerticalSingleQualifyRule>(); 
    readonly onQualifyGroupWithNextMerge = output<QualifyGroup>(); 
    
    public modal: NgbActiveModal = inject(NgbActiveModal);
    
    constructor(public cssService: CSSService) {
        
    }

    get HorizontalSnake(): QualifyDistribution { return QualifyDistribution.HorizontalSnake; }
    get Vertical(): QualifyDistribution { return QualifyDistribution.Vertical; }

    getDistribution(target: QualifyTarget): QualifyDistribution | undefined {
        const qualifyGroup = this.data.parentRound.getBorderQualifyGroup(target);
        return qualifyGroup.getDistribution();
    }

    secondPartEditable(): boolean {
        return this.data.structureEditor.isSomeQualifyGroupSplittable(this.data.parentRound, this.data.target)
            || this.data.structureEditor.isSomeQualifyGroupMergable(this.data.parentRound, this.data.target)
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
        return this.data.structureEditor.areQualifyGroupsMergable(qualifyGroup, next);
    }

    getTargetDirectionClass(target: QualifyTarget): string {
        return target === QualifyTarget.Losers ? 'flex-column-reverse' : '';
    }
}
