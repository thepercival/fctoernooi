import { Component, Input, OnInit } from '@angular/core';

import { Category, Competitor, Place, StartLocationMap, StructureNameService } from 'ngx-sport';
import { AuthService } from '../../lib/auth/auth.service';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { Favorites } from '../../lib/favorites';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { PlaceCompetitorItem } from '../../lib/ngx-sport/placeCompetitorItem';
import { TournamentCompetitor } from '../../lib/competitor';
import { CompetitorRepository } from '../../lib/ngx-sport/competitor/repository';

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

    constructor(
        protected tournamentMapper: TournamentMapper,
        protected favRepository: FavoritesRepository,
        public competitorRepository: CompetitorRepository,
        protected authService: AuthService
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
}
