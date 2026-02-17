import { ChangeDetectionStrategy, Component, Inject, input } from '@angular/core';
import { NgbActiveModal, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap/ng-bootstrap-alert';

@Component({
    selector: 'app-ngbd-modal-copied',
    templateUrl: './copiedmodal.component.html',
    styleUrls: ['./copiedmodal.component.scss'],
    standalone: true,
    imports: [NgbAlert],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CopiedModalComponent {
    previousId = input<string>('');
    title = input<string>('');

    constructor(@Inject(NgbActiveModal) public modal: NgbActiveModal) {
    }
}
