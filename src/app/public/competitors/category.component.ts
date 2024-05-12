import { Component, Input, OnInit, TemplateRef } from '@angular/core';

import { Category, Competitor, Place, StartLocationMap, StructureNameService } from 'ngx-sport';
import { AuthService } from '../../lib/auth/auth.service';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { Favorites } from '../../lib/favorites';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { PlaceCompetitorItem } from '../../lib/ngx-sport/placeCompetitorItem';
import { TournamentCompetitor } from '../../lib/competitor';
import { CompetitorRepository } from '../../lib/ngx-sport/competitor/repository';
import { InfoModalComponent } from '../../shared/tournament/infomodal/infomodal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-tournament-competitors-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss']
})
export class CompetitorsCategoryComponent implements OnInit {
    @Input() category!: Category;
    @Input() favorites!: Favorites;
    @Input() showHeader!: boolean;
    @Input() showLockerRoom = false;
    @Input() lockerRoomMap!: Map<string, string>;
    @Input() structureNameService!: StructureNameService;
    
    public hasSomeCompetitorAnImage: boolean = false;
    public placeCompetitorItems: PlaceCompetitorItem[] = [];
    public modalCompetitor: Competitor|undefined;

    constructor(
        protected tournamentMapper: TournamentMapper,
        protected favRepository: FavoritesRepository,
        public competitorRepository: CompetitorRepository,
        protected authService: AuthService,
        private modalService: NgbModal,
    ) {

    }

    ngOnInit() {
        const map = this.structureNameService.getStartLocationMap();
        if (map !== undefined) {
            this.setPlaceCompetitorItems(map);            
            this.hasSomeCompetitorAnImage = this.placeCompetitorItems.some((competitorItem: PlaceCompetitorItem): boolean => {
                return (competitorItem.competitor !== undefined && this.competitorRepository.hasLogoExtension(competitorItem.competitor));
            });
        }
        
    }

    getId(competitor: Competitor): string {
        return 'competitor-select-' + competitor.getId();
    }

    toggleFavoriteCompetitor(competitor: Competitor) {
        if (this.favorites.hasCompetitor(competitor)) {
            this.favorites.removeCompetitor(competitor);
            if (!this.favorites.hasCategorySomeCompetitor(this.category)) {
                this.favorites.removeCategory(this.category);
            }
        } else {
            this.favorites.addCompetitor(competitor);
            if (!this.favorites.hasCategory(this.category)) {
                this.favorites.addCategory(this.category);
            }
        }
        this.favRepository.editObject(this.favorites);
    }


    getLockerRoomDescription(competitor: TournamentCompetitor): string {
        return this.lockerRoomMap.get('comp-' + competitor.getId()) ?? '';
    }

    setPlaceCompetitorItems(map: StartLocationMap): void {
        this.placeCompetitorItems = this.category.getRootRound().getPlaces().map((place: Place): PlaceCompetitorItem => {
            const startLocation = place.getStartLocation();
            const competitor = startLocation ? map.getCompetitor(startLocation) : undefined;
            return { place, competitor: <TournamentCompetitor | undefined>competitor };
        });
    }

    openInfoModal(modalContent: TemplateRef<any>, competitor: Competitor|undefined) {
        if (!competitor?.getPublicInfo() ) {
            return;
        }
        const activeModal = this.modalService.open(InfoModalComponent, { windowClass: 'info-modal' });
        activeModal.componentInstance.header = competitor.getName();
        this.modalCompetitor = competitor;
        activeModal.componentInstance.modalContent = modalContent;
        // activeModal.result.then((result) => {
            
        // }, (reason) => {
        // });
    }
}
