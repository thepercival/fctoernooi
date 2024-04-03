import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { Competitor, JsonCompetitor, Competition } from 'ngx-sport';
import { Tournament } from '../../tournament';
import { TournamentCompetitorMapper } from '../../competitor/mapper';
import { TournamentCompetitor } from '../../competitor';
import { Router } from '@angular/router';
import { JsonTournamentCompetitor } from '../../competitor/json';
import { TournamentRegistration } from '../../tournament/registration';

@Injectable({
    providedIn: 'root'
})
export class CompetitorRepository extends APIRepository {

    private unusedCompetitors: UnusedCompetitors[] = [];

    constructor(
        private mapper: TournamentCompetitorMapper, private http: HttpClient, router: Router) {
        super(router);
    }

    getUrlpostfix(competitorId?: string | number): string {
        return 'competitors' + (competitorId !== undefined ? ('/' + competitorId) : '');
    }

    getUrl(tournament: Tournament): string {
        return this.getUrlById(tournament.getId());
    }

    private getUrlById(tournamentId: string | number, competitorId?: string | number): string {
        return super.getApiUrl() + 'tournaments/' + tournamentId + '/' + this.getUrlpostfix(competitorId);
    }

    reloadObject(competitor: TournamentCompetitor, tournament: Tournament): Observable<TournamentCompetitor> {
        const httpParams = (new HttpParams({})).set('privacy', true);    
        const options = {
            headers: super.getHeaders(),
            params: httpParams
        };
        return this.http.get<JsonTournamentCompetitor>(this.getUrlById(tournament.getId(), competitor.getId()), options).pipe(
            map((jsoCompetitor: JsonTournamentCompetitor) => {
                return this.mapper.toObject(jsoCompetitor, tournament, competitor);
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

   reloadObjects(tournament: Tournament, privacy: boolean): Observable<TournamentCompetitor[]> {
        let httpParams = new HttpParams({});
        if (privacy) {
           httpParams = httpParams.set('privacy', true);
        }
        const options = {
            headers: super.getHeaders(),
            params: httpParams
        };
        // @TODO CDK KIJKEN HOE DIT AAN TE ROEPEN VANAF SCHERM
        tournament.getCompetitors().splice(0);
        return this.http.get<JsonTournamentCompetitor[]>(this.getUrl(tournament), options).pipe(
            map((jsoCompetitors: JsonTournamentCompetitor[]) => jsoCompetitors.map((jsoCompetitor: JsonTournamentCompetitor): TournamentCompetitor => {
                return this.mapper.toObject(jsoCompetitor, tournament);
            })),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    createObject(json: JsonCompetitor, tournament: Tournament): Observable<TournamentCompetitor> {
        return this.http.post<JsonTournamentCompetitor>(this.getUrl(tournament), json, this.getOptions()).pipe(
            map((jsonCompetitor: JsonTournamentCompetitor) => this.mapper.toObject(jsonCompetitor, tournament)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    createObjectFromRegistration(registration: TournamentRegistration, tournament: Tournament): Observable<TournamentCompetitor> {
        return this.http.post<JsonTournamentCompetitor>(this.getUrl(tournament) + '/' + registration.getId(), undefined, this.getOptions()).pipe(
            map((jsonCompetitor: JsonTournamentCompetitor) => this.mapper.toObject(jsonCompetitor, tournament)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    editObject(jsonCompetitor: JsonTournamentCompetitor, competitor: TournamentCompetitor, tournamentId: string | number): Observable<TournamentCompetitor> {
        const url = this.getUrlById(tournamentId) + '/' + competitor.getId();
        return this.http.put<JsonTournamentCompetitor>(url, jsonCompetitor, this.getOptions()).pipe(
            map((jsonCompetitor: JsonTournamentCompetitor) => this.mapper.updateObject(jsonCompetitor, competitor)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    swapObjects(competitorOne: TournamentCompetitor, competitorTwo: TournamentCompetitor, tournament: Tournament): Observable<void> {
        const url = this.getUrl(tournament) + '/' + competitorOne.getId() + '/' + competitorTwo.getId();
        return this.http.put<JsonCompetitor>(url, undefined, this.getOptions()).pipe(
            map(() => {
                const compOneOldStartLocation = competitorOne.getStartLocation();
                competitorOne.updateStartLocation(competitorTwo.getStartLocation().getPouleNr(), competitorTwo.getStartLocation().getPlaceNr());
                competitorTwo.updateStartLocation(compOneOldStartLocation.getPouleNr(), compOneOldStartLocation.getPlaceNr());
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

    uploadImage(input: FormData, competitor: TournamentCompetitor, tournament: Tournament): Observable<void> {
        const url = this.getUrl(tournament) + '/' + competitor.getId() + '/upload';
        return this.http.post<JsonTournamentCompetitor>(url, input, this.getUploadOptions()).pipe(
            map((res: JsonTournamentCompetitor) => this.mapper.toObject(res, tournament, competitor)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    getLogoUrl(competitor: TournamentCompetitor, height: number = 0): string {
        if (competitor === undefined) {
            return '';
        }
        const suffix = (height > 0 && competitor.getLogoExtension() !== 'svg' ) ? '_h_' + height : '';
        return this.apiurl + 'images/' + this.getUrlpostfix() + '/' + competitor.getId() + suffix + '.' + competitor.getLogoExtension();
    }

    hasSomeLogo(competitors: TournamentCompetitor[]): boolean {
        return competitors.some((competitor: TournamentCompetitor): boolean => {
            return (competitor.getLogoExtension()?.length ?? 0) > 0;
        });
    } 
    
    hasLogoExtension(competitor: TournamentCompetitor | undefined): boolean {
        if (competitor === undefined) {
            return false;
        }
        return (competitor.getLogoExtension()?.length ?? 0) > 0;
    }
}


export interface UnusedCompetitors {
    competition: Competition;
    competitors: Competitor[];
}
