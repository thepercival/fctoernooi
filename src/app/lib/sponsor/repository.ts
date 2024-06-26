import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../repository';
import { Sponsor } from '../sponsor';
import { Tournament } from '../tournament';
import { JsonSponsor } from './json';
import { SponsorMapper } from './mapper';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class SponsorRepository extends APIRepository {

    constructor(
        private http: HttpClient,
        private mapper: SponsorMapper,
        router: Router) {
        super(router);
    }

    getUrlpostfix(): string {
        return 'sponsors';
    }


    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    createObject(jsonSponsor: JsonSponsor, tournament: Tournament): Observable<Sponsor> {
        return this.http.post<JsonSponsor>(this.getUrl(tournament), jsonSponsor, this.getOptions()).pipe(
            map((res: JsonSponsor) => this.mapper.toObject(res, tournament)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    editObject(jsonSponsor: JsonSponsor, sponsor: Sponsor, tournament: Tournament): Observable<Sponsor> {
        const url = this.getUrl(tournament) + '/' + sponsor.getId();
        return this.http.put<JsonSponsor>(url, jsonSponsor, this.getOptions()).pipe(
            map((res: JsonSponsor) => this.mapper.toObject(res, tournament, sponsor)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    removeObject(sponsor: Sponsor, tournament: Tournament): Observable<void> {
        const url = this.getUrl(tournament) + '/' + sponsor.getId();
        return this.http.delete(url, this.getOptions()).pipe(
            map(() => {
                const index = tournament.getSponsors().indexOf(sponsor);
                if (index > -1) {
                    tournament.getSponsors().splice(index, 1);
                }
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    uploadImage(input: FormData, sponsor: Sponsor, tournament: Tournament): Observable<void> {
        const url = this.getUrl(tournament) + '/' + sponsor.getId() + '/upload';
        return this.http.post<JsonSponsor>(url, input, this.getUploadOptions()).pipe(
            map((res: JsonSponsor) => this.mapper.toObject(res, tournament, sponsor)),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    getLogoUrl(sponsor: Sponsor, height: number = 0): string {
        const suffix = (height > 0 && sponsor.getLogoExtension() !== 'svg') ? '_h_' + height : '';
        return this.apiurl + 'images/' + this.getUrlpostfix() + '/' + sponsor.getId() + suffix + '.' + sponsor.getLogoExtension();
    }

    hasSomeLogo(sponsors: Sponsor[]): boolean {
        return sponsors.some((sponsor: Sponsor): boolean => {
            return sponsor.hasLogoExtension();
        });
    } 
}


