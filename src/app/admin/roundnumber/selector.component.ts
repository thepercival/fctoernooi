import { Component, Input, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Structure, RoundNumber, NameService } from 'ngx-sport';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IAlert } from '../../shared/common/alert';

@Component({
    selector: 'app-ngbd-modal-roundnumbers',
    templateUrl: './selector.component.html',
})
export class ModalRoundNumbersComponent implements OnInit {
    @Input() structure: Structure;
    @Input() subject: string;
    protected roundNumber: RoundNumber;
    public nameService: NameService;
    processing = true;

    constructor(
        public activeModal: NgbActiveModal
    ) {
        this.nameService = new NameService(undefined);
    }

    ngOnInit() {
        this.processing = false;
    }
}
