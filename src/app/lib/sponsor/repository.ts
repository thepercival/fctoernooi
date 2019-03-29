import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SportConfig, SportRepository } from 'ngx-sport';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Sponsor } from '../sponsor';
import { Tournament } from '../tournament';
import { JsonSponsor, SponsorMapper } from './mapper';

/**
 * Created by coen on 10-10-17.
 */
@Injectable()
export class SponsorRepository extends SportRepository {
    private url: string;

    constructor(
        private http: HttpClient,
        router: Router,
        private mapper: SponsorMapper) {
        super(router);
        this.url = super.getApiUrl() + this.getUrlpostfix();
    }

    getUrlpostfix(): string {
        return 'sponsors';
    }

    createObject(jsonSponsor: JsonSponsor, tournament: Tournament): Observable<Sponsor> {
        return this.http.post(this.url, jsonSponsor, this.getOptions(tournament)).pipe(
            map((res: JsonSponsor) => this.mapper.toObject(res, tournament)),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(sponsor: Sponsor, tournament: Tournament): Observable<Sponsor> {
        return this.http.put(this.url + '/' + sponsor.getId(), this.mapper.toJson(sponsor), this.getOptions(tournament)).pipe(
            map((res: JsonSponsor) => this.mapper.toObject(res, tournament, sponsor)),
            catchError((err) => this.handleError(err))
        );
    }

    removeObject(sponsor: Sponsor, tournament: Tournament): Observable<any> {
        const url = this.url + '/' + sponsor.getId();
        return this.http.delete(url, this.getOptions(tournament)).pipe(
            map((res: any) => {
                const index = tournament.getSponsors().indexOf(sponsor);
                if (index > -1) {
                    tournament.getSponsors().splice(index, 1);
                }
            }),
            catchError((err) => this.handleError(err))
        );
    }

    uploadImage(sponsor: Sponsor, tournament: Tournament, stream: any): Observable<string> {
        return this.http.post(this.url + '/upload/', stream, this.getImageUploadOptions(sponsor, tournament)).pipe(
            map((logoUrl: string) => {
                console.log(logoUrl);
                return logoUrl;
            }),
            catchError((err) => this.handleError(err))
        );
    }

    protected getOptions(tournament: Tournament): { headers: HttpHeaders; params: HttpParams } {
        let httpParams = new HttpParams();
        httpParams = httpParams.set('tournamentid', tournament.getId().toString());
        return {
            headers: super.getHeaders(),
            params: httpParams
        };
    }

    protected getImageUploadOptions(sponsor: Sponsor, tournament: Tournament): { headers: HttpHeaders; params: HttpParams } {
        let httpParams = new HttpParams();
        httpParams = httpParams.set('tournamentid', tournament.getId().toString());
        httpParams = httpParams.set('sponsorid', sponsor.getId().toString());
        let headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
        headers = headers.append('X-Api-Version', '2');
        const token = SportConfig.getToken();
        if (token !== undefined) {
            headers = headers.append('Authorization', 'Bearer ' + token);
        }
        return {
            headers: super.getHeaders(),
            params: httpParams
        };
    }
}


