import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { PlanningMapper, JsonStructure, RoundNumber, Structure, Poule, GameMapper, GameOrder, StructureMapper, CompetitionSportMapper } from 'ngx-sport';
import { APIRepository } from '../../repository';
import { Tournament } from '../../tournament';
import { JsonPoule } from 'ngx-sport/src/poule/json';

@Injectable({
    providedIn: 'root'
})
export class PlanningRepository extends APIRepository {

    constructor(
        private competitionSportMapper: CompetitionSportMapper,
        private structureMapper: StructureMapper,
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

    get(roundNumber: RoundNumber, tournament: Tournament): Observable<RoundNumber> {
        const sportMap = this.competitionSportMapper.getMap(tournament.getCompetition());
        return this.http.get<JsonPoule[]>(this.getUrl(tournament, roundNumber), this.getOptions()).pipe(
            map((jsonPoules: JsonPoule[]) => {
                this.planningMapper.toObject(jsonPoules, roundNumber, sportMap);
                return roundNumber;
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    progress(roundNumber: RoundNumber, tournament: Tournament): Observable<number> {
        const url = this.getUrl(tournament, roundNumber) + '/progress';
        return this.http.get<number>(url, this.getOptions()).pipe(
            map((jsonProgress: any) => jsonProgress.progress),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    create(structure: Structure, tournament: Tournament, startRoundNumberAsValue: number): Observable<void> {
        const startRoundNumber = structure.getRoundNumber(startRoundNumberAsValue);
        if (startRoundNumber === undefined) {
            throw Error('het rondenummer kan niet gevonden worden');
        }
        this.removeGames(startRoundNumber);

        const sportMap = this.competitionSportMapper.getMap(tournament.getCompetition());
        const url = this.getUrl(tournament, startRoundNumber) + '/create';
        return this.http.post<JsonStructure>(url, undefined, this.getOptions()).pipe(
            map((jsonStructure: JsonStructure) => {
                this.structureMapper.planningToObject(jsonStructure, startRoundNumber, sportMap);
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    // protected jsonToPlanning(jsonRoundNumber: JsonRoundNumber, roundNumber: RoundNumber, startRoundNumber: number) {
    //     if (roundNumber.getNumber() >= startRoundNumber) {
    //         roundNumber.setHasPlanning(jsonRoundNumber.hasPlanning);
    //     }

    //     this.planningMapper.toObject(jsonStructure, structure, startRoundNumber);

    //     const nextRoundNumber = roundNumber.getNext();
    //     if (nextRoundNumber && jsonRoundNumber.next) {
    //         this.roundNumber(jsonRoundNumber.next, nextRoundNumber, startRoundNumber);
    //     }
    // }

    // protected getCreateRoundNumbers(
    //     roundNumber: RoundNumber | undefined,
    //     tournament: Tournament,
    //     sportMap: CompetitionSportMap): Observable<void>[] {
    //     const reposUpdates: Observable<void>[] = [];
    //     while (roundNumber !== undefined) {
    //         const url = this.getUrl(tournament, roundNumber) + '/create';
    //         const reposUpdate = this.http.post<JsonPoule[]>(url, undefined, this.getOptions()).pipe(
    //             map((jsonPoules: JsonPoule[]) => {
    //                 if (roundNumber !== undefined) {
    //                     this.planningMapper.toObject(jsonPoules, roundNumber, sportMap);
    //                 }
    //             }),
    //             catchError((err: HttpErrorResponse) => this.handleError(err))
    //         );
    //         reposUpdates.push(reposUpdate);
    //         roundNumber = roundNumber.getNext();
    //     }
    //     return reposUpdates;
    // }

    /*decrement(tournament: Tournament, poule: Poule): Observable<void> {
        const url = this.getUrlPoule(tournament, poule) + '/decrement';
        return this.http.post<(JsonAgainstGame | JsonTogetherGame)[]>(url, undefined, this.getOptions()).pipe(
            map((jsonRemovedGames: (JsonAgainstGame | JsonTogetherGame)[]) => {
                this.removePouleGames(poule);
                const map = this.competitionSportMapper.getMap(tournament.getCompetition());
                return jsonRemovedGames.map((jsonGame: JsonAgainstGame | JsonTogetherGame) => this.gameMapper.toNew(jsonGame, poule, map));
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    increment(tournament: Tournament, poule: Poule): Observable<(AgainstGame | TogetherGame)[]> {
        const url = this.getUrlPoule(tournament, poule) + '/increment';
        return this.http.post<(JsonAgainstGame | JsonTogetherGame)[]>(url, undefined, this.getOptions()).pipe(
            map((jsonGames: (JsonAgainstGame | JsonTogetherGame)[]) => {
                const map = this.competitionSportMapper.getMap(tournament.getCompetition());
                return jsonGames.map((jsonGame: JsonAgainstGame | JsonTogetherGame) => this.gameMapper.toNew(jsonGame, poule, map));
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }*/

    protected removeGames(roundNumber: RoundNumber) {
        roundNumber.getPoules().forEach(poule => {
            poule.getGames().splice(0, poule.getGames().length);
        });
        const nextRoundNumber = roundNumber.getNext();
        if (nextRoundNumber) {
            this.removeGames(nextRoundNumber);
        }
    }

    reschedule(roundNumber: RoundNumber, tournament: Tournament): Observable<boolean> {
        const url = this.getUrl(tournament, roundNumber) + '/reschedule';
        return this.http.post<Date[]>(url, undefined, this.getOptions()).pipe(
            map((dates: Date[]) => this.updateDates(roundNumber, dates)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    private updateDates(roundNumber: RoundNumber, dates: Date[]): boolean {
        let previousBatchNr: number | undefined;
        let gameDate: Date | undefined;
        roundNumber.getGames(GameOrder.ByBatch).forEach(game => {
            if (previousBatchNr === undefined || previousBatchNr !== game.getBatchNr()) {
                previousBatchNr = game.getBatchNr();
                if (dates.length === 0) {
                    throw new Error('niet genoeg datums om planning aan te passen');
                }
                gameDate = dates.pop();
            }
            if (gameDate) {
                game.setStartDateTime(gameDate);
            }
        });
        const nextRoundNumber = roundNumber.getNext();
        if (nextRoundNumber) {
            this.updateDates(nextRoundNumber, dates);
        }
        return true;
    }
}
