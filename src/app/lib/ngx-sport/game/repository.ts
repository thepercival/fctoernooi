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

    getUrlpostfix(): string {
        return 'games';
    }

    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    editObject(game: AgainstGame | TogetherGame, poule: Poule, tournament: Tournament): Observable<Game> {
        if (game instanceof AgainstGame) {
            return this.editAgainst(game, poule, tournament);
        }
        return this.editTogether(game, poule, tournament);
    }

    private editAgainst(game: AgainstGame, poule: Poule, tournament: Tournament): Observable<AgainstGame> {
        const url = this.getUrl(tournament) + '/' + game.getId();
        return this.http.put(url, this.mapper.toJsonAgainst(game), this.getCustomOptions(poule)).pipe(
            map((jsonGame: JsonAgainstGame) => this.mapper.toExistingAgainst(jsonGame, game)),
            catchError((err) => this.handleError(err))
        );
    }

    private editTogether(game: TogetherGame, poule: Poule, tournament: Tournament): Observable<Game> {
        const url = this.getUrl(tournament) + '/' + game.getId();
        return this.http.put(url, this.mapper.toJsonTogether(game), this.getCustomOptions(poule)).pipe(
            map((jsonGame: JsonTogetherGame) => this.mapper.toExistingTogether(jsonGame, game)),
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
