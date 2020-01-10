import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { Competitor, CompetitorMapper, JsonCompetitor, Competition } from 'ngx-sport';
import { Tournament } from '../../tournament';


@Injectable()
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

    createObject(json: JsonCompetitor, tournament: Tournament): Observable<Competitor> {
        const association = tournament.getCompetition().getLeague().getAssociation();
        return this.http.post(this.getUrl(tournament), json, this.getOptions()).pipe(
            map((jsonCompetitor: JsonCompetitor) => this.mapper.toObject(jsonCompetitor, association)),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(competitor: Competitor, tournament: Tournament): Observable<Competitor> {
        const url = this.getUrl(tournament) + '/' + competitor.getId();
        const association = tournament.getCompetition().getLeague().getAssociation();
        return this.http.put(url, this.mapper.toJson(competitor), this.getOptions()).pipe(
            map((jsonCompetitor: JsonCompetitor) => this.mapper.toObject(jsonCompetitor, association, competitor)),
            catchError((err) => this.handleError(err))
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
}
/**
    createObject(json: JsonCompetitor, association: Association): Observable<Competitor> {
        const options = this.getOptions(association);
        return this.http.post(this.url, json, options).pipe(
            map((jsonRes: JsonCompetitor) => this.mapper.toObject(jsonRes, association)),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(competitor: Competitor): Observable<Competitor> {
        const options = this.getOptions(competitor.getAssociation());
        return this.http.put(this.url + '/' + competitor.getId(), this.mapper.toJson(competitor), options).pipe(
            map((json: JsonCompetitor) => this.mapper.toObject(json, competitor.getAssociation(), competitor)),
            catchError((err) => this.handleError(err))
        );
    }

    protected getOptions(association: Association, name?: string): { headers: HttpHeaders; params: HttpParams } {

        let httpParams = new HttpParams();
        httpParams = httpParams.set('associationid', association.getId().toString());
        if (name !== undefined) {
            httpParams = httpParams.set('name', name);
        }
        return {
            headers: super.getHeaders(),
            params: httpParams
        };
    }



*/

export interface UnusedCompetitors {
    competition: Competition;
    competitors: Competitor[];
}
