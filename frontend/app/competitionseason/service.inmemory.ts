import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { CompetitionSeason } from '../voetbal/competitionseason';
import {Observable} from 'rxjs/Rx';
import * as Rx from 'rxjs/Rx';
import { VoetbalServiceInterface } from '../voetbal/service.interface';
import { Participant } from '../voetbal/participant';

@Injectable()
export class CompetitionSeasonInMemoryService implements InMemoryDbService, VoetbalServiceInterface {

    private demoCompetitionSeason : CompetitionSeason;
    private objects : CompetitionSeason[] = [];

    createDb() {
        if ( this.demoCompetitionSeason != null )
            this.objects.push( this.demoCompetitionSeason );
        return this.objects;
    }

    // interface
    getObjects(): Observable<CompetitionSeason[]> {
        return Rx.Observable.create( ( observer ) => {
            return this.objects;
        });
    }

    getObject(id: number): Observable<CompetitionSeason> {

        return Rx.Observable.create( ( observer ) => {
            observer.next( this.demoCompetitionSeason );
        });
    }


    createObject( object: any ): Observable<CompetitionSeason> {
        return Rx.Observable.create( ( observer ) => {
            this.demoCompetitionSeason = new CompetitionSeason();
            this.demoCompetitionSeason.id = 0;
            this.demoCompetitionSeason.name = object.name;
            this.demoCompetitionSeason.seasonname = object.seasonname;

            for (var n = 1; n <= object.nrofteams ; n++)
            {
                this.demoCompetitionSeason.participants.push( new Participant( "deelnemer " + n ) );
            }
            this.objects.push( this.demoCompetitionSeason );
            observer.next( this.demoCompetitionSeason );
        });
    }

    updateObject( object: CompetitionSeason): Observable<CompetitionSeason> {

        return Rx.Observable.create( ( observer ) => {
            if ( this.demoCompetitionSeason == null )
                this.demoCompetitionSeason = new CompetitionSeason();
            this.demoCompetitionSeason.name = object.name;
            this.demoCompetitionSeason.seasonname = object.seasonname;
            observer.next( this.demoCompetitionSeason );
            /*return () => this.demoCompetitionSeason*/
        });
    }

    deleteObject(id: number): Observable<void> {
        return Rx.Observable.create( ( observer ) => {
            observer.next( null );
            /*return () => null*/
        });
    }
}
