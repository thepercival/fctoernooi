import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { CompetitionSeason } from './competitionseason';

@Injectable()
export class CompetitionSeasonService {

    private headers = new Headers({'Content-Type': 'application/json'});
    private competitionseasonsUrl = 'app/competitionseasons';  // URL to web api

    constructor(private http: Http) { }

    getCompetitionSeasons(): Promise<CompetitionSeason[]> {
        return this.http.get(this.competitionseasonsUrl)
            .toPromise()
            .then(response => response.json().data as CompetitionSeason[])
            .catch(this.handleError);
    }

    getCompetitionSeasonsSlow(): Promise<CompetitionSeason[]> {
        return new Promise<CompetitionSeason[]>(resolve =>
            setTimeout(resolve, 2000)) // delay 2 seconds
            .then(() => this.getCompetitionSeasons());
    }

    getCompetitionSeason(id: number): Promise<CompetitionSeason> {
        return this.getCompetitionSeasonsSlow()
            .then(competitionseasons => competitionseasons.find(competitionseason => competitionseason.id === id));
    }

    create(name: string): Promise<CompetitionSeason> {
        return this.http
            .post(this.competitionseasonsUrl, JSON.stringify({name: name}), {headers: this.headers})
            .toPromise()
            .then(res => res.json().data)
            .catch(this.handleError);
    }

    update(competitionseason: CompetitionSeason): Promise<CompetitionSeason> {
        const url = `${this.competitionseasonsUrl}/${competitionseason.id}`;
        return this.http
            .put(url, JSON.stringify(competitionseason), {headers: this.headers})
            .toPromise()
            .then(() => competitionseason)
            .catch(this.handleError);
    }

    delete(id: number): Promise<void> {
        const url = `${this.competitionseasonsUrl}/${id}`;
        return this.http.delete(url, {headers: this.headers})
            .toPromise()
            .then(() => null)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }


}
