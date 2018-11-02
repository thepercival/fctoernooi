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

    hasMinimumNrOfTeamsPerPoule() {
        const firstRound = this.poulePlace.getPoule().getRound();
        return (firstRound.getPoules().length * 2) === firstRound.getPoulePlaces().length;
    }

    allCompetitorsQualifyForNextRound() {
        const firstRound = this.poulePlace.getPoule().getRound();
        return firstRound.getPoulePlaces().length <= firstRound.getNrOfPlacesChildRounds();
    }

    allPoulePlacesHaveCompetitor() {
        const firstRound = this.poulePlace.getPoule().getRound();
        return firstRound.getPoulePlaces().every(poulePlace => poulePlace.getTeam() !== undefined);
    }
}
