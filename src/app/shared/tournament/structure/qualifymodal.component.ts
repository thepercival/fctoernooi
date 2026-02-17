import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HorizontalSingleQualifyRule, QualifyDistribution, QualifyGroup, QualifyTarget, Round, StructureEditor, StructureNameService, VerticalSingleQualifyRule } from 'ngx-sport';
import { CSSService } from '../../common/cssservice';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';

@Component({
    selector: 'app-ngbd-modal-qualify',
    templateUrl: './qualifymodal.component.html',
    styleUrls: ['./qualifymodal.component.scss'],
    standalone: true,
    imports: [TOURNAMENT_UI_IMPORTS],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QualifyModalComponent {
    readonly _target = input.required<QualifyTarget>();
    readonly _parentRound = input.required<Round>(); 
    readonly _structureEditor = input.required<StructureEditor>();
    readonly _structureNameService = input.required<StructureNameService>();

    readonly onDistributionUpdate = output<QualifyDistribution>();
    readonly onQualifyGroupFromSplit = output<HorizontalSingleQualifyRule|VerticalSingleQualifyRule>(); 
    readonly onQualifyGroupWithNextMerge = output<QualifyGroup>(); 

    public modal: NgbActiveModal = inject(NgbActiveModal);
    
    constructor(public cssService: CSSService) {
        
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

    get target(): QualifyTarget {
        return this._target();
    }

    get parentRound(): Round {
        return this._parentRound();
    }

    get structureEditor(): StructureEditor {
        return this._structureEditor();
    }

    get structureNameService(): StructureNameService {
        return this._structureNameService();
    }
}
