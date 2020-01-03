import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { environment } from '../../environments/environment';

export class APIRepository {

    protected apiurl: string = environment.apiurl;

    constructor() {
    }

    getApiUrl(): string {
        return this.apiurl;
    }

    getHeaders(): HttpHeaders {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
        headers = headers.append('X-Api-Version', '17');

        const token = this.getToken();
        if (token !== undefined) {
            headers = headers.append('Authorization', 'Bearer ' + token);
        }
        return headers;
    }

    protected getToken(): string {
        const localStorageAuth = localStorage.getItem('auth');
        const auth = localStorageAuth !== null ? JSON.parse(localStorageAuth) : undefined;
        if (auth !== undefined && auth.token !== undefined) {
            return auth.token;
        }
        return undefined;
    }

    protected handleError(response: HttpErrorResponse): Observable<any> {
        console.log(response);
        let errortext;
        if (!navigator.onLine) {
            errortext = 'er kan geen internet verbinding gemaakt worden';
        } else if (response.status === 0) {
            errortext = 'er kan geen verbinding met de data-service gemaakt worden, ververs de pagina';
        }
        return observableThrowError(errortext);
    }
}