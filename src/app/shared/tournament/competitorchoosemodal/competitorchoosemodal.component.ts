import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NameService, Competitor, Place, Round } from 'ngx-sport';

@Component({
    selector: 'app-ngbd-modal-competitor-choose',
    templateUrl: './competitorchoosemodal.component.html',
    styleUrls: ['./competitorchoosemodal.component.scss']
})
export class CompetitorChooseModalComponent {
    @Input() rootRound: Round;
    @Input() selectedCompetitors: Competitor[];

    constructor(public nameService: NameService, public activeModal: NgbActiveModal) {
    }

    selectable(place: Place): boolean {
        return place.getCompetitor() !== undefined;
    }

    competitorSelected(competitor: Competitor): boolean {
        return this.selectedCompetitors.indexOf(competitor) >= 0;
    }

    toggle(competitor: Competitor) {
        const idx = this.selectedCompetitors.indexOf(competitor);
        if (idx >= 0) {
            this.selectedCompetitors.splice(idx, 1);
        } else {
            this.selectedCompetitors.push(competitor);
        }
    }
}
