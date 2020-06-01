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
export class CompetitorChooseModalComponent implements OnInit {
    @Input() validator: LockerRoomValidator;
    @Input() places: Place[];
    @Input() lockerRoom: LockerRoom;
    @Input() selectedCompetitors: Competitor[];
    public competitorListItems: CompetitorListItem[] = [];
    public changed = false;

    constructor(public nameService: NameService, public activeModal: NgbActiveModal) {
    }

    ngOnInit() {
        this.places.forEach((place: Place) => {
            this.competitorListItems.push({
                placeName: this.nameService.getPlaceFromName(place, false),
                competitor: place.getCompetitor(),
                selected: this.isSelected(place.getCompetitor()),
                nrOtherLockerRooms: this.validator.nrArranged(place.getCompetitor(), this.lockerRoom)
            });
        });
    }

    hasSelectableCompetitors(): boolean {
        return this.validator && this.validator.getCompetitors().length > 0;
    }

    private isSelected(competitor?: Competitor): boolean {
        return competitor && this.selectedCompetitors.indexOf(competitor) >= 0;
    }

    toggle(competitorListItem: CompetitorListItem) {
        competitorListItem.selected = !competitorListItem.selected;
        this.changed = true;
    }

    getSelectedCompetitors(): Competitor[] {
        return this.competitorListItems.filter(competitorListItem => competitorListItem.selected).map(competitorListItem => competitorListItem.competitor);
    }
}

interface CompetitorListItem {
    placeName: string;
    competitor: Competitor;
    selected: boolean;
    nrOtherLockerRooms: number;
}
