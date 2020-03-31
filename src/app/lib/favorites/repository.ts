import { Injectable } from '@angular/core';

import { Tournament } from '../../lib/tournament';
import { Favorites } from '../favorites';

@Injectable()
export class FavoritesRepository {

    constructor() { }

    getItem(tournament: Tournament): Favorites {
        const item = this.findItem(this.getFromLocalStorage(), tournament);
        if (item !== undefined) {
            return item;
        }
        return new Favorites(tournament.getId());
    }

    saveItem(tournament: Tournament, newItem: Favorites) {
        const items = this.getFromLocalStorage();
        // remove old item
        {
            const oldItem = this.findItem(items, tournament);
            if (oldItem !== undefined) {
                const idx = items.indexOf(oldItem);
                if (idx >= 0) {
                    items.splice(idx);
                }
            }
        }
        items.push(newItem);
        this.writeToLocalStorage(items);
    }

    protected findItem(items: Favorites[], tournament: Tournament): Favorites {
        return items.find(itemIt => itemIt.getTournamentId() === tournament.getId());
    }

    /**
     * favorites = [ { id: 12, competitorIds: [1,3,4], refereeIds: [1,5,7] }];
     */
    protected writeToLocalStorage(items: Favorites[]) {
        localStorage.setItem('favorites', JSON.stringify(items));
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
