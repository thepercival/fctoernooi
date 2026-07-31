import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgbActiveModal, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { COPIED_MODAL_INPUTS } from '../../shared/modal-input-interfaces/copied-modal-inputs.interface';

@Component({
    selector: 'app-ngbd-modal-copied',
    templateUrl: './copiedmodal.component.html',
    styleUrls: ['./copiedmodal.component.scss'],
    standalone: true,
    imports: [NgbAlert],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopiedModalComponent {
    modal = inject<NgbActiveModal>(NgbActiveModal);

    private readonly modalInputs = inject(COPIED_MODAL_INPUTS, { optional: true });
    previousId = '';
    title = '';
    constructor() {
        if (this.modalInputs) {
            this.previousId = this.modalInputs.previousId;
            this.title = this.modalInputs.title;
        }
    }
}
