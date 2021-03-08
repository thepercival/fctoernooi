import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NameService, Competitor, Place, Round, RoundNumber, CompetitorMap } from 'ngx-sport';
import { TournamentCompetitor } from '../../../lib/competitor';
import { LockerRoom } from '../../../lib/lockerroom';
import { LockerRoomValidator } from '../../../lib/lockerroom/validator';

@Component({
    selector: 'app-ngbd-modal-competitor-choose',
    templateUrl: './competitorchoosemodal.component.html',
    styleUrls: ['./competitorchoosemodal.component.scss']
})
export class CompetitorChooseModalComponent implements OnInit {
    @Input() validator!: LockerRoomValidator;
    @Input() places: Place[] = [];
    @Input() competitors: Competitor[] = [];
    @Input() lockerRoom!: LockerRoom;
    @Input() selectedCompetitors: Competitor[] = [];
    public competitorListItems: CompetitorListItem[] = [];
    public nameService!: NameService;
    public competitorMap!: CompetitorMap;
    public changed = false;

    constructor(public activeModal: NgbActiveModal) {
    }

    ngOnInit() {
        this.competitorMap = new CompetitorMap(this.competitors);
        this.nameService = new NameService(this.competitorMap);
        this.places.forEach((place: Place) => {
            const competitor = <TournamentCompetitor>this.competitorMap.getCompetitor(place);
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

    getId(competitor: TournamentCompetitor): string {
        return 'competitor-select-' + competitor.getId();
    }

    getSelectClass(competitorListItem: CompetitorListItem): string {
        return competitorListItem.nrOtherLockerRooms > 0 ? 'custom-switch-warning' : ''
    }

    private isSelected(competitor?: TournamentCompetitor): boolean {
        return competitor !== undefined && this.selectedCompetitors.indexOf(competitor) >= 0;
    }

    toggle(competitorListItem: CompetitorListItem) {
        competitorListItem.selected = !competitorListItem.selected;
        this.changed = true;
    }

    getSelectedCompetitors(): TournamentCompetitor[] {
        return this.competitorListItems.filter(competitorListItem => competitorListItem.selected).map(competitorListItem => competitorListItem.competitor);
    }
}

interface CompetitorListItem {
    placeName: string;
    competitor: TournamentCompetitor;
    selected: boolean;
    nrOtherLockerRooms: number;
}
