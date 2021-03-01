import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PlaceCompetitorItem } from '../../lib/ngx-sport/placeCompetitorItem';

@Component({
    selector: 'app-ngbd-modal-listremove',
    templateUrl: './listremovemodal.component.html',
    styleUrls: ['./listremovemodal.component.scss']
})
export class CompetitorListRemoveModalComponent {
    item!: PlaceCompetitorItem;
    allPlacesAssigned!: boolean;

    constructor(public activeModal: NgbActiveModal) { }

    hasMinimumNrOfPlacesPerPoule() {
        const rootRound = this.item.place.getPoule().getRound();
        return (rootRound.getPoules().length * 2) === rootRound.getNrOfPlaces();
    }

    allCompetitorsQualifyForNextRound() {
        const rootRound = this.item.place.getPoule().getRound();
        return rootRound.getNrOfPlaces() <= rootRound.getNrOfPlacesChildren();
    }
}
