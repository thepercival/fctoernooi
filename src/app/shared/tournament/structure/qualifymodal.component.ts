import { Component, input, ChangeDetectionStrategy, output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { inject } from '@angular/core';
import { HorizontalSingleQualifyRule, QualifyDistribution, QualifyGroup, QualifyTarget, Round, StructureEditor, StructureNameService, VerticalSingleQualifyRule } from 'ngx-sport';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EscapeHtmlPipe } from '../../common/escapehtmlpipe';
import { CSSService } from '../../common/cssservice';

@Component({
    selector: 'app-qualify-modal',
    templateUrl: './qualifymodal.component.html',
    imports: [FontAwesomeModule,EscapeHtmlPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QualifyModalComponent {
    
    public target = input.required<QualifyTarget>();
    public parentRound = input.required<Round>(); 
    public structureEditor = input.required<StructureEditor>();
    public structureNameService = input.required<StructureNameService>();

    readonly onDistributionUpdate = output<QualifyDistribution>();
    readonly onQualifyGroupFromSplit = output<HorizontalSingleQualifyRule|VerticalSingleQualifyRule>(); 
    readonly onQualifyGroupWithNextMerge = output<QualifyGroup>(); 
    
    public modal: NgbActiveModal = inject(NgbActiveModal);
    
    constructor(public cssService: CSSService) {
        
    }

    get HorizontalSnake(): QualifyDistribution { return QualifyDistribution.HorizontalSnake; }
    get Vertical(): QualifyDistribution { return QualifyDistribution.Vertical; }

    getDistribution(target: QualifyTarget): QualifyDistribution | undefined {
        const qualifyGroup = this.parentRound().getBorderQualifyGroup(target);
        return qualifyGroup.getDistribution();
    }

    secondPartEditable(): boolean {
        return this.structureEditor().isSomeQualifyGroupSplittable(this.parentRound(), this.target())
            || this.structureEditor().isSomeQualifyGroupMergable(this.parentRound(), this.target())
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
        return this.structureEditor().areQualifyGroupsMergable(qualifyGroup, next);
    }

    getTargetDirectionClass(target: QualifyTarget): string {
        return target === QualifyTarget.Losers ? 'flex-column-reverse' : '';
    }
}
