import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Structure, RoundNumber, NameService } from 'ngx-sport';

@Component({
    selector: 'app-ngbd-modal-roundnumbers',
    templateUrl: './selector.component.html',
})
export class RoundNumbersSelectorModalComponent implements OnInit {
    @Input() structure!: Structure;
    @Input() subject!: string;
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
