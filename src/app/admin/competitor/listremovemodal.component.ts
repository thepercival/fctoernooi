import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Place, Competitor } from 'ngx-sport';

@Component({
    selector: 'app-ngbd-modal-listremove',
    templateUrl: './listremovemodal.component.html',
    styleUrls: ['./listremovemodal.component.scss']
})
export class CompetitorListRemoveModalComponent {
    place: Place;
    competitor: Competitor;
    allPlacesAssigned: boolean;

    constructor(public activeModal: NgbActiveModal) { }

    hasMinimumNrOfPlacesPerPoule() {
        const rootRound = this.place.getPoule().getRound();
        return (rootRound.getPoules().length * 2) === rootRound.getNrOfPlaces();
    }

    allCompetitorsQualifyForNextRound() {
        const rootRound = this.place.getPoule().getRound();
        return rootRound.getNrOfPlaces() <= rootRound.getNrOfPlacesChildren();
    }
}
