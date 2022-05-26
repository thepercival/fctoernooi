import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Round, CompetitionSport, StructureNameService } from 'ngx-sport';

@Component({
    selector: 'app-ngbd-modal-rounds',
    templateUrl: './selector.component.html',
})
export class RoundsSelectorModalComponent implements OnInit {
    @Input() subject!: string;
    @Input() competitionSport!: CompetitionSport;
    @Input() hasOwnConfig!: Function;
    @Input() toggleRound!: ToggleRound;

    public structureNameService: StructureNameService;
    public someRoundSelected: boolean = false;
    processing = true;

    constructor(
        public activeModal: NgbActiveModal
    ) {
        this.structureNameService = new StructureNameService(undefined);
    }

    ngOnInit() {
        this.processing = false;
    }

    checkRoundsSelected() {
        this.someRoundSelected = this.areSomeRoundsSelected(this.toggleRound);
    }

    protected areSomeRoundsSelected(toggleRound: ToggleRound): boolean {
        if (toggleRound.selected) {
            return true;
        }
        return toggleRound.children.some(child => this.areSomeRoundsSelected(child));
    }

    close() {
        return this.activeModal.close(this.toggleRound);
    }
}

export interface ToggleRound {
    parent: ToggleRound | undefined;
    round: Round;
    selected: boolean;
    children: ToggleRound[];
}
