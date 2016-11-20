import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
export declare class AuthenticationService {
    private http;
    token: string;
    private authUrl;
    constructor(http: Http);
    login(username: any, password: any): Observable<boolean>;
    logout(): void;
}
