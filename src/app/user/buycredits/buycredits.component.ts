import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

import { IAlertType } from '../../shared/common/alert';
import { User } from '../../lib/user';
import { UserRepository } from '../../lib/user/repository';
import { MyNavigation } from '../../shared/common/navigation';
import { PaymentRepository } from '../../lib/payment/repository';
import { Observable, of } from 'rxjs';
import { CreditCardPayment, IDealIssuer, IDealPayment, PaymentMethod } from '../../lib/payment/json';
import { UserComponent } from '../component';
import { AuthService } from '../../lib/auth/auth.service';
import { GlobalEventsManager } from '../../shared/common/eventmanager';
@Component({
  selector: 'app-buycredits',
  templateUrl: './buycredits.component.html',
  styleUrls: ['./buycredits.component.css']
})
export class BuyCreditsComponent extends UserComponent implements OnInit {
  purpose: Purpose | undefined;
  form: FormGroup;
  public paymentMethods!: Observable<string[]>;
  public idealIssuers!: Observable<IDealIssuer[]>;
  public nrOfCreditsOptions!: Observable<number[]>;
  constructor(
    route: ActivatedRoute,
    router: Router,
    userRepository: UserRepository,
    authService: AuthService,
    globalEventsManager: GlobalEventsManager,
    private paymentRepository: PaymentRepository,
    public myNavigation: MyNavigation,
    fb: FormBuilder
  ) {
    super(route, router, userRepository, authService, globalEventsManager);
    this.form = fb.group({
      purpose: ['', Validators.required],
      nrOfCredits: ['', Validators.compose([
        Validators.required,
        Validators.min(1),
        Validators.max(100)
      ])],
      paymentMethod: ['', Validators.compose([
        Validators.required
      ])],
      iDealIssuer: ['', Validators.compose([
      ])],
      cardNumber: ['', Validators.compose([
        Validators.maxLength(19)
      ])],
      cvc: ['', Validators.compose([
        Validators.maxLength(3)
      ])],
      agreed: [false, Validators.compose([
      ])],
    });
  }

  ngOnInit() {
    this.nrOfCreditsOptions = of([3, 5, 10, 15, 20, 35, 50, 100]);
    this.paymentMethods = this.paymentRepository.getMethods();
    this.idealIssuers = this.paymentRepository.getIDealIssuers();
    this.userRepository.getLoggedInObject()
      .subscribe({
        next: (loggedInUser: User | undefined) => {
          if (loggedInUser === undefined) {
            const navigationExtras: NavigationExtras = {
              queryParams: { type: IAlertType.Danger, message: 'je bent niet ingelogd' }
            };
            this.router.navigate([''], navigationExtras);
            return;
          }
          this.user = loggedInUser;
        },
        error: (e: string) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
        },
        complete: () => this.processing = false
      });

    this.processing = false;
  }

  canPay(): boolean {
    return this.canAgree() && this.form.controls.agreed.value;
  }

  canAgree(): boolean {
    return this.getPaymentFromForm() !== undefined;
  }

  getPaymentFromForm(): IDealPayment | CreditCardPayment | undefined {
    // console.log(this.form.controls.nrOfCredits.value);
    // console.log(this.form.controls.paymentMethod.value);
    // console.log(this.form.controls.iDealIssuer.value?.name?.length > 0);
    if (!this.form.controls.nrOfCredits.value) {
      return undefined;
    }
    if (this.form.controls.paymentMethod.value === PaymentMethod.IDeal
      && this.form.controls.iDealIssuer.value?.name?.length > 0) {
      return {
        amount: this.form.controls.nrOfCredits.value * 0.5,
        method: PaymentMethod.IDeal,
        issuer: this.form.controls.iDealIssuer.value
      };
    } else if (this.form.controls.paymentMethod.value === PaymentMethod.CreditCard) {
      return {
        amount: this.form.controls.nrOfCredits.value * 0.5,
        method: PaymentMethod.CreditCard,
        cardNumber: this.form.controls.cardNumber.value,
        cvc: this.form.controls.cvc.value
      };
    }
    /* if (this.form.controls.paymentMethod.value === PaymentMethod.CreditCard
       && this.form.controls.cardNumber.value?.name?.length > 0) {
       return {
         amount: this.form.controls.nrOfCredits.value * 0.5,
         cardNumber: this.form.controls.cardNumber.value
       };
     }*/
    return undefined;
  }

  // getPaymentMethods(): string[] {
  //   if (this.paymentMethods !== undefined) {
  //     return 
  //   }
  //   this.paymentRepository.getMethods()
  //     .subscribe({
  //       next: (methods: string[]) => {
  //         this.paymentMethods = methods;
  //       },
  //       error: (e: string) => {
  //         this.setAlert(IAlertType.Danger, e); this.processing = false;
  //       },
  //       complete: () => this.processing = false
  //     });
  // }


  get PersonalPurpose(): number { return Purpose.Personal; }
  get OrganizationPurpose(): number { return Purpose.Organization; }
  get PaymentMethodIDeal(): string { return PaymentMethod.IDeal; }
  get PaymentMethodCreditCard(): string { return PaymentMethod.CreditCard; }

  navigateBack() {
    this.myNavigation.back();
  }



  pay(): boolean {
    const jsonPayment = this.getPaymentFromForm();
    if (jsonPayment === undefined) {
      return false;
    }

    this.setAlert(IAlertType.Info, 'je wordt doorgestuurd naar de betaalpagina..');
    this.processing = true;

    this.paymentRepository.buyCredits(jsonPayment)
      .subscribe({
        next: (checkOutUrl: string) => {
          window.open(checkOutUrl, '_blank');
          this.router.navigate(['/user/awaitpayment']);
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, 'de instellingen zijn niet opgeslagen: ' + e);
          this.processing = false;
        }
      });

    return true;
  }
}

enum Purpose {
  Personal = 1, Organization
}