import { Injectable } from '@angular/core';
import { Favorites } from '../favorites';
import { Tournament } from '../tournament';
import { JsonFavorites } from './json';

@Injectable({
    providedIn: 'root'
})
export class FavoritesMapper {
    constructor() { }

    toObject(json: JsonFavorites, tournament: Tournament): Favorites {

        const favorites = new Favorites(tournament);
        json.competitorIds.forEach(competitorId => {
            const competitor = tournament.getCompetitors().find(competitorIt => {
                return competitorIt.getId() === competitorId;
            });
            if (competitor) {
                favorites.addCompetitor(competitor);
            }
        });
        json.refereeIds.forEach(refereeId => {
            const referee = tournament.getCompetition().getReferees().find(refereeIt => {
                return refereeIt.getId() === refereeId;
            });
            if (referee) {
                favorites.addReferee(referee);
            }
        });

        return favorites;
    }

    toJson(favorites: Favorites): JsonFavorites {
        return {
            tournamentId: favorites.getTournament().getId(),
            competitorIds: favorites.getTournament().getCompetitors().map(competitor => {
                return +competitor.getId();
            }),
            refereeIds: favorites.getTournament().getCompetition().getReferees().map(referee => {
                return referee.getId();
            })
        };
    }
}