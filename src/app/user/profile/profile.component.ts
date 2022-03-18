import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

import { IAlert, IAlertType } from '../../shared/common/alert';
import { User } from '../../lib/user';
import { PasswordValidation } from '../password-validation';
import { UserRepository } from '../../lib/user/repository';
import { AuthService } from '../../lib/auth/auth.service';
import { MyNavigation } from '../../shared/common/navigation';
import { JsonUser } from '../../lib/user/mapper';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  alert: IAlert | undefined;
  processing = true;
  user!: User;
  form: FormGroup;

  validations: UserValidations = {
    minlengthemailaddress: User.MIN_LENGTH_EMAIL,
    maxlengthemailaddress: User.MAX_LENGTH_EMAIL
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private userRepository: UserRepository,
    public myNavigation: MyNavigation,
    fb: FormBuilder
  ) {
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
        error: (e) => {
          this.setAlert(IAlertType.Danger, e); this.processing = false;
        },
        complete: () => this.processing = false
      });
  }

  protected setAlert(type: IAlertType, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  protected resetAlert() {
    this.alert = undefined;
  }

  protected formToJson(): JsonUser {
    return {
      id: this.user.getId(),
      validated: this.user.getValidated(),
      nrOfCredits: this.user.getNrOfCredits(),
      validateIn: this.user.getValidateIn(),
      emailaddress: this.form.controls.emailaddress.value
    }
  }

  save(): boolean {
    this.processing = true;


    this.userRepository.editObject(this.formToJson())
      .subscribe({
        next: (user: User) => {
          this.setAlert(IAlertType.Success, 'het emailadres is opgeslagen');
          this.form.controls.emailaddress.setValue(user.getEmailaddress());
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, 'het opslaan is niet gelukt: ' + e); this.processing = false;
        },
        complete: () => {
          this.processing = false
        }
      });
    return false;
  }

  remove() {
    this.processing = true;
    this.userRepository.removeObject(this.user.getId())
      .subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['']);
        },
        error: (e) => {
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
