import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Structure, NameService, Round, CompetitionSport } from 'ngx-sport';

@Component({
    selector: 'app-ngbd-modal-rounds',
    templateUrl: './selector.component.html',
})
export class RoundsSelectorModalComponent implements OnInit {
    @Input() subject: string;
    @Input() structure: Structure;
    @Input() competitionSport: CompetitionSport;
    @Input() hasOwnConfig: Function;
    @Input() toggleRound: ToggleRound;

    public nameService: NameService;
    public someRoundSelected: boolean = false;
    processing = true;

    constructor(
        public activeModal: NgbActiveModal
    ) {
        this.nameService = new NameService(undefined);
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
        console.log('close()', this.toggleRound);
        return this.activeModal.close(this.toggleRound);
    }
}

export interface ToggleRound {
    parent: ToggleRound | undefined;
    round: Round;
    selected: boolean;
    children: ToggleRound[];
}
