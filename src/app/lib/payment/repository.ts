import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIRepository } from '../repository';
import { CreditCardPayment, IDealIssuer, IDealPayment, Payment } from './json';
import { User } from '../user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PaymentRepository extends APIRepository {

  constructor(
    private http: HttpClient, router: Router) {
    super(router);
  }

  getUrlpostfix(): string {
    return 'payments';
  }

  getUrl(paymentId: string|undefined = undefined): string {
    return super.getApiUrl() + this.getUrlpostfix() + ( paymentId ? '/' + paymentId : '' );
  }

  getObject(paymentId: string): Observable<Payment> {
    return this.http.get<Payment>(this.getUrl(paymentId), this.getOptions()).pipe(
        catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  getObjects(user: User): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.getUrl(), this.getOptions()).pipe(
        catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  getMethods(): Observable<string[]> {
    return this.http.get<string[]>(this.getUrl() + '/methods', this.getOptions()).pipe(
      // map((methods: string[]) => {return methods;}),
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  getIDealIssuers(): Observable<IDealIssuer[]> {
    return this.http.get<IDealIssuer[]>(this.getUrl() + '/idealissuers', this.getOptions()).pipe(
      map((iDealIssuers: IDealIssuer[]) => {
        return iDealIssuers;
      }),
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  buyCredits(jsonPayment: IDealPayment | CreditCardPayment): Observable<string> {
    const url = this.getUrl() + '/buycredits?method=' + jsonPayment.method;
    return this.http.post<string>(url, jsonPayment, { headers: super.getHeaders() }).pipe(
      map((jsonCheckoutUrl: any) => jsonCheckoutUrl.checkoutUrl),
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }

  getMostRecentCreatedPayment(): Observable<Payment> {
    const url = this.getUrl() + '/mostrecentcreatedpayment';
    return this.http.get<string>(url, { headers: super.getHeaders() }).pipe(
      catchError((err: HttpErrorResponse) => this.handleError(err))
    );
  }  
}
