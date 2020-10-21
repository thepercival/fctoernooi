import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NameService, Competitor, Place, Round, RoundNumber, PlaceLocationMap } from 'ngx-sport';
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
    @Input() competitors: Competitor[];
    @Input() lockerRoom: LockerRoom;
    @Input() selectedCompetitors: Competitor[];
    public competitorListItems: CompetitorListItem[] = [];
    public nameService: NameService;
    public placeLocationMap: PlaceLocationMap;
    public changed = false;

    constructor(public activeModal: NgbActiveModal) {
        this.placeLocationMap = new PlaceLocationMap(this.competitors);
        this.nameService = new NameService(this.placeLocationMap);
    }

    ngOnInit() {
        this.places.forEach((place: Place) => {
            const competitor = this.placeLocationMap.getCompetitor(place);
            this.competitorListItems.push({
                placeName: this.nameService.getPlaceFromName(place, false),
                competitor: competitor,
                selected: this.isSelected(competitor),
                nrOtherLockerRooms: this.validator.nrArranged(competitor, this.lockerRoom)
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
