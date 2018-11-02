import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { IAlert } from '../../app.definitions';
import { AuthService } from '../../auth/auth.service';
import { PasswordValidation } from '../password-validation';
import { User } from '../user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  alert: IAlert;
  registered = false;
  processing = true;
  customForm: FormGroup;

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
    this.customForm = fb.group({
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

  protected setAlert(type: string, message: string) {
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
    this.setAlert('info', 'de registratie wordt opgeslagen');

    const emailaddress = this.customForm.controls.emailaddress.value;
    const password = this.customForm.controls.password.value;

    // this.activationmessage = undefined;
    this.authService.register({ emailaddress: emailaddress, password: password })
      .subscribe(
            /* happy path */ p => {
          this.registered = true;
          this.resetAlert();
        },
            /* error path */ e => { this.setAlert('danger', 'het registreren is niet gelukt: ' + e); this.processing = false; },
            /* onComplete */() => this.processing = false
      );
    return false;
  }
}

export interface UserValidations {
  minlengthemailaddress: number;
  maxlengthemailaddress: number;
  minlengthpassword: number;
  maxlengthpassword: number;
}
