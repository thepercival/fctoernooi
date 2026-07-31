import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';

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
import { Payment } from '../../lib/payment/json';
import { PaymentState } from '../../lib/payment/state';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
@Component({
    selector: 'app-paymentresult',
    templateUrl: './paymentresult.component.html',
    styleUrls: ['./paymentresult.component.css'],
  imports: [FontAwesomeModule, NgbAlert, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentResultComponent extends UserComponent implements OnInit, OnDestroy {
  private paymentRepository = inject(PaymentRepository);
  myNavigation = inject(MyNavigation);

  faSpinner = faSpinner;
  public errorAlert: IAlert | undefined;
  refreshTimer: Subscription | undefined;
  private appErrorHandler: AppErrorHandler;

  constructor() {
    const route = inject(ActivatedRoute);
    const router = inject(Router);
    const userRepository = inject(UserRepository);
    const authService = inject(AuthService);
    const globalEventsManager = inject(GlobalEventsManager);

    super(route, router, userRepository, authService, globalEventsManager);
    this.appErrorHandler = new AppErrorHandler(router);
  }

  ngOnInit() {
    this.setAlert(IAlertType.Info, 'je betaling wordt verwerkt, dit kan enkele seconden duren ..');

    this.route.params.subscribe(params => {
      if (params.paymentId !== undefined) {
        this.paymentRepository.getObject( '' + params.paymentId)
          .subscribe({
            next: (payment: Payment) => {              
              //console.log(payment);
              if( payment.state === PaymentState.Paid ) {
                this.setAlert(IAlertType.Success, 'je betaling is geslaagd');
              } else {
                this.setAlert(IAlertType.Success, 'je betaling is niet geslaagd');
              }
            },
            error: (e) => {
              this.setAlert(IAlertType.Danger, 'geen checkoutUrl van backend gekregen: ' + e);
              this.processing.set(false);
            },
            complete: () => this.processing.set(false)
          });
      }
    });
      
  };

   



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
    this.processing.set(false);
  }

  protected setAlert(type: IAlertType, message: string) {
    this.alert.set({ 'type': type, 'message': message });
  }

  protected resetAlert() {
    this.alert.set(undefined);
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