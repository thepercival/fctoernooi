import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faPrint } from '@fortawesome/free-solid-svg-icons';


@Component({
    selector: 'app-ngbd-modal-export-print',
    templateUrl: './print-service-modal.component.html',
    styleUrls: ['./print-service-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FaIconComponent],
    
})
export class PrintServiceModalComponent {
    activeModal = inject(NgbActiveModal);

    faPrint = faPrint;
    constructor() {
    }    
}