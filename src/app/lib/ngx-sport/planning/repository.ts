import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PlanningMapper, JsonStructure, RoundNumber, Game, Structure, AgainstGame, TogetherGamePlace, JsonAgainstGame, JsonTogetherGame, TogetherGame, Poule, GameMapper } from 'ngx-sport';
import { APIRepository } from '../../repository';
import { Tournament } from '../../tournament';

@Injectable({
    providedIn: 'root'
})
export class PlanningRepository extends APIRepository {

    constructor(
        private planningMapper: PlanningMapper,
        private gameMapper: GameMapper,
        private http: HttpClient) {
        super();
    }

    getUrlpostfix(): string {
        return 'planning';
    }

    getUrl(tournament: Tournament, roundNumber: RoundNumber): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix() + '/' + roundNumber.getNumber();
    }

    getUrlPoule(tournament: Tournament, poule: Poule): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix() + '/' + poule.getId();
    }

    get(structure: Structure, tournament: Tournament, startRoundNumber: number): Observable<RoundNumber> {
        const roundNumber = structure.getRoundNumber(startRoundNumber);
        if (roundNumber === undefined) {
            throw Error('het rondenummer kan niet gevonden worden');
        }
        return this.http.get<JsonStructure>(this.getUrl(tournament, roundNumber), this.getOptions()).pipe(
            map((jsonStructure: JsonStructure) => this.planningMapper.toObject(jsonStructure, structure, startRoundNumber)),
            catchError((err) => this.handleError(err))
        );
    }

    create(structure: Structure, tournament: Tournament, startRoundNumber: number): Observable<RoundNumber> {
        const roundNumber = structure.getRoundNumber(startRoundNumber);
        if (roundNumber === undefined) {
            throw Error('het rondenummer kan niet gevonden worden');
        }
        this.removeGames(roundNumber);
        const url = this.getUrl(tournament, roundNumber) + '/create';
        return this.http.post<JsonStructure>(url, undefined, this.getOptions()).pipe(
            map((jsonStructure: JsonStructure) => this.planningMapper.toObject(jsonStructure, structure, startRoundNumber)),
            catchError((err) => this.handleError(err))
        );
    }

    decrement(tournament: Tournament, poule: Poule): Observable<void> {
        const url = this.getUrlPoule(tournament, poule) + '/decrement';
        return this.http.post<(JsonAgainstGame | JsonTogetherGame)[]>(url, undefined, this.getOptions()).pipe(
            map((jsonRemovedGames: (JsonAgainstGame | JsonTogetherGame)[]) => {
                this.removePouleGames(poule);
                const map = this.planningMapper.getCompetitionSportMap(tournament.getCompetition());
                return jsonRemovedGames.map((jsonGame: JsonAgainstGame | JsonTogetherGame) => this.gameMapper.toNew(jsonGame, poule, map));
            }),
            catchError((err) => this.handleError(err))
        );
    }

    increment(tournament: Tournament, poule: Poule): Observable<(AgainstGame | TogetherGame)[]> {
        const url = this.getUrlPoule(tournament, poule) + '/increment';
        return this.http.post<(JsonAgainstGame | JsonTogetherGame)[]>(url, undefined, this.getOptions()).pipe(
            map((jsonGames: (JsonAgainstGame | JsonTogetherGame)[]) => {
                const map = this.planningMapper.getCompetitionSportMap(tournament.getCompetition());
                return jsonGames.map((jsonGame: JsonAgainstGame | JsonTogetherGame) => this.gameMapper.toNew(jsonGame, poule, map));
            }),
            catchError((err) => this.handleError(err))
        );
    }

    protected removeGames(roundNumber: RoundNumber) {
        roundNumber.getPoules().forEach(poule => {
            poule.getGames().splice(0, poule.getGames().length);
        });
        const nextRoundNumber = roundNumber.getNext();
        if (nextRoundNumber) {
            this.removeGames(nextRoundNumber);
        }
    }

    protected removePouleGames(poule: Poule) {

    }

    reschedule(roundNumber: RoundNumber, tournament: Tournament): Observable<boolean> {
        const url = this.getUrl(tournament, roundNumber) + '/reschedule';
        return this.http.post<Date[]>(url, undefined, this.getOptions()).pipe(
            map((dates: Date[]) => this.updateDates(roundNumber, dates)),
            catchError((err) => this.handleError(err))
        );
    }

    private updateDates(roundNumber: RoundNumber, dates: Date[]): boolean {
        let previousBatchNr: number | undefined;
        let gameDate: Date | undefined;
        roundNumber.getGames(Game.Order_By_Batch).forEach(game => {
            if (previousBatchNr === undefined || previousBatchNr !== game.getBatchNr()) {
                previousBatchNr = game.getBatchNr();
                if (dates.length === 0) {
                    throw new Error('niet genoeg datums om planning aan te passen');
                }
                gameDate = dates.pop();
            }
            game.setStartDateTime(gameDate);
        });
        const nextRoundNumber = roundNumber.getNext();
        if (nextRoundNumber) {
            this.updateDates(nextRoundNumber, dates);
        }
        return true;
    }
}
