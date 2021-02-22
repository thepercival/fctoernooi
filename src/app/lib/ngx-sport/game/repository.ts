import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { AgainstGame, Game, GameMapper, JsonAgainstGame, JsonTogetherGame, Poule, TogetherGame } from 'ngx-sport';
import { Tournament } from '../../tournament';

@Injectable({
    providedIn: 'root'
})
export class GameRepository extends APIRepository {

    constructor(
        private mapper: GameMapper, private http: HttpClient) {
        super();
    }

    getUrlpostfix(suffix: string): string {
        return 'games' + suffix;
    }

    getUrl(tournament: Tournament, suffix: string): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix(suffix);
    }

    editObject(jsonGame: JsonAgainstGame | JsonTogetherGame, game: AgainstGame | TogetherGame, poule: Poule, tournament: Tournament): Observable<Game> {
        if (game instanceof AgainstGame) {
            return this.editAgainst(<JsonAgainstGame>jsonGame, game, poule, tournament);
        }
        return this.editTogether(<JsonTogetherGame>jsonGame, game, poule, tournament);
    }

    private editAgainst(jsonGame: JsonAgainstGame, game: AgainstGame, poule: Poule, tournament: Tournament): Observable<AgainstGame> {
        const url = this.getUrl(tournament, 'against') + '/' + game.getId();
        return this.http.put<JsonAgainstGame>(url, jsonGame, this.getCustomOptions(poule)).pipe(
            map((jsonGameRes: JsonAgainstGame) => this.mapper.toExistingAgainst(jsonGameRes, game)),
            catchError((err) => this.handleError(err))
        );
    }

    private editTogether(jsonGame: JsonTogetherGame, game: TogetherGame, poule: Poule, tournament: Tournament): Observable<Game> {
        const url = this.getUrl(tournament, 'together') + '/' + game.getId();
        return this.http.put<JsonTogetherGame>(url, jsonGame, this.getCustomOptions(poule)).pipe(
            map((jsonGameRes: JsonTogetherGame) => this.mapper.toExistingTogether(jsonGameRes, game)),
            catchError((err) => this.handleError(err))
        );
    }


    protected getCustomOptions(poule: Poule): { headers: HttpHeaders; params: HttpParams } {
        let httpParams = new HttpParams();
        httpParams = httpParams.set('pouleId', poule.getId().toString());
        return {
            headers: super.getHeaders(),
            params: httpParams
        };
    }
}
