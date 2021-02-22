import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { Field, FieldMapper, JsonField, CompetitionSport } from 'ngx-sport';
import { Tournament } from '../../tournament';


@Injectable({
    providedIn: 'root'
})
export class FieldRepository extends APIRepository {

    constructor(
        private mapper: FieldMapper, private http: HttpClient) {
        super();
    }

    getUrlpostfix(): string {
        return 'fields';
    }

    getUrl(tournament: Tournament, competitionSport: CompetitionSport): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/competitionsports/' + competitionSport.getId() + '/' + this.getUrlpostfix();
    }

    createObject(json: JsonField, competitionSport: CompetitionSport, tournament: Tournament): Observable<Field> {
        return this.http.post<JsonField>(this.getUrl(tournament, competitionSport), json, this.getOptions()).pipe(
            map((jsonRes: JsonField) => this.mapper.toNewObject(jsonRes, competitionSport)),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(jsonField: JsonField, field: Field, tournament: Tournament): Observable<Field> {
        const url = this.getUrl(tournament, field.getCompetitionSport()) + '/' + field.getId();
        return this.http.put<JsonField>(url, jsonField, this.getOptions()).pipe(
            map((jsonRes: JsonField) => this.mapper.toExistingObject(jsonRes)),
            catchError((err) => this.handleError(err))
        );
    }

    upgradeObject(field: Field, tournament: Tournament): Observable<void> {
        const sportConfig = field.getCompetitionSport();
        const url = this.getUrl(tournament, sportConfig) + '/' + field.getId() + '/priorityup';
        return this.http.post(url, undefined, this.getOptions()).pipe(
            map(() => {
                const downgrade = sportConfig.getField(field.getPriority() - 1);
                if (downgrade === undefined) {
                    throw new Error('field does not exist');
                }
                field.setPriority(downgrade.getPriority());
                downgrade.setPriority(downgrade.getPriority() + 1);
                sportConfig.getFields().sort((fieldA, fieldB) => fieldA.getPriority() - fieldB.getPriority());
            }),
            catchError((err) => this.handleError(err))
        );
    }


    removeObject(field: Field, tournament: Tournament): Observable<void> {
        const sportConfig = field.getCompetitionSport();
        const url = this.getUrl(tournament, sportConfig) + '/' + field.getId();
        return this.http.delete(url, this.getOptions()).pipe(
            map((res) => {
                const index = sportConfig.getFields().indexOf(field);
                if (index > -1) {
                    sportConfig.getFields().splice(index, 1);
                }
            }),
            catchError((err) => this.handleError(err))
        );
    }
}
