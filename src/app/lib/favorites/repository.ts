import { Injectable } from '@angular/core';

import { Tournament } from '../../lib/tournament';
import { Favorites } from '../favorites';
import { FavoritesMapper } from './mapper';
import { FavoritesBackEnd } from './backend';
import { Category } from 'ngx-sport';

@Injectable({
    providedIn: 'root'
})
export class FavoritesRepository {

    protected backend: FavoritesBackEnd;
    protected mapper: FavoritesMapper;

    constructor() {
        this.backend = new FavoritesBackEnd();
        this.mapper = new FavoritesMapper();
    }

    hasObject(tournamentId: number | string): boolean {
        return this.backend.has(tournamentId);
    }

    getObject(tournament: Tournament, categories: Category[] | undefined): Favorites {
        return this.mapper.toObject(this.backend.get(tournament.getId()), tournament, categories);
    }

    editObject(favorites: Favorites) {
        this.backend.remove(favorites.getTournament().getId());
        this.backend.post(this.mapper.toJson(favorites));
    }
}
