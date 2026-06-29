import { ChangeDetectionStrategy, Component, InjectionToken, OnInit, inject } from '@angular/core';
import { NgbActiveModal, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { Competitor, Place, Round, StartLocationMap, Structure, StructureNameService } from 'ngx-sport';
import { TournamentCompetitor } from '../../../lib/competitor';
import { LockerRoom } from '../../../lib/lockerroom';
import { LockerRoomValidator } from '../../../lib/lockerroom/validator';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';
import { FavoritesRepository } from '../../../lib/favorites/repository';
import { faDoorClosed, faUsers } from '@fortawesome/free-solid-svg-icons';

export interface CompetitorChooseModalData {
    validator: LockerRoomValidator;
    structure: Structure;
    competitors: Competitor[];
    lockerRoom: LockerRoom;
    selectedCompetitors: Competitor[];
    competitorsAssignedElsewhere: Competitor[];
}

export const COMPETITOR_CHOOSE_MODAL_DATA = new InjectionToken<CompetitorChooseModalData>('COMPETITOR_CHOOSE_MODAL_DATA');

@Component({
    selector: 'app-ngbd-modal-competitor-choose',
    templateUrl: './competitorchoosemodal.component.html',
    styleUrls: ['./competitorchoosemodal.component.scss'],
    imports: [TOURNAMENT_UI_IMPORTS, NgbAlert],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class CompetitorChooseModalComponent implements OnInit {
    readonly data = inject(COMPETITOR_CHOOSE_MODAL_DATA);
    public competitorLists: CompetitorList[] = [];
    public structureNameService!: StructureNameService;
    public startLocationMap!: StartLocationMap;
    public changed = false;
    public faUsers = faUsers;
    public faDoorClosed = faDoorClosed;

    public activeModal: NgbActiveModal = inject(NgbActiveModal) 
    public favRepository = inject(FavoritesRepository);


    ngOnInit() {
        this.startLocationMap = new StartLocationMap(this.data.competitors);
        this.structureNameService = new StructureNameService(this.startLocationMap);
        this.data.structure.getRootRounds().forEach((rootRound: Round) => {
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
                    nrOtherLockerRooms: this.data.validator.nrArranged(competitor, this.data.lockerRoom)
                });
            });
            this.competitorLists.push({
                categoryName: rootRound.getCategory().getName(),
                competitorItems
            });
        });
    }

    hasSelectableCompetitors(): boolean {
        return this.data.validator.getCompetitors().length > 0;
    }

    alreadyAssignedElsewhere(competitor: TournamentCompetitor): boolean {
        return this.data.competitorsAssignedElsewhere.find(competitorIt => competitorIt === competitor) !== undefined
    }

    getId(competitor: TournamentCompetitor): string {
        return 'competitor-select-' + competitor.getId();
    }

    getSelectClass(competitorListItem: CompetitorListItem): string {
        return competitorListItem.nrOtherLockerRooms > 0 ? 'custom-switch-warning' : ''
    }

    private isSelected(competitor?: TournamentCompetitor): boolean {
        return competitor !== undefined && this.data.selectedCompetitors.indexOf(competitor) >= 0;
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