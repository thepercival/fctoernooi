import { Component, input, signal, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Structure, RoundNumber, StructureNameService } from 'ngx-sport';
import { EscapeHtmlPipe } from '../../shared/common/escapehtmlpipe';

@Component({
    selector: 'app-ngbd-modal-roundnumbers',
    templateUrl: './selector.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [EscapeHtmlPipe]
})
export class RoundNumbersSelectorModalComponent implements OnInit {
    activeModal = inject(NgbActiveModal);

    public structure = input.required<Structure>();
    public subject = input.required<string>();
    public initialRoundNumber = input<RoundNumber | undefined>(undefined);
    public structureNameService: StructureNameService;
    public readonly processing = signal(true);
    public readonly selectedNumber = signal<number | undefined>(undefined);

    isSelected(roundNumber: RoundNumber): boolean {
        const selected = this.selectedNumber();
        return selected !== undefined && roundNumber.getNumber() >= selected && !roundNumber.hasBegun();
    }

    selectRoundNumber(roundNumber: RoundNumber) {
        if (roundNumber.hasBegun()) { return; }
        if (this.isSelected(roundNumber)) {
            // turn off: deselect clicked item and everything above → start from next
            const next = roundNumber.getNext();
            this.selectedNumber.set(next !== undefined && !next.hasBegun() ? next.getNumber() : undefined);
        } else {
            // turn on: select from clicked item downward
            this.selectedNumber.set(roundNumber.getNumber());
        }
    }

    confirm() {
        const selected = this.selectedNumber();
        if (selected === undefined) { return; }
        const roundNumber = this.structure().getRoundNumber(selected);
        if (roundNumber !== undefined) {
            this.activeModal.close(roundNumber);
        }
    }
    constructor() {
        this.structureNameService = new StructureNameService();
    }

    ngOnInit() {
        const initial = this.initialRoundNumber();
        if (initial !== undefined) {
            this.selectedNumber.set(initial.getNumber());
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
