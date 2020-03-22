import { Injectable } from '@angular/core';

import { Favorites } from '../../../lib/favorites';
import { Tournament } from '../../../lib/tournament';

@Injectable()
export class FavoritesRepository {
    private items: Favorites[];

    constructor() { }

    getItem(tournament: Tournament): Favorites {
        if (this.items === undefined) {
            this.items = this.getFromLocalStorage();
        }
        let item = this.items.find(item => item.getTournamentId() === tournament.getId());
        if (item !== undefined) {
            return item;
        }
        item = new Favorites(tournament.getId());
        this.items.push(item);
        return item;
    }

    itemExists(tournament: Tournament): boolean {
        return this.getItem(tournament) !== undefined;
    }

    /**
     * favorites = [ { id: 12, competitorIds: [1,3,4], refereeIds: [1,5,7] }];
     */
    writeToLocalStorage() {
        localStorage.setItem('favorites', JSON.stringify(this.items));
    }

    protected getFromLocalStorage(): Favorites[] {
        const favorites = localStorage.getItem('favorites');
        if (favorites === null) {
            return [];
        }
        return JSON.parse(favorites).map(favorite => {
            return new Favorites(favorite.tournamentId, favorite.competitorIds, favorite.refereeIds);
        });
    }
}
