import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../repository';
import { Sponsor } from '../sponsor';
import { Tournament } from '../tournament';
import { JsonSponsor, SponsorMapper } from './mapper';

/**
 * Created by coen on 10-10-17.
 */
@Injectable()
export class SponsorRepository extends APIRepository {

    constructor(
        private http: HttpClient,
        private mapper: SponsorMapper) {
        super();
    }

    getUrlpostfix(): string {
        return 'sponsors';
    }


    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + '/tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    createObject(jsonSponsor: JsonSponsor, tournament: Tournament): Observable<Sponsor> {
        return this.http.post(this.getUrl(tournament), jsonSponsor, this.getOptions()).pipe(
            map((res: JsonSponsor) => this.mapper.toObject(res, tournament)),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(sponsor: Sponsor, tournament: Tournament): Observable<Sponsor> {
        const url = this.getUrl(tournament) + '/' + sponsor.getId();
        return this.http.put(url, this.mapper.toJson(sponsor), this.getOptions()).pipe(
            map((res: JsonSponsor) => this.mapper.toObject(res, tournament, sponsor)),
            catchError((err) => this.handleError(err))
        );
    }

    removeObject(sponsor: Sponsor, tournament: Tournament): Observable<any> {
        const url = this.getUrl(tournament) + '/' + sponsor.getId();
        return this.http.delete(url, this.getOptions()).pipe(
            map((res: any) => {
                const index = tournament.getSponsors().indexOf(sponsor);
                if (index > -1) {
                    tournament.getSponsors().splice(index, 1);
                }
            }),
            catchError((err) => this.handleError(err))
        );
    }

    uploadImage(sponsorId: number, tournament: Tournament, formData: FormData): Observable<string> {
        const url = this.getUrl(tournament) + '/' + sponsorId + '/upload';
        return this.http.post(url, formData, this.getOptions()).pipe(
            map((res: JsonSponsor) => res.logoUrl),
            catchError((err) => this.handleError(err))
        );
    }
}


