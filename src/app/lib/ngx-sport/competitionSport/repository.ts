import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { CompetitionSport, CompetitionSportMapper, CompetitionSportService, JsonCompetitionSport, JsonField, SportMapper, Structure } from 'ngx-sport';
import { Tournament } from '../../tournament';
import { SportWithFields } from '../../../admin/sport/createSportWithFields.component';

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

    createObject(json: JsonCompetitionSport, tournament: Tournament, structure: Structure): Observable<CompetitionSport> {
        const url = this.getUrl(tournament);
        return this.http.post<JsonCompetitionSport>(url, json, this.getOptions()).pipe(
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
            map(() => {
                this.service.removeFromStructure(competitionSport, structure);
                const competitionSports = tournament.getCompetition().getSports();
                competitionSports.splice(competitionSports.indexOf(competitionSport), 1);
            }),
            catchError((err) => this.handleError(err))
        );
    }

    sportWithFieldsToJson(sportWithFields: SportWithFields, withFieldNamePrefix?: boolean): JsonCompetitionSport {
        const sport = sportWithFields.variant.getSport();
        let fieldNamePrefix = '';
        if (withFieldNamePrefix) {
            fieldNamePrefix = sport.getName().substr(0, 1).toUpperCase();
        }
        const fields: JsonField[] = [];
        for (let priority = 1; priority <= sportWithFields.nrOfFields; priority++) {
            fields.push({ id: priority, priority, name: fieldNamePrefix + priority });
        }
        let jsonVariant = this.mapper.variantToJson(sportWithFields.variant);
        return {
            id: 0,
            sport: this.sportMapper.toJson(sport),
            fields: fields,
            gameMode: jsonVariant.gameMode,
            nrOfHomePlaces: jsonVariant.nrOfHomePlaces,
            nrOfAwayPlaces: jsonVariant.nrOfAwayPlaces,
            nrOfH2H: jsonVariant.nrOfH2H,
            nrOfPartials: jsonVariant.nrOfPartials,
            nrOfGamePlaces: jsonVariant.nrOfGamePlaces,
            nrOfGamesPerPlace: jsonVariant.nrOfGamesPerPlace
        }
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