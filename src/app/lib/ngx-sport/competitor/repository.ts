import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { Competitor, JsonCompetitor, Competition, PlaceLocation } from 'ngx-sport';
import { Tournament } from '../../tournament';
import { CompetitorMapper } from '../../competitor/mapper';
import { TournamentCompetitor } from '../../competitor';

@Injectable({
    providedIn: 'root'
})
export class CompetitorRepository extends APIRepository {

    private unusedCompetitors: UnusedCompetitors[] = [];

    constructor(
        private mapper: CompetitorMapper, private http: HttpClient) {
        super();
    }

    getUrlpostfix(): string {
        return 'competitors';
    }

    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    reloadObjects(tournament: Tournament): Observable<TournamentCompetitor[]> {
        tournament.getCompetitors().splice(0);
        return this.http.get<JsonCompetitor[]>(this.getUrl(tournament), this.getOptions()).pipe(
            map((jsoCompetitors: JsonCompetitor[]) => jsoCompetitors.map((jsoCompetitor: JsonCompetitor): TournamentCompetitor => {
                return this.mapper.toObject(jsoCompetitor, tournament);
            })),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    createObject(json: JsonCompetitor, tournament: Tournament): Observable<Competitor> {
        return this.http.post<JsonCompetitor>(this.getUrl(tournament), json, this.getOptions()).pipe(
            map((jsonCompetitor: JsonCompetitor) => this.mapper.toObject(jsonCompetitor, tournament)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    editObject(jsonCompetitor: JsonCompetitor, competitor: TournamentCompetitor, tournament: Tournament): Observable<TournamentCompetitor> {
        const url = this.getUrl(tournament) + '/' + competitor.getId();
        return this.http.put<JsonCompetitor>(url, jsonCompetitor, this.getOptions()).pipe(
            map((jsonCompetitor: JsonCompetitor) => this.mapper.updateObject(jsonCompetitor, competitor)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    swapObjects(competitorOne: TournamentCompetitor, competitorTwo: TournamentCompetitor, tournament: Tournament): Observable<void> {
        const url = this.getUrl(tournament) + '/' + competitorOne.getId() + '/' + competitorTwo.getId();
        return this.http.put<JsonCompetitor>(url, undefined, this.getOptions()).pipe(
            map(() => {
                const competitorOneTmp = new PlaceLocation(competitorOne.getPouleNr(), competitorOne.getPlaceNr());
                competitorOne.setPouleNr(competitorTwo.getPouleNr());
                competitorOne.setPlaceNr(competitorTwo.getPlaceNr());
                competitorTwo.setPouleNr(competitorOneTmp.getPouleNr());
                competitorTwo.setPlaceNr(competitorOneTmp.getPlaceNr());
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    getUnusedCompetitors(competition: Competition): Competitor[] {
        let unusedCompetitors = this.unusedCompetitors.find(unusedCompetitor => unusedCompetitor.competition === competition);
        if (unusedCompetitors === undefined) {
            unusedCompetitors = { competition: competition, competitors: [] };
            this.unusedCompetitors.push(unusedCompetitors);
        }
        return unusedCompetitors.competitors;
    }

    removeObject(competitor: TournamentCompetitor, tournament: Tournament): Observable<void> {
        const url = this.getUrl(tournament) + '/' + competitor.getId();
        return this.http.delete(url, this.getOptions()).pipe(
            map(() => {
                const index = tournament.getCompetitors().indexOf(competitor);
                if (index > -1) {
                    tournament.getCompetitors().splice(index, 1);
                }
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }
}


export interface UnusedCompetitors {
    competition: Competition;
    competitors: Competitor[];
}
