import { Component, Input, OnInit } from '@angular/core';

import { AgainstRuleSet, Category, CompetitionSport, Competitor, Place, StartLocationMap, StructureNameService } from 'ngx-sport';
import { AuthService } from '../../lib/auth/auth.service';
import { TournamentMapper } from '../../lib/tournament/mapper';
import { Favorites } from '../../lib/favorites';
import { TournamentScreen } from '../../shared/tournament/screenNames';
import { FavoritesRepository } from '../../lib/favorites/repository';
import { PlaceCompetitorItem } from '../../lib/ngx-sport/placeCompetitorItem';
import { TournamentCompetitor } from '../../lib/competitor';

@Component({
    selector: 'app-tournament-favorites-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss']
})
export class FavoritesCategoryComponent implements OnInit {
    @Input() category!: Category;
    @Input() favorites!: Favorites;
    @Input() showHeader!: boolean;
    @Input() structureNameService!: StructureNameService;

    public placeCompetitorItems: PlaceCompetitorItem[] = [];

    constructor(
        protected tournamentMapper: TournamentMapper,
        protected favRepository: FavoritesRepository,
        protected authService: AuthService
    ) {

    }

    ngOnInit() {
        const map = this.structureNameService.getStartLocationMap();
        if (map !== undefined) {
            this.setPlaceCompetitorItems(map);
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

    setPlaceCompetitorItems(map: StartLocationMap): void {
        this.placeCompetitorItems = this.category.getRootRound().getPlaces().map((place: Place): PlaceCompetitorItem => {
            const startLocation = place.getStartLocation();
            const competitor = startLocation ? map.getCompetitor(startLocation) : undefined;
            return { place, competitor: <TournamentCompetitor | undefined>competitor };
        });
    }
}
