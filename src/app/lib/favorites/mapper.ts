import { Injectable } from '@angular/core';
import { Category } from 'ngx-sport';
import { Favorites } from '../favorites';
import { Tournament } from '../tournament';
import { JsonFavorites } from './json';

@Injectable({
    providedIn: 'root'
})
export class FavoritesMapper {
    constructor() { }

    toObject(json: JsonFavorites, tournament: Tournament, categories: Category[] | undefined): Favorites {

        const favorites = new Favorites(tournament);
        json.competitorIds.forEach((competitorId: number) => {
            const competitor = tournament.getCompetitors().find(competitorIt => {
                return competitorIt.getId() === competitorId;
            });
            if (competitor) {
                favorites.addCompetitor(competitor);
            }
        });
        json.refereeIds.forEach((refereeId: number) => {
            const referee = tournament.getCompetition().getReferees().find(refereeIt => {
                return refereeIt.getId() === refereeId;
            });
            if (referee) {
                favorites.addReferee(referee);
            }
        });
        if (categories !== undefined) {
            json.categoryNames.forEach((name: string) => {
                const category = categories.find(categoryIt => categoryIt.getName() === name);
                if (category) {
                    favorites.addCategory(category);
                }
            });
        }
        return favorites;
    }

    toJson(favorites: Favorites): JsonFavorites {
        return {
            tournamentId: favorites.getTournament().getId(),
            categoryNames: favorites.getCategoryNames(),
            competitorIds: favorites.getCompetitorIds(),
            refereeIds: favorites.getRefereeIds()
        };
    }
}