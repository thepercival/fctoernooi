import { Injectable } from '@angular/core';

import { Tournament } from '../../lib/tournament';
import { JsonFavorites } from './json';

@Injectable({
    providedIn: 'root'
})
export class FavoritesBackEnd {

    protected json: JsonFavorites[] = [];
    protected identifier = 'favorites';

    constructor() { }

    get(tournament: Tournament): JsonFavorites {
        this.readAll();

        let jsonFavorites: JsonFavorites | undefined = this.find(tournament.getId());
        if (jsonFavorites === undefined) {
            jsonFavorites = {
                tournamentId: tournament.getId(),
                categoryNames: [],
                competitorIds: [],
                refereeIds: []
            };
        }
        return jsonFavorites;
    }

    post(jsonFavorites: JsonFavorites) {
        this.readAll();
        this.json.push(jsonFavorites);
        this.writeAll();
    }

    remove(tournamentId: number | string) {
        this.readAll();
        const oldItem = this.find(tournamentId);
        if (oldItem === undefined) {
            return;
        }
        const idx = this.json.indexOf(oldItem);
        if (idx >= 0) {
            this.json.splice(idx, 1);
        }

        this.writeAll();
    }

    protected find(tournamentId: number | string): JsonFavorites | undefined {
        return this.json.find(jsonFavorites => jsonFavorites.tournamentId === tournamentId);
    }

    protected readAll() {
        const favorites = localStorage.getItem(this.identifier);
        if (favorites) {
            this.json = JSON.parse(favorites);
        }
    }

    protected writeAll() {
        localStorage.setItem(this.identifier, JSON.stringify(this.json));
    }
}