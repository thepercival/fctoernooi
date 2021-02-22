import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { CompetitionSport, CompetitionSportMapper, CompetitionSportService, JsonCompetitionSport, RoundNumber, Sport, SportMapper, Structure } from 'ngx-sport';
import { Tournament } from '../../tournament';

@Injectable({
    providedIn: 'root'
})
export class CompetitionSportRepository extends APIRepository {

    constructor(
        private service: CompetitionSportService,
        private mapper: CompetitionSportMapper,
        private sportMapper: SportMapper,
        private http: HttpClient) {
        super();
    }

    getUrlpostfix(): string {
        return 'competitionsports';
    }

    getUrl(tournament: Tournament): string {
        return super.getApiUrl() + 'tournaments/' + tournament.getId() + '/' + this.getUrlpostfix();
    }

    createObject(sport: Sport, tournament: Tournament, structure: Structure): Observable<CompetitionSport> {
        const url = this.getUrl(tournament);
        return this.http.post<JsonCompetitionSport>(url, this.sportMapper.toJson(sport), this.getOptions()).pipe(
            map((jsonResult: JsonCompetitionSport) => {
                const competitionSport = this.mapper.toObject(jsonResult, tournament.getCompetition(), true);
                this.service.addToStructure(competitionSport, structure);
            }),
            catchError((err) => this.handleError(err))
        );
    }

    removeObject(competitionSport: CompetitionSport, tournament: Tournament, structure: Structure): Observable<void> {
        const url = this.getUrl(tournament) + '/' + competitionSport.getId();
        return this.http.delete(url, this.getOptions()).pipe(
            map((res) => {
                this.service.removeFromStructure(competitionSport, structure);
                const competitionSports = tournament.getCompetition().getSports();
                competitionSports.splice(competitionSports.indexOf(competitionSport), 1);
            }),
            catchError((err) => this.handleError(err))
        );
    }

    // remove(roundNumber: RoundNumber, competitionSport: CompetitionSport) {
    //     const gameAmountConfig = roundNumber.getGameAmountConfig(competitionSport);
    //     if (gameAmountConfig) {
    //         roundNumber.getGameAmountConfigs().splice(roundNumber.getGameAmountConfigs().indexOf(gameAmountConfig), 1);
    //     }
    //     if (roundNumber.hasNext()) {
    //         this.remove(roundNumber.getNext(), competitionSport);
    //     }
    // }
}
