import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NgbActiveModal, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { PlaceCompetitorItem } from '../../lib/ngx-sport/placeCompetitorItem';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { facStructure } from '../../shared/customicons';

@Component({
    selector: 'app-ngbd-modal-listremove',
    templateUrl: './listremovemodal.component.html',
    styleUrls: ['./listremovemodal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FaIconComponent, NgbAlert],
    
})
export class CompetitorListRemoveModalComponent {
    activeModal = inject(NgbActiveModal);

    facStructure = facStructure;
    faTrashAlt = faTrashAlt;
    item!: PlaceCompetitorItem;
    allPlacesAssigned!: boolean;
    constructor() { }

    hasMinimumNrOfPlacesPerPoule() {
        const rootRound = this.item.place.getPoule().getRound();
        return (rootRound.getPoules().length * 2) === rootRound.getNrOfPlaces();
    }

    allCompetitorsQualifyForNextRound() {
        const rootRound = this.item.place.getPoule().getRound();
        return rootRound.getNrOfPlaces() <= rootRound.getNrOfPlacesChildren();
    }
}
