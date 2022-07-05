import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Competitor, Place, Round, StartLocationMap, Structure, StructureNameService } from 'ngx-sport';
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
    @Input() structure!: Structure;
    @Input() competitors: Competitor[] = [];
    @Input() lockerRoom!: LockerRoom;
    @Input() selectedCompetitors: Competitor[] = [];
    public competitorLists: CompetitorList[] = [];
    public structureNameService!: StructureNameService;
    public startLocationMap!: StartLocationMap;
    public changed = false;

    constructor(public activeModal: NgbActiveModal) {
    }

    ngOnInit() {
        this.startLocationMap = new StartLocationMap(this.competitors);
        this.structureNameService = new StructureNameService(this.startLocationMap);
        this.structure.getRootRounds().forEach((rootRound: Round) => {
            const competitorItems: CompetitorListItem[] = [];
            rootRound.getPlaces().forEach((place: Place) => {
                const startLocation = place.getStartLocation();
                if (startLocation === undefined) {
                    return;
                }
                const competitor = <TournamentCompetitor | undefined>this.startLocationMap.getCompetitor(startLocation);
                if (competitor === undefined) {
                    return;
                }
                competitorItems.push({
                    placeName: this.structureNameService.getPlaceFromName(place, false),
                    competitor: competitor,
                    selected: this.isSelected(competitor),
                    nrOtherLockerRooms: this.validator.nrArranged(competitor, this.lockerRoom)
                });
            });
            this.competitorLists.push({
                categoryName: rootRound.getCategory().getName(),
                competitorItems
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
        let competitorItems: TournamentCompetitor[] = [];

        this.competitorLists.forEach((competitorList: CompetitorList) => {
            const selected = competitorList.competitorItems.filter(competitorItem => competitorItem.selected).map(competitorItem => competitorItem.competitor);
            competitorItems = competitorItems.concat(selected);
        });
        return competitorItems;
    }
}

interface CompetitorList {
    categoryName: string;
    competitorItems: CompetitorListItem[];
}

interface CompetitorListItem {
    placeName: string;
    competitor: TournamentCompetitor;
    selected: boolean;
    nrOtherLockerRooms: number;
}