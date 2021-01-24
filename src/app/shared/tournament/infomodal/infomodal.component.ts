import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-ngbd-modal-info',
    templateUrl: './infomodal.component.html',
    styleUrls: ['./infomodal.component.scss']
})
export class InfoModalComponent implements OnInit {
    @Input() header: string;
    @Input() modalContent: TemplateRef<any>;

    constructor(public activeModal: NgbActiveModal) {

    }

    ngOnInit() {

    }
}