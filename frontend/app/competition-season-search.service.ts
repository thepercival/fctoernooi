import { Injectable }           from '@angular/core';
import { Http, Response }       from '@angular/http';
import { Observable }           from 'rxjs';
import { CompetitionSeason }   from './competitionseason/competitionseason';
@Injectable()
export class CompetitionSeasonSearchService {
    constructor(private http: Http) {}
    search(term: string): Observable<CompetitionSeason[]> {
        return this.http
            .get(`app/competitionseasons/?name=${term}`)
            .map((r: Response) => r.json().data as CompetitionSeason[]);
    }
}