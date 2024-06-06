import { Component, OnInit } from '@angular/core';
import { Tournament } from '../../lib/tournament';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'app-ngbd-modal-export-print',
    templateUrl: './print-service-modal.component.html',
    styleUrls: ['./print-service-modal.component.scss']
})
export class PrintServiceModalComponent {
    constructor(public activeModal: NgbActiveModal) {
    }    
}