import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";


@Component({
    selector: 'app-ngbd-modal-export-print',
    templateUrl: './print-service-modal.component.html',
    styleUrls: ['./print-service-modal.component.scss'],
    imports: [FaIconComponent],
    
})
export class PrintServiceModalComponent {
    constructor(public activeModal: NgbActiveModal) {
    }    
}