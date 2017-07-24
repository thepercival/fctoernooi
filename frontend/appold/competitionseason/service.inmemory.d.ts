import { InMemoryDbService } from 'angular-in-memory-web-api';
import { CompetitionSeason } from '../voetbal/competitionseason';
import { Observable } from 'rxjs/Rx';
import { VoetbalServiceInterface } from '../voetbal/service.interface';
export declare class CompetitionSeasonInMemoryService implements InMemoryDbService, VoetbalServiceInterface {
    private demoCompetitionSeason;
    private objects;
    createDb(): CompetitionSeason[];
    getObjects(): Observable<CompetitionSeason[]>;
    getObject(id: number): Observable<CompetitionSeason>;
    createObject(object: any): Observable<CompetitionSeason>;
    updateObject(object: CompetitionSeason): Observable<CompetitionSeason>;
    deleteObject(id: number): Observable<void>;
}
