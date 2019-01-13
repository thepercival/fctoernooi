import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-ngbd-modal-help',
    templateUrl: './helpmodal.component.html',
    styleUrls: ['./helpmodal.component.scss']
})
export class TournamentStructureHelpModalComponent {
    uiSliderConfigExample: any = {
        behaviour: 'drag',
        margin: 1,
        step: 1,
        start: 1
    };

    constructor(public activeModal: NgbActiveModal) { }
}
