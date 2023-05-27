import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

import { IAlert, IAlertType } from '../../shared/common/alert';
import { User } from '../../lib/user';
import { UserRepository } from '../../lib/user/repository';
import { MyNavigation } from '../../shared/common/navigation';
import { PaymentRepository } from '../../lib/payment/repository';
import { asyncScheduler, catchError, concat, from, interval, map, merge, observeOn, of, Scheduler, SchedulerAction, Subscription, switchMap, take, timer } from 'rxjs';
import { UserComponent } from '../component';
import { AuthService } from '../../lib/auth/auth.service';
import { AppErrorHandler } from '../../lib/repository';
import { Action } from 'rxjs/internal/scheduler/Action';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
@Component({
  selector: 'app-awaitpayment',
  templateUrl: './awaitpayment.component.html',
  styleUrls: ['./awaitpayment.component.css']
})
export class AwaitPaymentComponent extends UserComponent implements OnInit, OnDestroy {
  public nrOfCredits: number = 0;
  public errorAlert: IAlert | undefined;
  refreshTimer: Subscription | undefined;
  private appErrorHandler: AppErrorHandler;


  constructor(
    route: ActivatedRoute,
    router: Router,
    userRepository: UserRepository,
    authService: AuthService,
    globalEventsManager: GlobalEventsManager,
    private paymentRepository: PaymentRepository,
    public myNavigation: MyNavigation
  ) {
    super(route, router, userRepository, authService, globalEventsManager);
    this.appErrorHandler = new AppErrorHandler();
  }

  ngOnInit() {
    this.setAlert(IAlertType.Info, 'je betaling wordt verwerkt, dit kan enkele seconden tot minuten duren ..');

    this.route.params.subscribe(params => {
      if (params.paymentId !== undefined) {
        this.refreshTimer = timer(0, 2000) // repeats every 2 seconds
        .pipe(
          switchMap((value: number) => {
            if (!this.validTimeValue(value)) {
              return of();
            }

            // doe een status check naar de params.paymentId
            // wanneer deze niet meer de status 'created', doe dan eenmalig this.userRepository.getLoggedInObject().pipe()
            return this.userRepository.getLoggedInObject().pipe();
          }),
          catchError(err => this.appErrorHandler.handleError(err))
        ).subscribe({
          next: ((user: User | undefined) => {
            if (user === undefined) {
              this.stopTimer();
              return;
            }
            if (user.getNrOfCredits() > 0) {
              this.stopTimer();
              this.nrOfCredits = user.getNrOfCredits();
              this.setAlert(IAlertType.Success, 'je hebt weer credits om een toernooi aan te maken');
            }
          }),
          error: (e: string) => {
            this.errorAlert = { type: IAlertType.Danger, message: e };
            this.resetAlert();
            this.stopTimer();
          }
        });
      }
    });    
  }


  validTimeValue(count: number): boolean {
    return count <= 5 || (count % 10) === 0;
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  stopTimer() {
    if (this.refreshTimer !== undefined) {
      this.refreshTimer.unsubscribe();
    }
    this.processing = false;
  }

  protected setAlert(type: IAlertType, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  protected resetAlert() {
    this.alert = undefined;
  }

  navigateBack() {
    this.myNavigation.back();
  }
}

class CustomTask extends Subscription {
  public schedule(state?: string, delay: number = 0): Subscription {
    return this;
  }
}