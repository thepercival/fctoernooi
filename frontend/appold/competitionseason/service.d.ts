import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { AuthenticationService } from '../auth/service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { CompetitionSeason } from '../voetbal/competitionseason';
import { VoetbalServiceInterface } from '../voetbal/service.interface';
export declare class CompetitionSeasonService implements VoetbalServiceInterface {
    private http;
    private authService;
    private headers;
    private competitionseasonsUrl;
    constructor(http: Http, authService: AuthenticationService);
    getObjects(): Observable<CompetitionSeason[]>;
    getObject(id: number): Observable<CompetitionSeason>;
    createObject(object: any): Observable<CompetitionSeason>;
    updateObject(object: CompetitionSeason): Observable<CompetitionSeason>;
    deleteObject(id: number): Observable<void>;
}
