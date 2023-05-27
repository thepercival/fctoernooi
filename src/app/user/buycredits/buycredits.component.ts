import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  public typedForm: FormGroup<{
    purpose: FormControl<number>,
    nrOfCredits: FormControl<number>,
    paymentMethod: FormControl<string>,
    iDealIssuer: FormControl<IDealIssuer | null>,
    cardNumberPart1: FormControl<string>,
    cardNumberPart2: FormControl<string>,
    cardNumberPart3: FormControl<string>,
    cardNumberPart4: FormControl<string>,
    expiryMonth: FormControl<string>,
    expiryYear: FormControl<string>,
    cvc: FormControl<string>,
    agreed: FormControl<boolean>
  }>;
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
    public myNavigation: MyNavigation
  ) {
    super(route, router, userRepository, authService, globalEventsManager);
    this.typedForm = new FormGroup(
      {
        purpose: new FormControl(Purpose.Personal, { nonNullable: true, validators: 
          [
              Validators.required
          ] 
        }),
        nrOfCredits: new FormControl(3, { nonNullable: true, validators: 
          [
            Validators.required,
            Validators.min(3),
            Validators.max(100)
          ] 
        }),
        paymentMethod: new FormControl('', { nonNullable: true, validators: 
          [
              Validators.required
          ] 
        }),
        iDealIssuer: new FormControl(),
        cardNumberPart1: new FormControl('', { nonNullable: true, validators: 
          [Validators.minLength(4),Validators.maxLength(4)] 
        }),
        cardNumberPart2: new FormControl('', { nonNullable: true, validators: 
          [Validators.minLength(4),Validators.maxLength(4)]  
        }),
        cardNumberPart3: new FormControl('', { nonNullable: true, validators: 
          [Validators.minLength(4),Validators.maxLength(4)]  
        }),
        cardNumberPart4: new FormControl('', { nonNullable: true, validators: 
          [Validators.minLength(4),Validators.maxLength(4)]  
        }),
        expiryMonth: new FormControl('', { nonNullable: true, validators: 
          [
            Validators.maxLength(2)
          ] 
        }),
        expiryYear: new FormControl('', { nonNullable: true, validators: 
          [
            Validators.maxLength(2)
          ] 
        }),
        cvc: new FormControl('', { nonNullable: true, validators: 
          [
            Validators.maxLength(3)
          ] 
        }),
        agreed: new FormControl(false, { nonNullable: true, validators: 
          [
          ] 
        }),        
      }      
    );
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
    return this.canAgree() && this.typedForm.controls.agreed.value;
  }

  canAgree(): boolean {
    return this.getPaymentFromForm() !== undefined;
  }

  getPaymentFromForm(): IDealPayment | CreditCardPayment | undefined {
    // console.log(this.form.controls.nrOfCredits.value);
    // console.log(this.form.controls.paymentMethod.value);
    // console.log(this.form.controls.iDealIssuer.value?.name?.length > 0);
    if (!this.typedForm.controls.nrOfCredits.value) {
      return undefined;
    }
    console.log(this.typedForm.controls.iDealIssuer.value);
    if (this.typedForm.controls.paymentMethod.value === PaymentMethod.IDeal
      && this.typedForm.controls.iDealIssuer.value !== null) {
      return {
        amount: this.typedForm.controls.nrOfCredits.value * 0.5,
        method: PaymentMethod.IDeal,
        issuer: this.typedForm.controls.iDealIssuer.value
      };
    } else if (this.typedForm.controls.paymentMethod.value === PaymentMethod.CreditCard) {
      const cardNumber = this.typedForm.controls.cardNumberPart1.value + '-'
                        this.typedForm.controls.cardNumberPart2.value + '-'
                        this.typedForm.controls.cardNumberPart3.value + '-'
                        this.typedForm.controls.cardNumberPart4.value
      return {
        amount: this.typedForm.controls.nrOfCredits.value * 0.5,
        method: PaymentMethod.CreditCard,
        cardNumber,
        cvc: this.typedForm.controls.cvc.value
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

          this.paymentRepository.getMostRecentCreatedPayment()
          .subscribe({
            next: (paymentId: string) => {
              this.router.navigate(['/user/awaitpayment', paymentId]);
            }
          });          
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, 'geen checkoutUrl van backend gekregen: ' + e);
          this.processing = false;
        }
      });

    return true;
  }
}

enum Purpose {
  Personal = 1, Organization
}