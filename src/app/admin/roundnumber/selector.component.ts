import { Component, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Structure, RoundNumber, NameService, StructureNameService } from 'ngx-sport';
import { EscapeHtmlPipe } from '../../shared/common/escapehtmlpipe';

@Component({
    selector: 'app-ngbd-modal-roundnumbers',
    templateUrl: './selector.component.html',
    standalone: true,
    imports: [EscapeHtmlPipe]
})
export class RoundNumbersSelectorModalComponent implements OnInit {
    @Input() structure!: Structure;
    @Input() subject!: string;
    public structureNameService: StructureNameService;
    public readonly processing: WritableSignal<boolean> = signal(true);

    constructor(
        public activeModal: NgbActiveModal
    ) {
        this.structureNameService = new StructureNameService();
    }

    ngOnInit() {
        this.processing.set(false);
    }

    sendRoundNumber(roundNumber: RoundNumber) {
        if (!roundNumber.hasBegun()) {
            this.activeModal.close(roundNumber);
        }
        this.processing.set(false);
    }

    isFirstChoosable(roundNumber: RoundNumber): boolean {
        const previous = roundNumber.getPrevious();
        return !roundNumber.hasBegun() && (previous === undefined || previous.hasBegun());
    }

    showDifferentConfig(roundNumber: RoundNumber): boolean {
        return roundNumber.getPlanningConfig() !== undefined && !this.isFirstChoosable(roundNumber) && !roundNumber.hasBegun();
    }

    // @TODO CDK UPDATE
    getRoundNumbersName(startRoundNumber: RoundNumber): string {
        if (startRoundNumber.getNumber() === 1) {
            return 'alle ronden';
        }
        if (startRoundNumber.hasNext()) {
            return 'vanaf de ' + this.structureNameService.getRoundNumberName(startRoundNumber);
        }
        return 'alleen de ' + this.structureNameService.getRoundNumberName(startRoundNumber);
    }
}
