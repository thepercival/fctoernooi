import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faPrint } from '@fortawesome/free-solid-svg-icons';


@Component({
    selector: 'app-ngbd-modal-export-print',
    templateUrl: './print-service-modal.component.html',
    styleUrls: ['./print-service-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FaIconComponent],
    
})
export class PrintServiceModalComponent {
    faPrint = faPrint;

    constructor(public activeModal: NgbActiveModal) {
    }    
}