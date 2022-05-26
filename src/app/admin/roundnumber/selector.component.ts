import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Structure, RoundNumber, NameService, StructureNameService } from 'ngx-sport';

@Component({
    selector: 'app-ngbd-modal-roundnumbers',
    templateUrl: './selector.component.html',
})
export class RoundNumbersSelectorModalComponent implements OnInit {
    @Input() structure!: Structure;
    @Input() subject!: string;
    public structureNameService: StructureNameService;
    processing = true;

    constructor(
        public activeModal: NgbActiveModal
    ) {
        this.structureNameService = new StructureNameService();
    }

    ngOnInit() {
        this.processing = false;
    }

    sendRoundNumber(roundNumber: RoundNumber) {
        if (!roundNumber.hasBegun()) {
            this.activeModal.close(roundNumber);
        }
        this.processing = false;
    }

    isFirstChoosable(roundNumber: RoundNumber): boolean {
        const previous = roundNumber.getPrevious();
        return !roundNumber.hasBegun() && (previous === undefined || previous.hasBegun());
    }

    showDifferentConfig(roundNumber: RoundNumber): boolean {
        return roundNumber.getPlanningConfig() !== undefined && !this.isFirstChoosable(roundNumber) && !roundNumber.hasBegun();
    }
}
