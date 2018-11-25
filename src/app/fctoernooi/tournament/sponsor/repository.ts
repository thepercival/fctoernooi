import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SportRepository } from 'ngx-sport';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Tournament } from '../../tournament';
import { Sponsor } from '../sponsor';

/**
 * Created by coen on 10-10-17.
 */
@Injectable()
export class SponsorRepository extends SportRepository {

    private url: string;

    constructor(private http: HttpClient, router: Router) {
        super(router);
        this.url = super.getApiUrl() + this.getUrlpostfix();
    }

    getUrlpostfix(): string {
        return 'sponsors';
    }

    createObject(jsonSponsor: ISponsor, tournament: Tournament): Observable<Sponsor> {
        return this.http.post(this.url, jsonSponsor, this.getOptions(tournament)).pipe(
            map((res: ISponsor) => this.jsonToObject(res, tournament)),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(sponsor: Sponsor, tournament: Tournament): Observable<Sponsor> {
        return this.http.put(this.url + '/' + sponsor.getId(), this.objectToJson(sponsor), this.getOptions(tournament)).pipe(
            map((res: ISponsor) => this.jsonToObject(res, tournament, sponsor)),
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

    protected getOptions(tournament: Tournament): { headers: HttpHeaders; params: HttpParams } {
        let httpParams = new HttpParams();
        httpParams = httpParams.set('tournamentid', tournament.getId().toString());
        return {
            headers: super.getHeaders(),
            params: httpParams
        };
    }

    jsonArrayToObject(jsonArray: ISponsor[], tournament: Tournament): Sponsor[] {
        const objects: Sponsor[] = [];
        for (const json of jsonArray) {
            const object = this.jsonToObject(json, tournament);
            objects.push(object);
        }
        return objects;
    }

    jsonToObject(json: ISponsor, tournament: Tournament, sponsor?: Sponsor): Sponsor {
        if (sponsor === undefined) {
            sponsor = new Sponsor(tournament, json.name);
        }
        sponsor.setId(json.id);
        sponsor.setUrl(json.url);
        return sponsor;
    }

    objectsToJsonArray(objects: any[]): any[] {
        const jsonArray: any[] = [];
        for (const object of objects) {
            const json = this.objectToJson(object);
            jsonArray.push(json);
        }
        return jsonArray;
    }

    objectToJson(object: Sponsor): ISponsor {
        const json: ISponsor = {
            id: object.getId(),
            name: object.getName(),
            url: object.getUrl()
        };
        return json;
    }
}

export interface ISponsor {
    id?: number;
    name: string;
    url?: string;
}
