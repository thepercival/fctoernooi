import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-ngbd-modal-info',
    templateUrl: './infomodal.component.html',
    styleUrls: ['./infomodal.component.scss']
})
export class InfoModalComponent {
    @Input() header: string = '';
    @Input() modalContent!: TemplateRef<any>;
    @Input() noHeaderBorder: boolean = false;

    constructor(public activeModal: NgbActiveModal) {

    }

    close(value: string) {
        this.activeModal.close(value);
    }
}