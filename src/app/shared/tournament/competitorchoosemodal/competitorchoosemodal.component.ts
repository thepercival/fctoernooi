import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NameService, Competitor, Place, Round, RoundNumber } from 'ngx-sport';
import { LockerRoom } from '../../../lib/lockerroom';
import { LockerRoomValidator } from '../../../lib/lockerroom/validator';

@Component({
    selector: 'app-ngbd-modal-competitor-choose',
    templateUrl: './competitorchoosemodal.component.html',
    styleUrls: ['./competitorchoosemodal.component.scss']
})
export class CompetitorChooseModalComponent {
    @Input() validator: LockerRoomValidator;
    @Input() places: Place[];
    @Input() lockerRoom: LockerRoom;
    @Input() selectedCompetitors: Competitor[];
    changed = false;

    constructor(public nameService: NameService, public activeModal: NgbActiveModal) {
    }

    hasSelectableCompetitors(): boolean {
        return this.validator && this.validator.getCompetitors().length > 0;
    }

    isSelected(place: Place): boolean {
        return place.getCompetitor() && this.selectedCompetitors.indexOf(place.getCompetitor()) >= 0;
    }

    toggle(competitor: Competitor) {
        const idx = this.selectedCompetitors.indexOf(competitor);
        if (idx >= 0) {
            this.selectedCompetitors.splice(idx, 1);
        } else {
            this.selectedCompetitors.push(competitor);
        }
        this.changed = true;
    }
}
