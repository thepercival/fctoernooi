import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { Field, FieldMapper, JsonField } from 'ngx-sport';
import { Tournament } from '../../tournament';


@Injectable()
export class FieldRepository extends APIRepository {

    constructor(
        private mapper: FieldMapper, private http: HttpClient) {
        super();
    }

    getUrlpostfix(): string {
        return 'fields';
    }

    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + '/tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    createObject(json: JsonField, tournament: Tournament): Observable<Field> {
        return this.http.post(this.getUrl(tournament), json, this.getOptions()).pipe(
            map((jsonRes: JsonField) => this.mapper.toObject(jsonRes, tournament.getCompetition())),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(field: Field, tournament: Tournament): Observable<Field> {
        const url = this.getUrl(tournament) + '/' + field.getId();
        return this.http.put(url, this.mapper.toJson(field), this.getOptions()).pipe(
            map((res: JsonField) => this.mapper.toObject(res, tournament.getCompetition(), field)),
            catchError((err) => this.handleError(err))
        );
    }

    removeObject(field: Field, tournament: Tournament): Observable<void> {
        const url = this.getUrl(tournament) + '/' + field.getId();
        return this.http.delete(url, this.getOptions()).pipe(
            map((res) => {
                field.getCompetition().removeField(field);
            }),
            catchError((err) => this.handleError(err))
        );
    }
}
