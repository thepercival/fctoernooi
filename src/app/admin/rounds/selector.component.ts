import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Round, CompetitionSport, StructureNameService, Category } from 'ngx-sport';

@Component({
    selector: 'app-ngbd-modal-rounds',
    templateUrl: './selector.component.html',
})
export class RoundsSelectorModalComponent implements OnInit {
    @Input() subject!: string;
    @Input() competitionSport!: CompetitionSport;
    @Input() hasOwnConfig!: Function;
    @Input() selectableCategories!: SelectableCategory[];

    public structureNameService: StructureNameService;
    processing = true;

    constructor(
        public activeModal: NgbActiveModal
    ) {
        this.structureNameService = new StructureNameService(undefined);
    }

    ngOnInit() {
        this.processing = false;
        // this.someRoundSelected = this.selectableCategories.some((selectableCategory: SelectableCategory): boolean => {
        //     return this.areSomeRoundsSelected(selectableCategory.rootRoundNode);
        // });
    }

    // setSomeRoundsSelected(selectableRoundNode: SelectableRoundNode) {
    //     this.someRoundSelected = this.areSomeRoundsSelected(selectableRoundNode);
    // }

    getSomeRoundSelected(): boolean {
        return this.selectableCategories.some((selectableCategory: SelectableCategory): boolean => {
            return this.areSomeRoundsSelected(selectableCategory.rootRoundNode);
        });
    }

    protected areSomeRoundsSelected(selectableRoundNode: SelectableRoundNode): boolean {
        if (selectableRoundNode.selected) {
            return true;
        }
        return selectableRoundNode.children.some(child => this.areSomeRoundsSelected(child));
    }

    close() {
        return this.activeModal.close(this.selectableCategories);
    }
}

export interface SelectableCategory {
    category: Category;
    rootRoundNode: SelectableRoundNode;
}

export interface SelectableRoundNode {
    parent: SelectableRoundNode | undefined;
    round: Round;
    selected: boolean;
    children: SelectableRoundNode[];
}
