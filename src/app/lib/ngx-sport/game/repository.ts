import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { AgainstGame, AgainstVariant, CompetitionSport, Game, GameMapper, JsonAgainstGame, JsonTogetherGame, Poule, TogetherGame } from 'ngx-sport';
import { Tournament } from '../../tournament';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class GameRepository extends APIRepository {

    constructor(
        private mapper: GameMapper, private http: HttpClient, router: Router) {
        super(router);
    }

    getUrlpostfix(suffix: string): string {
        return 'games' + suffix;
    }

    getUrl(tournament: Tournament, suffix: string): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix(suffix);
    }

    createObject(jsonGame: JsonAgainstGame | JsonTogetherGame, competitionSport: CompetitionSport, poule: Poule, tournament: Tournament): Observable<Game> {
        if (competitionSport.getVariant() instanceof AgainstVariant) {
            return this.addAgainst(<JsonAgainstGame>jsonGame, competitionSport, poule, tournament);
        }
        return this.addTogether(<JsonTogetherGame>jsonGame, competitionSport, poule, tournament);
    }

    private addAgainst(jsonGame: JsonAgainstGame, competitionSport: CompetitionSport, poule: Poule, tournament: Tournament): Observable<AgainstGame> {
        const url = this.getUrl(tournament, 'against');
        return this.http.post<JsonAgainstGame>(url, jsonGame, this.getCustomOptions(poule)).pipe(
            map((jsonGameRes: JsonAgainstGame) => this.mapper.toNewAgainst(jsonGameRes, poule, competitionSport)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    private addTogether(jsonGame: JsonTogetherGame, competitionSport: CompetitionSport, poule: Poule, tournament: Tournament): Observable<Game> {
        const url = this.getUrl(tournament, 'together');
        return this.http.post<JsonTogetherGame>(url, jsonGame, this.getCustomOptions(poule)).pipe(
            map((jsonGameRes: JsonTogetherGame) => this.mapper.toNewTogether(jsonGameRes, poule, competitionSport)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
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
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    private editTogether(jsonGame: JsonTogetherGame, game: TogetherGame, poule: Poule, tournament: Tournament): Observable<Game> {
        const url = this.getUrl(tournament, 'together') + '/' + game.getId();
        return this.http.put<JsonTogetherGame>(url, jsonGame, this.getCustomOptions(poule)).pipe(
            map((jsonGameRes: JsonTogetherGame) => this.mapper.toExistingTogether(jsonGameRes, game)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    removeObject(game: AgainstGame | TogetherGame, poule: Poule, tournament: Tournament): Observable<Game> {
        if (game instanceof AgainstGame) {
            return this.removeAgainst(game, poule, tournament);
        }
        return this.removeTogether(game, poule, tournament);
    }

    private removeAgainst(game: AgainstGame, poule: Poule, tournament: Tournament): Observable<AgainstGame> {
        const url = this.getUrl(tournament, 'against') + '/' + game.getId();
        return this.http.delete(url, this.getCustomOptions(poule)).pipe(
            map(() => {
                const index = poule.getAgainstGames().indexOf(game);
                if (index > -1) {
                    poule.getAgainstGames().splice(index, 1);
                }
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    private removeTogether(game: TogetherGame, poule: Poule, tournament: Tournament): Observable<AgainstGame> {
        const url = this.getUrl(tournament, 'together') + '/' + game.getId();
        return this.http.delete(url, this.getCustomOptions(poule)).pipe(
            map(() => {
                const index = poule.getTogetherGames().indexOf(game);
                if (index > -1) {
                    poule.getTogetherGames().splice(index, 1);
                }
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
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
