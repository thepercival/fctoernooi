import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { Game, GameMapper, JsonGame, Poule } from 'ngx-sport';
import { Tournament } from '../../tournament';


@Injectable()
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

    editObject(game: Game, poule: Poule, tournament: Tournament): Observable<Game> {
        const url = this.getUrl(tournament) + '/' + game.getId();
        return this.http.put(url, this.mapper.toJson(game), this.getCustomOptions(poule)).pipe(
            map((jsonGame: JsonGame) => this.mapper.toObject(jsonGame, game.getPoule(), game)),
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
