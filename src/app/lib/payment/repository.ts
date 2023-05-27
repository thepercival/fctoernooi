import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../repository';
import { CreditCardPayment, IDealIssuer, IDealPayment } from './json';

@Injectable({
  providedIn: 'root'
})
export class PaymentRepository extends APIRepository {

  constructor(
    private http: HttpClient) {
    super();
  }

  getUrlpostfix(): string {
    return 'payments';
  }

  getUrl(): string {
    return super.getApiUrl() + this.getUrlpostfix() + '/';
  }

  getMethods(): Observable<string[]> {
    return this.http.get<string[]>(this.getUrl() + 'methods', this.getOptions()).pipe(
      // map((methods: string[]) => {return methods;}),
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  getIDealIssuers(): Observable<IDealIssuer[]> {
    return this.http.get<IDealIssuer[]>(this.getUrl() + 'idealissuers', this.getOptions()).pipe(
      map((iDealIssuers: IDealIssuer[]) => {
        return iDealIssuers;
      }),
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  buyCredits(jsonPayment: IDealPayment | CreditCardPayment): Observable<string> {
    const url = this.getUrl() + 'buycredits?method=' + jsonPayment.method;
    return this.http.post<string>(url, jsonPayment, { headers: super.getHeaders() }).pipe(
      map((jsonCheckoutUrl: any) => jsonCheckoutUrl.checkoutUrl),
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  getMostRecentCreatedPayment(): Observable<string> {
    const url = this.getUrl() + 'mostrecentcreatedpayment';
    return this.http.get<string>(url, { headers: super.getHeaders() }).pipe(
      map((jsonPayment: any) => jsonPayment.id),
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  
}
