import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../../repository';
import { AgainstGpp, AgainstH2h, Competition, CompetitionSport, CompetitionSportEditor, CompetitionSportMapper, JsonCompetitionSport, JsonField, PointsCalculation, SportMapper, Structure } from 'ngx-sport';
import { Tournament } from '../../tournament';
import { SportWithFields } from '../../../admin/sport/createSportWithFields.component';
import { DefaultService } from '../defaultService';

@Injectable({
    providedIn: 'root'
})
export class CompetitionSportRepository extends APIRepository {

    constructor(
        private editor: CompetitionSportEditor,
        private mapper: CompetitionSportMapper,
        private sportMapper: SportMapper,
        private defaultService: DefaultService,
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
        const competition = tournament.getCompetition();
        return this.http.post<JsonCompetitionSport>(url, json, this.getOptions()).pipe(
            map((jsonCompetitionSport: JsonCompetitionSport) => {
                const firstCompetitionSport = competition.getSingleSport();
                if (firstCompetitionSport.getVariant() instanceof AgainstH2h) {
                    this.convertFirstSport(firstCompetitionSport, structure);
                }
                this.add(jsonCompetitionSport, competition, structure);
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    protected add(jsonCompetitionSport: JsonCompetitionSport, competition: Competition, structure: Structure) {
        const competitionSport = this.mapper.toObject(jsonCompetitionSport, competition, true);
        this.editor.addToStructure(competitionSport, structure);
    }

    removeObject(competitionSport: CompetitionSport, tournament: Tournament, structure: Structure): Observable<void> {
        const url = this.getUrl(tournament) + '/' + competitionSport.getId();
        return this.http.delete(url, this.getOptions()).pipe(
            map(() => {
                this.remove(competitionSport, structure);
                const firstCompetitionSport = competitionSport.getCompetition().getSingleSport();
                const variant = firstCompetitionSport.getVariant();
                if (variant instanceof AgainstGpp && !variant.hasMultipleSidePlaces()) {
                    this.convertFirstSport(firstCompetitionSport, structure);
                }
            }),
            catchError((err: HttpErrorResponse) => this.handleError(err))
        );
    }

    protected remove(competitionSport: CompetitionSport, structure: Structure) {
        this.editor.removeFromStructure(competitionSport, structure);
        const competitionSports = competitionSport.getCompetition().getSports();
        competitionSports.splice(competitionSports.indexOf(competitionSport), 1);
    }

    protected convertFirstSport(competitionSport: CompetitionSport, structure: Structure) {
        this.remove(competitionSport, structure);
        const json = this.mapper.toJson(competitionSport);
        if (json.nrOfH2H > 0) {
            json.nrOfGamesPerPlace = 1;
            json.nrOfH2H = 0;
        } else {
            json.nrOfGamesPerPlace = 0;
            json.nrOfH2H = 1;
        }
        this.add(json, competitionSport.getCompetition(), structure);
    }
    // protected convertAgainstSports(competition: Competition): void {
    //     if (competition.hasMultipleSports()) {
    //         competition.getSports().forEach((competitionSport: CompetitionSport) => {
    //             if (competitionSport.getVariant() instanceof AgainstH2h) {

    //             }
    //         });
    //     }
    //     const competitionSport = competition.getSingleSport();
    //     if (competitionSport.getVariant() instanceof AgainstGpp) {

    //     }
    // }

    sportWithFieldsToJson(
        pointsCalculation: PointsCalculation,
        sportWithFields: SportWithFields, withFieldNamePrefix?: boolean): JsonCompetitionSport {
        const sport = sportWithFields.variant.getSport();
        let fieldNamePrefix = '';
        if (withFieldNamePrefix) {
            fieldNamePrefix = sport.getName().substring(0, 1).toUpperCase();
        }
        const fields: JsonField[] = [];
        for (let priority = 1; priority <= sportWithFields.nrOfFields; priority++) {
            fields.push({ id: priority, priority, name: fieldNamePrefix + priority });
        }
        const customSportId = sport.getCustomId();
        let jsonVariant = this.mapper.variantToJson(sportWithFields.variant);
        return {
            id: 0,
            sport: this.sportMapper.toJson(sport),
            defaultPointsCalculation: pointsCalculation,
            defaultWinPoints: this.defaultService.getWinPoints(customSportId),
            defaultDrawPoints: this.defaultService.getDrawPoints(customSportId),
            defaultWinPointsExt: this.defaultService.getWinPointsExt(customSportId),
            defaultDrawPointsExt: this.defaultService.getDrawPointsExt(customSportId),
            defaultLosePointsExt: this.defaultService.getLosePointsExt(customSportId),
            fields: fields,
            gameMode: jsonVariant.gameMode,
            nrOfHomePlaces: jsonVariant.nrOfHomePlaces,
            nrOfAwayPlaces: jsonVariant.nrOfAwayPlaces,
            nrOfGamePlaces: jsonVariant.nrOfGamePlaces,
            nrOfH2H: jsonVariant.nrOfH2H,
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