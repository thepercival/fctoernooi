import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';

import { StructureMapper, Structure, JsonStructure } from 'ngx-sport';
import { APIRepository } from '../../repository';
import { Tournament } from '../../tournament';
import { TournamentCompetitor } from '../../competitor';
import { CompetitorRepository } from '../competitor/repository';

@Injectable({
    providedIn: 'root'
})
export class StructureRepository extends APIRepository {

    constructor(
        private competitorRepository: CompetitorRepository,
        private mapper: StructureMapper,
        private http: HttpClient) {
        super();
    }

    getUrlpostfix(): string {
        return 'structure';
    }

    getUrl(tournament: Tournament): string {
        const prefix = this.getToken() ? '' : 'public/';
        return super.getApiUrl() + prefix + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    getObject(tournament: Tournament): Observable<Structure> {
        return this.http.get<JsonStructure>(this.getUrl(tournament), this.getOptions()).pipe(
            map((json: JsonStructure) => this.mapper.toObject(json, tournament.getCompetition())),
            catchError((err) => this.handleError(err))
        );
    }

    editObject(structure: Structure, tournament: Tournament): Observable<Structure> {
        return this.http.put<JsonStructure>(this.getUrl(tournament), this.mapper.toJson(structure), this.getOptions()).pipe(
            concatMap((jsonRes: JsonStructure) => {
                const structure = this.mapper.toObject(jsonRes, tournament.getCompetition());
                return this.updateCompetitors(structure, this.competitorRepository.reloadObjects(tournament));
            }),
            catchError((err) => this.handleError(err))
        );
    }

    updateCompetitors(structure: Structure, obsCompetitors: Observable<TournamentCompetitor[]>): Observable<Structure> {
        return obsCompetitors.pipe(
            map((competitors: TournamentCompetitor[]) => {
                return structure;
            })
        );
    }
}
