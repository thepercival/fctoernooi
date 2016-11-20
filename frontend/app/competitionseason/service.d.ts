import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { CompetitionSeason } from './competitionseason';
export declare class CompetitionSeasonService {
    private http;
    private headers;
    private competitionseasonsUrl;
    constructor(http: Http);
    getCompetitionSeasons(): Observable<CompetitionSeason[]>;
    getCompetitionSeason(id: number): Observable<CompetitionSeason>;
    create(name: string, seasonname: string): Observable<CompetitionSeason>;
    update(competitionseason: CompetitionSeason): Observable<CompetitionSeason>;
    delete(id: number): Observable<void>;
}
