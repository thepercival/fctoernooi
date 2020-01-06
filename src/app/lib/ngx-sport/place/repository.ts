import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { Place, PlaceMapper, JsonPlace, Poule } from 'ngx-sport';
import { Tournament } from '../../tournament';


@Injectable()
export class PlaceRepository extends APIRepository {

    constructor(
        private mapper: PlaceMapper, private http: HttpClient) {
        super();
    }

    getUrlpostfix(): string {
        return 'places';
    }

    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + '/tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    editObject(place: Place, poule: Poule, tournament: Tournament): Observable<Place> {
        const url = this.getUrl(tournament) + '/' + place.getId();
        return this.http.put(url, this.mapper.toJson(place), this.getCustomOptions(poule)).pipe(
            map((jsonPlace: JsonPlace) => this.mapper.toObject(jsonPlace, place.getPoule(), place)),
            catchError((err) => this.handleError(err))
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
