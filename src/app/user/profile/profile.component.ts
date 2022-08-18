import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

import { IAlertType } from '../../shared/common/alert';
import { User } from '../../lib/user';
import { PasswordValidation } from '../password-validation';
import { UserRepository } from '../../lib/user/repository';
import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { JsonUser } from '../../lib/user/mapper';
import { UserComponent } from '../component';
import { GlobalEventsManager } from '../../shared/common/eventmanager';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent extends UserComponent implements OnInit {
  form: UntypedFormGroup;

  validations: UserValidations = {
    minlengthemailaddress: User.MIN_LENGTH_EMAIL,
    maxlengthemailaddress: User.MAX_LENGTH_EMAIL
  };

  constructor(
    route: ActivatedRoute,
    router: Router,
    userRepository: UserRepository,
    authService: AuthService,
    public myNavigation: MyNavigation,
    globalEventsManager: GlobalEventsManager,
    fb: UntypedFormBuilder
  ) {
    super(route, router, userRepository, authService, globalEventsManager);
    this.form = fb.group({
      emailaddress: ['', Validators.compose([
        Validators.required,
        Validators.minLength(this.validations.minlengthemailaddress),
        Validators.maxLength(this.validations.maxlengthemailaddress)
      ])],
    }, {
      validator: PasswordValidation.MatchPassword // your validation method
    });
  }

  ngOnInit() {
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
          this.form.controls.emailaddress.setValue(this.user.getEmailaddress());
        },
        error: (e: string) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
        },
        complete: () => this.processing = false
      });
  }

  protected formToJson(user: User): JsonUser {
    return {
      id: user.getId(),
      validated: user.getValidated(),
      nrOfCredits: user.getNrOfCredits(),
      validateIn: user.getValidateIn(),
      emailaddress: this.form.controls.emailaddress.value
    }
  }

  save(user: User): boolean {
    this.processing = true;


    this.userRepository.editObject(this.formToJson(user))
      .subscribe({
        next: (user: User) => {
          this.setAlert(IAlertType.Success, 'het emailadres is opgeslagen');
          this.form.controls.emailaddress.setValue(user.getEmailaddress());
        },
        error: (e: string) => {
          this.setAlert(IAlertType.Danger, 'het opslaan is niet gelukt: ' + e); this.processing = false;
        },
        complete: () => {
          this.processing = false
        }
      });
    return false;
  }

  remove(user: User) {
    this.processing = true;
    this.userRepository.removeObject(user.getId())
      .subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['']);
        },
        error: (e: string) => {
          this.setAlert(IAlertType.Danger, 'het opslaan is niet gelukt: ' + e); this.processing = false;
        },
        complete: () => this.processing = false
      });
  }
}

export interface UserValidations {
  minlengthemailaddress: number;
  maxlengthemailaddress: number;
}
