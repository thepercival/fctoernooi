import { Http } from '@angular/http';
import { Observable } from 'rxjs';
import { CompetitionSeason } from '../voetbal/competitionseason';
export declare class CompetitionSeasonSearchService {
    private http;
    constructor(http: Http);
    search(term: string): Observable<CompetitionSeason[]>;
}
