import { ChangeDetectionStrategy, Component, OnInit, input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Competitor, Place, Round, StartLocationMap, Structure, StructureNameService } from 'ngx-sport';
import { TournamentCompetitor } from '../../../lib/competitor';
import { LockerRoom } from '../../../lib/lockerroom';
import { LockerRoomValidator } from '../../../lib/lockerroom/validator';
import { TOURNAMENT_UI_IMPORTS } from '../tournament.ui-imports';

@Component({
    selector: 'app-ngbd-modal-competitor-choose',
    templateUrl: './competitorchoosemodal.component.html',
    styleUrls: ['./competitorchoosemodal.component.scss'],
    imports: [TOURNAMENT_UI_IMPORTS],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class CompetitorChooseModalComponent implements OnInit {
    readonly _validator = input.required<LockerRoomValidator>();
    readonly _structure = input.required<Structure>();
    readonly _competitors = input<Competitor[]>([]);
    readonly _lockerRoom = input.required<LockerRoom>();
    readonly _selectedCompetitors = input<Competitor[]>([]);
    readonly _competitorsAssignedElsewhere = input<Competitor[]>([]);
    public competitorLists: CompetitorList[] = [];
    public structureNameService!: StructureNameService;
    public startLocationMap!: StartLocationMap;
    public changed = false;

    constructor(
        public favRepository = inject(FavoritesRepository),
        public activeModal = inject(NgbActiveModal) 
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

    alreadyAssignedElsewhere(competitor: TournamentCompetitor): boolean {
        return this.competitorsAssignedElsewhere.find(competitorIt => competitorIt === competitor) !== undefined
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

    get validator(): LockerRoomValidator {
        return this._validator();
    }

    get structure(): Structure {
        return this._structure();
    }

    get competitors(): Competitor[] {
        return this._competitors();
    }

    get lockerRoom(): LockerRoom {
        return this._lockerRoom();
    }

    get selectedCompetitors(): Competitor[] {
        return this._selectedCompetitors();
    }

    get competitorsAssignedElsewhere(): Competitor[] {
        return this._competitorsAssignedElsewhere();
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