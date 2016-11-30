import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { CompetitionSeason } from '../voetbal/competitionseason';
import {Observable} from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { VoetbalServiceInterface } from '../voetbal/service.interface';

@Injectable()
export class CompetitionSeasonInMemoryService implements InMemoryDbService, VoetbalServiceInterface {
    createDb() {
        let competitionseasons = [
            { id: 11, name: 'EK', seasonname: '2012/2013', structure:'{}' },
            { id: 12, name: 'WK', seasonname: '2013/2014', structure:'{}' },
            { id: 13, name: 'DK', seasonname: '2012/2013', structure:'{}' },
            { id: 14, name: 'AK', seasonname: '2010/2011', structure:'{}' },
            { id: 15, name: 'AW', seasonname: '2010/2011', structure:'{}' },
            { id: 16, name: 'QW', seasonname: '2010/2011', structure:'{}' }
        ];
        return {competitionseasons};
    }

    // interface
    getObjects(): Observable<CompetitionSeason[]> {
        return Rx.Observable.create( ( observer ) => {
            let css = [];
            var cs = new CompetitionSeason(); cs.name = 'asas'; cs.seasonName = 'asassn';
            css.push();
            return css;
        });
    }

    getObject(id: number): Observable<CompetitionSeason> {

        return Rx.Observable.create( ( observer ) => {
            var cs = new CompetitionSeason(); cs.name = 'asas'; cs.seasonName = 'asassn';
            return cs;
        });
    }

    createObject( properties: {} ): Observable<CompetitionSeason> {
        return Rx.Observable.create( ( observer ) => {
            var competitionSeason = new CompetitionSeason();
            competitionSeason.name = 'test';
            competitionSeason.seasonName = 'testsn';
            observer.next( competitionSeason );

            return () => new CompetitionSeason()
        });

        // properties.nrofteams
        // create teams and rounds by nrofteams
        // competitionSeason.nrofteamsseasonName = seasonname;
        // return competitionSeason;
    }
}
