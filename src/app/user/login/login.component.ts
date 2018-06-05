import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { IAlert } from '../../app.definitions';
import { AuthService } from '../../auth/auth.service';
import { User } from '../user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  alert: IAlert;
  registered = false;
  processing = true;
  customForm: FormGroup;

  validations: any = {
    minlengthemailaddress: User.MIN_LENGTH_EMAIL,
    maxlengthemailaddress: User.MAX_LENGTH_EMAIL,
    minlengthpassword: User.MIN_LENGTH_PASSWORD,
    maxlengthpassword: User.MAX_LENGTH_PASSWORD
  };

  protected sub: Subscription;
  // activationmessage: string;

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

    });
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  ngOnInit() {
    this.sub = this.activatedRoute.queryParams.subscribe(
      (param: any) => {
        if (param.message !== undefined) {
          this.setAlert('info', param.message);
        }
      });
    if (this.isLoggedIn() === true) {
      this.setAlert('danger', 'je bent al ingelogd');
    }
    this.processing = false;
  }

  protected setAlert(type: string, message: string) {
    this.alert = { 'type': type, 'message': message };
  }

  protected resetAlert() {
    this.alert = undefined;
  }

  login() {
    this.processing = true;
    this.setAlert('info', 'je wordt ingelogd');

    const emailaddress = this.customForm.controls.emailaddress.value;
    const password = this.customForm.controls.password.value;

    this.authService.login(emailaddress, password)
      .subscribe(
            /* happy path */ p => {
          this.router.navigate(['/']);
        },
            /* error path */ e => { this.setAlert('danger', 'het inloggen is niet gelukt: ' + e); this.processing = false; },
            /* onComplete */() => this.processing = false
      );
  }

  ngOnDestroy() {
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
  }

}
