import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../lib/auth/auth.service';
import { IAlert, IAlertType } from '../../shared/common/alert';
import { User } from '../../lib/user';
import { PasswordValidation } from '../password-validation';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  alert: IAlert | undefined;
  registered = false;
  processing = true;
  form: FormGroup;

  validations: UserValidations = {
    minlengthemailaddress: User.MIN_LENGTH_EMAIL,
    maxlengthemailaddress: User.MAX_LENGTH_EMAIL,
    minlengthpassword: User.MIN_LENGTH_PASSWORD,
    maxlengthpassword: User.MAX_LENGTH_PASSWORD
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    fb: FormBuilder
  ) {
    this.form = fb.group({
      emailaddress: ['', Validators.compose([
        Validators.required,
        Validators.minLength(this.validations.minlengthemailaddress),
        Validators.maxLength(this.validations.maxlengthemailaddress)
      ])],
      password: ['', Validators.compose([
        Validators.required,
        Validators.minLength(this.validations.minlengthpassword),
        Validators.maxLength(this.validations.maxlengthpassword)
      ])],
      passwordRepeat: ['', Validators.compose([
        Validators.required,
        Validators.minLength(this.validations.minlengthpassword),
        Validators.maxLength(this.validations.maxlengthpassword)
      ])],
    }, {
      validator: PasswordValidation.MatchPassword // your validation method
    });
  }

  ngOnInit() {
    this.processing = false;
  }

  protected setAlert(type: IAlertType, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  protected resetAlert() {
    this.alert = undefined;
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  register(): boolean {
    this.processing = true;
    this.setAlert(IAlertType.Info, 'de registratie wordt opgeslagen');

    const emailaddress = this.form.controls.emailaddress.value;
    const password = this.form.controls.password.value;

    // this.activationmessage = undefined;
    this.authService.register({ emailaddress: emailaddress, password: password })
      .subscribe({
        next: (registered) => {
          this.registered = registered;
          this.resetAlert();
        },
        error: (e) => {
          this.setAlert(IAlertType.Danger, 'het registreren is niet gelukt: ' + e); this.processing = false;
        },
        complete: () => this.processing = false
      });
    return false;
  }
}

export interface UserValidations {
  minlengthemailaddress: number;
  maxlengthemailaddress: number;
  minlengthpassword: number;
  maxlengthpassword: number;
}
