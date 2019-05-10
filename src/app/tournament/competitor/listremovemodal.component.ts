import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PoulePlace } from 'ngx-sport';

@Component({
    selector: 'app-ngbd-modal-listremove',
    templateUrl: './listremovemodal.component.html',
    styleUrls: ['./listremovemodal.component.scss']
})
export class TournamentListRemoveModalComponent {
    poulePlace: PoulePlace;

    constructor(public activeModal: NgbActiveModal) { }

    hasMinimumNrOfPlacesPerPoule() {
        const rootRound = this.poulePlace.getPoule().getRound();
        return (rootRound.getPoules().length * 2) === rootRound.getNrOfPlaces();
    }

    allCompetitorsQualifyForNextRound() {
        const rootRound = this.poulePlace.getPoule().getRound();
        return rootRound.getNrOfPlaces() <= rootRound.getNrOfPlacesChildren();
    }

    allPoulePlacesHaveCompetitor() {
        const rootRound = this.poulePlace.getPoule().getRound();
        return rootRound.getPlaces().every(poulePlace => poulePlace.getCompetitor() !== undefined);
    }
}
